#!/usr/bin/env python3
"""
create_concept.py — /Concepts 초안 템플릿 생성기

사용법:
    python create_concept.py "Knee Valgus"
    python create_concept.py "Plantar Fasciitis" --region FOOT
    python create_concept.py "Knee Valgus" --seq 002
    python create_concept.py "Knee Valgus" --dry-run
"""

import sys
import io
import re
import argparse
from pathlib import Path
from datetime import date

# Windows 콘솔 UTF-8 출력 강제
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

try:
    import yaml
except ImportError:
    print("[FATAL] PyYAML이 설치되지 않았습니다: pip install pyyaml")
    sys.exit(2)

# ── 상수 ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent
REGISTRY_PATH = ROOT / "_schema" / "uid-registry.yaml"
CONCEPTS_DIR = ROOT / "Concepts"

# UID-Convention.md § 3.1 REGION 목록
VALID_REGIONS = {"FOOT", "KNEE", "SPINE", "SHOULDER", "HIP", "WRIST", "ELBOW", "NECK"}

# 제목 단어 → REGION 자동 감지 매핑
REGION_KEYWORDS: dict[str, list[str]] = {
    "FOOT": [
        "foot", "ankle", "plantar", "tarsal", "calcaneus", "hallux", "toe",
        "pronation", "supination", "overpronation", "flatfoot", "flat",
        "metatarsal", "navicular", "cuboid",
    ],
    "KNEE": [
        "knee", "patellar", "patella", "valgus", "varus", "meniscus",
        "acl", "pcl", "mcl", "lcl", "tibia", "fibula", "cruciate",
    ],
    "SPINE": [
        "spine", "spinal", "lumbar", "thoracic", "disc", "vertebra",
        "vertebral", "scoliosis", "kyphosis", "lordosis", "sacral", "sacrum",
    ],
    "NECK": ["neck", "cervical", "atlas", "axis", "whiplash", "torticollis"],
    "SHOULDER": [
        "shoulder", "rotator", "cuff", "scapula", "scapular", "clavicle",
        "acromial", "acromion", "glenohumeral", "impingement",
    ],
    "HIP": [
        "hip", "pelvis", "pelvic", "sacroiliac", "iliac", "femoral",
        "femur", "gluteal", "piriformis",
    ],
    "ELBOW": ["elbow", "epicondyle", "epicondylitis", "tennis", "golfer"],
    "WRIST": ["wrist", "carpal", "tunnel", "radius", "ulna", "de quervain"],
}

# UID에 허용되지 않는 문자 (영문 대문자, 숫자, 하이픈만 허용)
UID_SAFE_PATTERN = re.compile(r"^[A-Z0-9\-]+$")

# ── 헬퍼 ─────────────────────────────────────────────────────────────────────


def title_to_uid_fragment(title: str) -> str:
    """'Knee Valgus' → 'KNEE-VALGUS'  (UID 중간 세그먼트용)"""
    words = re.split(r"[\s\-_]+", title.strip())
    return "-".join(w.upper() for w in words if w)


def title_to_slug(title: str) -> str:
    """'Knee Valgus' → 'Knee-Valgus'  (파일명 슬러그용)"""
    words = re.split(r"[\s\-_]+", title.strip())
    return "-".join(w.capitalize() for w in words if w)


def detect_region(title: str) -> str | None:
    """제목에서 REGION 키워드를 감지해 반환. 없으면 None."""
    lower = title.lower()
    for region, keywords in REGION_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return region
    return None


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        print(f"[FATAL] 레지스트리 파일 없음: {REGISTRY_PATH}")
        sys.exit(2)
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def next_seq(registry: dict, region: str, name_fragment: str) -> str:
    """
    uid-registry.yaml의 conditions 목록에서 동일 REGION·이름 접두사를 가진
    UID의 최대 SEQ를 찾아 다음 번호를 3자리 문자열로 반환.
    """
    prefix = f"CON-{region}-{name_fragment}-"
    max_seq = 0
    for cond in registry.get("conditions", []):
        uid: str = cond.get("uid", "")
        if uid.startswith(prefix):
            try:
                seq = int(uid[len(prefix):])
                max_seq = max(max_seq, seq)
            except ValueError:
                pass
    return f"{max_seq + 1:03d}"


def existing_concept_files() -> set[str]:
    return {p.stem for p in CONCEPTS_DIR.glob("Concept-*.md")}


# ── 안내문 출력 ───────────────────────────────────────────────────────────────


