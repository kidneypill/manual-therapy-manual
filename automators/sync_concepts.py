#!/usr/bin/env python3
"""
sync_concepts.py — /Concepts 변경사항 감지 및 /Conditions 섹션 파일 동기화

Concept 파일이 수정되면, 해당 내용을 /Conditions/{slug}/ 의 섹션 파일들에 반영한다.

섹션 매핑:
  # 1. 개념     (## 1-3 제외)  →  Overview.md
  ## 1-3. 기전               →  Mechanism.md
  # 2. 진단 및 평가           →  Assessment.md
  # 3. 치료                  →  Treatment.md   (없으면 생성)
  # 4. 예후                  →  Prognosis.md   (없으면 생성)

사용법:
    python sync_concepts.py               # 변경된 파일만 동기화
    python sync_concepts.py --dry-run     # 변경 없이 미리보기
    python sync_concepts.py --force       # 모든 Concept 파일 강제 동기화
    python sync_concepts.py --file Concept-Foot-Overpronation.md
"""

import sys
import io
import re
import json
import hashlib
import argparse
import subprocess
from pathlib import Path
from datetime import date
from typing import Optional

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

try:
    import yaml
except ImportError:
    print("[FATAL] PyYAML이 설치되지 않았습니다: pip install pyyaml")
    sys.exit(2)

# ── 상수 ─────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
MEDICAL_DATA = REPO_ROOT / "medicalData"
CONCEPTS_DIR = MEDICAL_DATA / "Concepts"
CONDITIONS_DIR = MEDICAL_DATA / "Conditions"
HASH_FILE = SCRIPT_DIR / ".concept-hashes.json"

# 섹션 헤더 → (Condition 파일명, 새 파일 생성 시 section_type)
SECTION_FILE_MAP: list[tuple[str, str, str]] = [
    # (헤더 패턴,         파일명,          section_type)
    (r"^# 1\.",          "Overview.md",   "OVERVIEW"),
    (r"^## 1-3\.",       "Mechanism.md",  "MECHANISM"),
    (r"^# 2\.",          "Assessment.md", "ASSESSMENT"),
    (r"^# 3\.",          "Treatment.md",  "TREATMENT"),
    (r"^# 4\.",          "Prognosis.md",  "PROGNOSIS"),
]

# ── 유틸리티 ──────────────────────────────────────────────────────────────────


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_hashes() -> dict[str, str]:
    if HASH_FILE.exists():
        return json.loads(HASH_FILE.read_text(encoding="utf-8"))
    return {}


def save_hashes(hashes: dict[str, str]) -> None:
    HASH_FILE.write_text(json.dumps(hashes, indent=2, ensure_ascii=False), encoding="utf-8")


def git_changed_concepts() -> Optional[list[Path]]:
    """git diff로 수정된 Concepts/*.md 파일 목록 반환. git 사용 불가 시 None."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--", "medicalData/Concepts/"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0:
            return None
        paths = [REPO_ROOT / p.strip() for p in result.stdout.splitlines() if p.strip()]

        # 스테이지된 변경사항도 포함
        result2 = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--", "medicalData/Concepts/"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result2.returncode == 0:
            staged = [REPO_ROOT / p.strip() for p in result2.stdout.splitlines() if p.strip()]
            paths = list({*paths, *staged})

        return [p for p in paths if p.exists() and p.suffix == ".md"]
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None


def detect_changed_concepts(force: bool = False) -> list[Path]:
    """변경된 Concept 파일 목록을 반환한다."""
    all_concepts = sorted(CONCEPTS_DIR.glob("Concept-*.md"))

    if force:
        print(f"[INFO] --force: {len(all_concepts)}개 Concept 파일 전체 동기화")
        return all_concepts

    # 1차: git diff
    git_changed = git_changed_concepts()
    if git_changed is not None:
        if git_changed:
            print(f"[INFO] git diff에서 {len(git_changed)}개 변경 감지:")
            for p in git_changed:
                print(f"       • {p.name}")
        else:
            print("[INFO] git diff: 변경된 Concept 파일 없음")
        return git_changed

    # 2차 fallback: SHA-256 해시 비교
    print("[INFO] git 사용 불가 → 해시 파일로 변경 감지")
    saved = load_hashes()
    changed: list[Path] = []

    for p in all_concepts:
        current = file_hash(p)
        if saved.get(str(p.relative_to(REPO_ROOT))) != current:
            changed.append(p)

    if changed:
        print(f"[INFO] 해시 비교에서 {len(changed)}개 변경 감지:")
        for p in changed:
            print(f"       • {p.name}")
    else:
        print("[INFO] 해시 비교: 변경된 Concept 파일 없음")

    return changed


# ── Concept 파싱 ──────────────────────────────────────────────────────────────


def split_frontmatter(text: str) -> tuple[dict, str]:
    """YAML 프론트매터와 본문을 분리한다."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_text = text[3:end].strip()
    body = text[end + 4:].lstrip("\n")
    try:
        fm = yaml.safe_load(fm_text) or {}
    except yaml.YAMLError:
        fm = {}
    return fm, body


def extract_concept_sections(body: str) -> dict[str, str]:
    """
    Concept 본문에서 섹션별 내용을 추출한다.

    전략:
    - 각 줄을 스캔하면서 SECTION_FILE_MAP 패턴과 매칭
    - 서브섹션(## 1-3)은 다음 ## 또는 # 헤딩에서 종료
    - Overview.md는 # 1 전체에서 ## 1-3 블록을 제거한 내용

    반환: { "Overview.md": content, "Mechanism.md": content, ... }
    """
    lines = body.splitlines(keepends=True)
    n = len(lines)

    # 헤딩 레벨 감지 헬퍼
    def heading_level(line: str) -> int:
        m = re.match(r"^(#{1,6}) ", line.rstrip())
        return len(m.group(1)) if m else 0

    # SECTION_FILE_MAP 패턴 → (파일명, section_type, 헤딩 레벨)
    compiled: list[tuple[re.Pattern, str, str, int]] = []
    for pattern, filename, stype in SECTION_FILE_MAP:
        compiled.append((re.compile(pattern), filename, stype, 2 if pattern.startswith(r"^##") else 1))

    # 각 섹션의 (start, end) 범위를 찾아 할당
    raw: dict[str, str] = {}

    for ci, (pat, fname, stype, level) in enumerate(compiled):
        # 이 패턴과 매칭되는 첫 번째 줄 찾기
        start = -1
        for i, line in enumerate(lines):
            if pat.match(line.rstrip()):
                start = i
                break
        if start == -1:
            continue

        # 끝 경계: 같은 레벨 이상의 다음 헤딩
        end = n
        for i in range(start + 1, n):
            lvl = heading_level(lines[i])
            if 0 < lvl <= level:
                end = i
                break

        raw[fname] = "".join(lines[start:end]).rstrip()

    # Overview.md에서 ## 1-3 블록 제거
    if "Overview.md" in raw and "Mechanism.md" in raw:
        raw["Overview.md"] = _strip_subsection(raw["Overview.md"], r"^## 1-3\.")

    return {k: v for k, v in raw.items() if v.strip()}


def _strip_subsection(text: str, pattern: str) -> str:
    """text에서 pattern으로 시작하는 ## 헤딩 블록을 제거한다."""
    lines = text.splitlines(keepends=True)
    result: list[str] = []
    skipping = False

    for line in lines:
        stripped = line.rstrip()
        if re.match(pattern, stripped):
            skipping = True
            continue
        if skipping:
            lvl = len(re.match(r"^(#+)", stripped).group(1)) if re.match(r"^#+", stripped) else 0
            if 0 < lvl <= 2:
                skipping = False
        if not skipping:
            result.append(line)

    return "".join(result).rstrip()


# ── Condition 파일 업데이트 ───────────────────────────────────────────────────


def uid_to_condition_slug(uid: str) -> str:
    """
    'CON-FOOT-OVERPRONATION-001' → 'foot-overpronation'
    UID에서 REGION-NAME 부분만 추출해 소문자 하이픈으로 반환.
    """
    parts = uid.split("-")
    if len(parts) < 3:
        return uid.lower()
    # CON-{REGION}-{NAME...}-{SEQ}
    # REGION + NAME 부분 (마지막 숫자 SEQ 제외, 첫 번째 CON 제외)
    inner = parts[1:-1]  # [REGION, NAME_WORD1, NAME_WORD2, ...]
    return "-".join(w.lower() for w in inner)


def build_new_section_file(uid_base: str, section_type: str, content: str) -> str:
    """존재하지 않는 섹션 파일의 내용을 새로 생성한다."""
    section_uid = f"{uid_base}-{section_type}"
    frontmatter = {
        "uid": section_uid,
        "parent_condition_uid": uid_base,
        "section_type": section_type,
        "status": "active",
    }
    fm_str = yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()
    return f"---\n{fm_str}\n---\n\n{content}\n"