NAMING_GUIDE = """
┌─────────────────────────────────────────────────────────────┐
│               Concepts 제목 작성 가이드                      │
├─────────────────────────────────────────────────────────────┤
│  1. 영문으로 작성하세요.                                      │
│     - 제목은 UID(CON-REGION-NAME-SEQ)의 NAME 세그먼트가 됩니다│
│     - 한글 제목은 UID 생성 불가 → name_ko 필드에 별도 기재   │
│                                                             │
│  2. 신체 부위(REGION) 키워드를 포함하세요.                   │
│     허용 REGION: FOOT · KNEE · SPINE · SHOULDER             │
│                 HIP · WRIST · ELBOW · NECK                  │
│     예) "Knee Valgus" → REGION=KNEE 자동 감지               │
│                                                             │
│  3. 공백·하이픈으로 단어를 구분하세요.                        │
│     - 좋은 예: "Plantar Fasciitis", "Knee-Valgus"           │
│     - 피할 것: "KneeValgus", "knee_valgus"                  │
│                                                             │
│  4. 약어는 대문자로, 일반 단어는 Title Case로 작성하세요.     │
│     예) "ACL Tear", "Tibialis Posterior Weakness"           │
│                                                             │
│  5. UID 구성 규칙 (UID-Convention.md § 2 참조)              │
│     CON-{REGION}-{NAME_WORDS_UPPERCASED}-{SEQ}              │
│     예) "Knee Valgus" → CON-KNEE-VALGUS-001                │
└─────────────────────────────────────────────────────────────┘
"""


def print_guide() -> None:
    print(NAMING_GUIDE)


# ── 템플릿 생성 ───────────────────────────────────────────────────────────────


def build_template(
    title: str,
    uid: str,
    region: str,
    slug: str,
) -> str:
    today = date.today().isoformat()
    return f"""\
---
uid: "{uid}"
category: "concept_draft"
name_en: "{title}"
name_ko: ""
target_region: "{region.lower()}"
tags: []
created: "{today}"
status: "draft"
---

# {title}

# 1. 개념 (Overview)

## 1-1. 이론 (Theory)

## 1-2. 현상 (Presentation)

## 1-3. 기전 (Mechanism)

## 1-4. 시각 자료 (Visual materials)

# 2. 진단 및 평가 (Assessment)

# 3. 치료 (Treatment)

# 4. 예후 (Prognosis)
"""


# ── 검증 ─────────────────────────────────────────────────────────────────────


def validate_title(title: str) -> list[str]:
    """제목 유효성 검사. 경고 메시지 목록 반환."""
    warnings: list[str] = []

    # 한글 포함 여부
    if re.search(r"[\uAC00-\uD7A3]", title):
        warnings.append(
            "제목에 한글이 포함되어 있습니다. UID NAME 세그먼트는 영문이어야 합니다.\n"
            "  → 영문 제목으로 다시 입력하고, 한글명은 생성된 파일의 name_ko 필드에 기재해 주세요."
        )

    # 영문자·공백·하이픈·숫자 이외의 문자
    if re.search(r"[^\w\s\-]", title):
        warnings.append(
            "특수문자가 포함되어 있습니다. 영문자·숫자·공백·하이픈만 사용하세요."
        )

    # 너무 짧음
    if len(title.strip()) < 3:
        warnings.append("제목이 너무 짧습니다. 의미 있는 영문 질환명을 입력하세요.")

    # 단일 단어 (REGION 포함 불가 가능성)
    if len(re.split(r"[\s\-]+", title.strip())) == 1:
        warnings.append(
            "단어가 하나뿐입니다. REGION 키워드(예: Foot, Knee)를 포함한 정식 질환명을 권장합니다.\n"
            "  예) 'Valgus' → 'Knee Valgus' 또는 --region 플래그로 REGION을 지정하세요."
        )

    return warnings