def update_section_file(
    section_path: Path,
    new_content: str,
    uid_base: str,
    section_type: str,
    dry_run: bool,
) -> bool:
    """
    기존 섹션 파일의 프론트매터를 보존하고 본문만 교체한다.
    새 파일이면 생성한다. 변경이 있으면 True 반환.
    """
    if section_path.exists():
        existing = section_path.read_text(encoding="utf-8")
        fm, old_body = split_frontmatter(existing)
        new_full = f"---\n{yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()}\n---\n\n{new_content}\n"

        if old_body.strip() == new_content.strip():
            print(f"    [SKIP] {section_path.name} — 변경 없음")
            return False

        print(f"    [UPDATE] {section_path.name}")
        if not dry_run:
            section_path.write_text(new_full, encoding="utf-8")
    else:
        new_full = build_new_section_file(uid_base, section_type, new_content)
        print(f"    [CREATE] {section_path.name}")
        if not dry_run:
            section_path.parent.mkdir(parents=True, exist_ok=True)
            section_path.write_text(new_full, encoding="utf-8")

    return True


# ── 핵심 동기화 로직 ──────────────────────────────────────────────────────────


def sync_concept_file(concept_path: Path, dry_run: bool) -> bool:
    """
    단일 Concept 파일을 파싱해 Conditions 섹션 파일들을 업데이트한다.
    변경이 하나라도 있으면 True 반환.
    """
    print(f"\n{'─' * 60}")
    print(f"  처리중: {concept_path.name}")

    text = concept_path.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)

    uid: str = fm.get("uid", "")
    if not uid:
        print(f"  [WARN] 프론트매터에 uid 없음 — 건너뜀")
        return False

    slug = uid_to_condition_slug(uid)
    condition_dir = CONDITIONS_DIR / slug
    uid_base = "-".join(uid.upper().split("-")[:-1])  # SEQ 제거, 대문자 정규화

    print(f"  UID    : {uid}")
    print(f"  슬러그 : {slug}")
    print(f"  대상   : medicalData/Conditions/{slug}/")

    if not condition_dir.exists() and not dry_run:
        condition_dir.mkdir(parents=True, exist_ok=True)
        print(f"  [CREATE DIR] medicalData/Conditions/{slug}/")

    sections = extract_concept_sections(body)
    if not sections:
        print(f"  [WARN] 추출된 섹션 없음 — Concept 헤더 구조 확인 필요")
        return False

    changed = False
    for _, filename, section_type in SECTION_FILE_MAP:
        content = sections.get(filename)
        if not content:
            continue
        section_path = condition_dir / filename
        did_change = update_section_file(section_path, content, uid_base, section_type, dry_run)
        changed = changed or did_change

    return changed


# ── 메인 ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concepts 변경사항을 Conditions 섹션 파일에 동기화",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--dry-run", action="store_true", help="실제 파일을 변경하지 않고 미리보기만 출력")
    parser.add_argument("--force", action="store_true", help="변경 여부 무관하게 모든 Concept 파일 동기화")
    parser.add_argument("--file", metavar="FILENAME", help="특정 Concept 파일만 처리 (예: Concept-Foot-Overpronation.md)")
    args = parser.parse_args()

    if args.dry_run:
        print("[DRY-RUN 모드] 파일 변경 없이 미리보기만 출력합니다.\n")

    # 처리할 파일 목록 결정
    if args.file:
        target = CONCEPTS_DIR / args.file
        if not target.exists():
            print(f"[ERROR] 파일을 찾을 수 없습니다: {target}")
            sys.exit(1)
        targets = [target]
    else:
        targets = detect_changed_concepts(force=args.force)

    if not targets:
        print("\n동기화할 파일이 없습니다.")
        sys.exit(0)

    any_changed = False
    for concept_path in targets:
        changed = sync_concept_file(concept_path, dry_run=args.dry_run)
        any_changed = any_changed or changed

    # 해시 업데이트 (dry-run이 아닐 때만)
    if not args.dry_run:
        hashes = load_hashes()
        for p in targets:
            hashes[str(p.relative_to(REPO_ROOT))] = file_hash(p)
        save_hashes(hashes)
        print(f"\n[OK] .concept-hashes.json 업데이트 완료")

    print(f"\n{'─' * 60}")
    if args.dry_run:
        print("DRY-RUN 완료. 실제 변경 없음.")
    elif any_changed:
        print("동기화 완료.")
    else:
        print("변경사항 없음. 모든 파일이 최신 상태입니다.")


if __name__ == "__main__":
    main()