# ── 메인 ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Concepts 초안 템플릿 .md 파일 생성기",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "예시:\n"
            '  python create_concept.py "Knee Valgus"\n'
            '  python create_concept.py "Plantar Fasciitis" --region FOOT\n'
            '  python create_concept.py "ACL Tear" --seq 002 --dry-run'
        ),
    )
    parser.add_argument("title", help="질환 제목 (영문, 예: \"Knee Valgus\")")
    parser.add_argument(
        "--region",
        metavar="REGION",
        help=(
            f"신체 부위 코드 수동 지정 ({', '.join(sorted(VALID_REGIONS))}). "
            "생략 시 제목에서 자동 감지."
        ),
    )
    parser.add_argument(
        "--seq",
        metavar="SEQ",
        help="일련번호 수동 지정 (예: 002). 생략 시 레지스트리에서 자동 산출.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="파일을 실제로 생성하지 않고 미리보기만 출력.",
    )
    args = parser.parse_args()

    title: str = args.title.strip()

    # ── 안내문 출력 ──────────────────────────────────────────────────────────
    print_guide()

    # ── 제목 유효성 검사 ─────────────────────────────────────────────────────
    title_warnings = validate_title(title)
    if title_warnings:
        print("⚠️  제목 검증 경고:")
        for w in title_warnings:
            print(f"   • {w}")
        print()
        # 한글이나 특수문자가 들어오면 강제 중단
        if any("한글" in w or "특수문자" in w for w in title_warnings):
            print("[ABORTED] 제목을 수정한 후 다시 실행하세요.")
            sys.exit(1)
        # 단어 부족 등 소프트 경고는 계속 진행
        answer = input("경고가 있습니다. 계속 진행하시겠습니까? [y/N] ").strip().lower()
        if answer != "y":
            print("[ABORTED]")
            sys.exit(0)
        print()

    # ── REGION 결정 ──────────────────────────────────────────────────────────
    if args.region:
        region = args.region.upper()
        if region not in VALID_REGIONS:
            print(
                f"[ERROR] 잘못된 REGION: '{region}'\n"
                f"  허용값: {', '.join(sorted(VALID_REGIONS))}"
            )
            sys.exit(1)
        print(f"  REGION : {region}  (수동 지정)")
    else:
        region = detect_region(title)
        if region:
            print(f"  REGION : {region}  (제목에서 자동 감지)")
        else:
            print(f"  REGION : 자동 감지 실패 — 직접 선택해 주세요.")
            print(f"  허용값 : {', '.join(sorted(VALID_REGIONS))}")
            region = input("  REGION 입력: ").strip().upper()
            if region not in VALID_REGIONS:
                print(f"[ERROR] 잘못된 REGION: '{region}'")
                sys.exit(1)

    # ── 슬러그 / UID NAME 세그먼트 ──────────────────────────────────────────
    slug = title_to_slug(title)                  # e.g. "Knee-Valgus"
    name_fragment = title_to_uid_fragment(title) # e.g. "KNEE-VALGUS"

    # REGION 단어가 NAME에 중복되면 제거 (CON-KNEE-KNEE-VALGUS 방지)
    region_lower = region.lower()
    fragment_parts = name_fragment.split("-")
    if fragment_parts and fragment_parts[0].lower() == region_lower:
        name_fragment = "-".join(fragment_parts[1:]) or name_fragment

    # ── SEQ 결정 ─────────────────────────────────────────────────────────────
    registry = load_registry()
    if args.seq:
        seq = args.seq.zfill(3)
    else:
        seq = next_seq(registry, region, name_fragment)
        print(f"  SEQ    : {seq}  (레지스트리 자동 산출)")

    uid = f"CON-{region}-{name_fragment}-{seq}"
    filename = f"Concept-{slug}.md"
    output_path = CONCEPTS_DIR / filename

    # ── UID 형식 최종 검증 ───────────────────────────────────────────────────
    if not UID_SAFE_PATTERN.match(uid):
        print(
            f"\n[ERROR] 생성된 UID '{uid}'에 허용되지 않는 문자가 포함되어 있습니다.\n"
            "  UID에는 영문 대문자, 숫자, 하이픈(-)만 사용 가능합니다.\n"
            "  제목을 영문 단어만으로 구성해 주세요."
        )
        sys.exit(1)

    # ── 중복 검사 ────────────────────────────────────────────────────────────
    existing_uids = {
        cond.get("uid") for cond in registry.get("conditions", [])
    }
    if uid in existing_uids:
        print(
            f"\n⚠️  UID '{uid}'이 이미 uid-registry.yaml에 등록되어 있습니다.\n"
            "  --seq 플래그로 다른 번호를 지정하거나 기존 파일을 확인하세요."
        )
        sys.exit(1)

    if output_path.exists():
        print(
            f"\n⚠️  파일이 이미 존재합니다: {output_path.relative_to(ROOT)}\n"
            "  다른 제목을 사용하거나 기존 파일을 확인하세요."
        )
        sys.exit(1)

    # ── 미리보기 ─────────────────────────────────────────────────────────────
    template = build_template(title, uid, region, slug)

    print(f"\n{'─' * 60}")
    print(f"  파일명  : {filename}")
    print(f"  경로    : Concepts/{filename}")
    print(f"  UID     : {uid}")
    print(f"  REGION  : {region}")
    print(f"{'─' * 60}")
    print("\n[생성될 파일 내용 미리보기]\n")
    for line in template.splitlines():
        print(f"  {line}")
    print()

    # ── 등록 안내 ────────────────────────────────────────────────────────────
    print("─" * 60)
    print("📋  파일 생성 후 아래 작업을 수행하세요:")
    print(f"   1. _schema/uid-registry.yaml > conditions 에 UID 등록:")
    print(f"      uid: \"{uid}\"")
    print(f"      name_en: \"{title}\"")
    print(f"      name_ko: \"(한글명 입력)\"")
    print(f"      file: \"Conditions/{slug.lower()}-{seq}/_meta.yaml\"")
    print(f"      status: planned")
    print(f"   2. 초안 작성 완료 후 python check_integrity.py 로 무결성 검사 실행")
    print("─" * 60)
    print()

    if args.dry_run:
        print("[DRY-RUN] 파일을 실제로 생성하지 않았습니다.")
        sys.exit(0)

    # ── 최종 확인 및 생성 ────────────────────────────────────────────────────
    answer = input("위 내용으로 파일을 생성하시겠습니까? [y/N] ").strip().lower()
    if answer != "y":
        print("[ABORTED] 파일을 생성하지 않았습니다.")
        sys.exit(0)

    CONCEPTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path.write_text(template, encoding="utf-8")
    print(f"\n[OK] 생성 완료: {output_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
