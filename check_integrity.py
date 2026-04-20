#!/usr/bin/env python3
"""
check_integrity.py — .md 파일이 _schema/ 정의 구조를 따르는지 검사
사용법:
    python check_integrity.py              # 전체 검사
    python check_integrity.py Conditions/  # 특정 경로만
    python check_integrity.py --errors-only
"""

import sys
import io
import os
import re
import argparse
from pathlib import Path

# Windows 콘솔에서 UTF-8 출력 강제
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import yaml
except ImportError:
    print("[FATAL] PyYAML이 설치되지 않았습니다: pip install pyyaml")
    sys.exit(2)

# ── 상수 ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent
REGISTRY_PATH = ROOT / "_schema" / "uid-registry.yaml"

VALID_STATUS = {"active", "planned", "deprecated"}

CONDITION_SECTION_TYPES = {
    "DEFINITION", "OVERVIEW", "ASSESSMENT",
    "TREATMENT", "PROGNOSIS", "MECHANISM",
}

ACADEMY_SECTION_TYPES = {
    "OVERVIEW", "ASSESSMENT", "THERAPY",
    "PROGNOSIS", "BASICINFO",
}

# 검사 제외 디렉토리
SKIP_DIRS = {"_schema", "Concepts", "Assets", ".git"}


# ── 레지스트리 로드 ──────────────────────────────────────────────────────────

def load_registry():
    """uid-registry.yaml을 파싱하여 카테고리별 UID 집합 반환."""
    if not REGISTRY_PATH.exists():
        print(f"[FATAL] 레지스트리 파일 없음: {REGISTRY_PATH}")
        sys.exit(2)

    with open(REGISTRY_PATH, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    reg = {
        "condition_uids": set(),
        "condition_section_uids": set(),
        "academy_section_uids": set(),
        "muscle_uids": set(),
        "assessment_uids": set(),
        "technique_uids": set(),
        "all_uids": set(),
    }

    for cond in data.get("conditions", []):
        reg["condition_uids"].add(cond["uid"])
        reg["all_uids"].add(cond["uid"])
        for sec in cond.get("condition_sections", []):
            reg["condition_section_uids"].add(sec["uid"])
            reg["all_uids"].add(sec["uid"])

    for sec in data.get("academy_sections", []):
        reg["academy_section_uids"].add(sec["uid"])
        reg["all_uids"].add(sec["uid"])

    for m in data.get("muscles", []):
        reg["muscle_uids"].add(m["uid"])
        reg["all_uids"].add(m["uid"])

    for a in data.get("assessments", []):
        reg["assessment_uids"].add(a["uid"])
        reg["all_uids"].add(a["uid"])

    for t in data.get("techniques", []):
        reg["technique_uids"].add(t["uid"])
        reg["all_uids"].add(t["uid"])

    return reg


# ── Frontmatter 파싱 ─────────────────────────────────────────────────────────

def parse_frontmatter(path: Path):
    """
    YAML frontmatter(--- ... ---) 파싱.
    반환: (dict 또는 None, 오류 메시지 또는 None)
    """
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None, "frontmatter 없음 (파일이 '---'으로 시작하지 않음)"

    # 두 번째 '---' 찾기
    end = text.find("\n---", 3)
    if end == -1:
        return None, "frontmatter 닫힘 표시('---') 없음"

    raw_yaml = text[3:end].strip()
    try:
        fm = yaml.safe_load(raw_yaml)
        if not isinstance(fm, dict):
            return None, "frontmatter가 YAML 딕셔너리가 아님"
        return fm, None
    except yaml.YAMLError as e:
        return None, f"YAML 파싱 오류: {e}"


# ── 스키마 타입 판별 ─────────────────────────────────────────────────────────

def detect_schema_type(path: Path):
    """파일 경로 패턴으로 스키마 타입 반환."""
    rel = path.relative_to(ROOT)
    parts = rel.parts  # ('Conditions', 'foot-overpronation', 'Overview.md')

    if parts[0] == "Conditions":
        return "condition-section"
    if parts[0] == "Academies":
        if len(parts) >= 3 and parts[2] == "Muscle":
            return "muscle-profile"
        return "academy-section"
    if parts[0] == "Assessments":
        return "assessment-library"
    if parts[0] == "Treatments":
        return "technique-library"
    return "unknown"


# ── 검사 함수 ────────────────────────────────────────────────────────────────

class Result:
    def __init__(self, path: Path):
        self.path = path
        self.errors = []
        self.warns = []

    def error(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    @property
    def ok(self):
        return not self.errors and not self.warns


def validate_common(fm: dict, result: Result, reg: dict):
    """uid, status 공통 검사."""
    if "uid" not in fm:
        result.error("필수 필드 누락: uid")
    else:
        uid = fm["uid"]
        if uid not in reg["all_uids"]:
            result.warn(f"UID '{uid}'이 uid-registry.yaml에 미등록")

    if "status" not in fm:
        result.error("필수 필드 누락: status")
    elif fm["status"] not in VALID_STATUS:
        result.error(f"잘못된 status 값: '{fm['status']}' (허용: {', '.join(sorted(VALID_STATUS))})")


def validate_condition_section(fm: dict, result: Result, reg: dict):
    required = ["uid", "parent_condition_uid", "section_type"]
    for field in required:
        if field not in fm:
            result.error(f"필수 필드 누락: {field}")

    section_type = fm.get("section_type")
    if section_type and section_type not in CONDITION_SECTION_TYPES:
        result.error(
            f"잘못된 section_type: '{section_type}' "
            f"(허용: {', '.join(sorted(CONDITION_SECTION_TYPES))})"
        )

    uid = fm.get("uid", "")
    if uid and section_type:
        if not uid.endswith(f"-{section_type}"):
            result.error(
                f"UID 마지막 세그먼트와 section_type 불일치: "
                f"uid='{uid}', section_type='{section_type}'"
            )

    if uid and not uid.startswith("CON-"):
        result.error(f"condition-section UID는 'CON-'으로 시작해야 함: '{uid}'")

    parent = fm.get("parent_condition_uid")
    if parent and parent not in reg["condition_uids"]:
        result.warn(f"parent_condition_uid '{parent}'이 registry에 없음")

    for link in fm.get("library_links", []) or []:
        if link not in reg["all_uids"]:
            result.warn(f"library_links 참조 UID '{link}'이 registry에 없음")


def validate_academy_section(fm: dict, result: Result, reg: dict):
    required = ["uid", "condition_uid", "academy", "section_type"]
    for field in required:
        if field not in fm:
            result.error(f"필수 필드 누락: {field}")

    section_type = fm.get("section_type")
    if section_type and section_type not in ACADEMY_SECTION_TYPES:
        result.error(
            f"잘못된 section_type: '{section_type}' "
            f"(허용: {', '.join(sorted(ACADEMY_SECTION_TYPES))})"
        )

    uid = fm.get("uid", "")
    if uid and not uid.startswith("ACAD-"):
        result.error(f"academy-section UID는 'ACAD-'으로 시작해야 함: '{uid}'")

    condition_uid = fm.get("condition_uid")
    if condition_uid and condition_uid not in reg["condition_uids"]:
        result.warn(f"condition_uid '{condition_uid}'이 registry에 없음")


def validate_assessment_library(fm: dict, result: Result, reg: dict):
    required = ["uid", "name_ko", "category", "academy"]
    for field in required:
        if field not in fm:
            result.error(f"필수 필드 누락: {field}")

    if fm.get("category") != "assessment_library":
        result.error(
            f"category는 'assessment_library'이어야 함: '{fm.get('category')}'"
        )

    uid = fm.get("uid", "")
    if uid and not uid.startswith("ASS-"):
        result.error(f"assessment-library UID는 'ASS-'으로 시작해야 함: '{uid}'")


def validate_technique_library(fm: dict, result: Result, reg: dict):
    required = ["uid", "category", "academy"]
    for field in required:
        if field not in fm:
            result.error(f"필수 필드 누락: {field}")

    if fm.get("category") != "treatment_library":
        result.error(
            f"category는 'treatment_library'이어야 함: '{fm.get('category')}'"
        )

    uid = fm.get("uid", "")
    if uid and not uid.startswith("TEC-"):
        result.error(f"technique-library UID는 'TEC-'으로 시작해야 함: '{uid}'")


def validate_muscle_profile(fm: dict, result: Result, reg: dict):
    required = ["uid", "name_ko", "category", "academy"]
    for field in required:
        if field not in fm:
            result.error(f"필수 필드 누락: {field}")

    if fm.get("category") != "muscle_profile":
        result.error(
            f"category는 'muscle_profile'이어야 함: '{fm.get('category')}'"
        )

    uid = fm.get("uid", "")
    if uid and not uid.startswith("MUS-"):
        result.error(f"muscle-profile UID는 'MUS-'으로 시작해야 함: '{uid}'")

    for cond_uid in fm.get("related_conditions", []) or []:
        if cond_uid not in reg["condition_uids"]:
            result.warn(f"related_conditions 참조 UID '{cond_uid}'이 registry에 없음")


# ── 파일 수집 ────────────────────────────────────────────────────────────────

def collect_md_files(search_root: Path):
    """검사 대상 .md 파일 목록 반환."""
    files = []
    for path in search_root.rglob("*.md"):
        # 제외 디렉토리 필터
        rel_parts = path.relative_to(ROOT).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        # 루트 레벨 단독 .md 파일 (README 등) 제외
        if len(rel_parts) == 1:
            continue
        files.append(path)
    return sorted(files)


# ── 메인 ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MD 파일 스키마 무결성 검사")
    parser.add_argument(
        "path", nargs="?", default=None,
        help="검사할 경로 (기본값: 프로젝트 루트 전체)"
    )
    parser.add_argument(
        "--errors-only", action="store_true",
        help="[ERROR]만 출력 (WARN 숨김)"
    )
    args = parser.parse_args()

    search_root = ROOT / args.path if args.path else ROOT
    if not search_root.exists():
        print(f"[FATAL] 경로 없음: {search_root}")
        sys.exit(2)

    reg = load_registry()
    files = collect_md_files(search_root)

    if not files:
        print("검사할 .md 파일이 없습니다.")
        sys.exit(0)

    total = len(files)
    error_count = 0
    warn_count = 0
    ok_count = 0

    for path in files:
        result = Result(path)
        rel = path.relative_to(ROOT)

        fm, parse_err = parse_frontmatter(path)
        if parse_err:
            result.error(parse_err)
        else:
            validate_common(fm, result, reg)
            schema_type = detect_schema_type(path)

            if schema_type == "condition-section":
                validate_condition_section(fm, result, reg)
            elif schema_type == "academy-section":
                validate_academy_section(fm, result, reg)
            elif schema_type == "assessment-library":
                validate_assessment_library(fm, result, reg)
            elif schema_type == "technique-library":
                validate_technique_library(fm, result, reg)
            elif schema_type == "muscle-profile":
                validate_muscle_profile(fm, result, reg)
            # unknown: 공통 검사만 수행

        if result.errors:
            error_count += 1
            for msg in result.errors:
                print(f"[ERROR]  {rel} : {msg}")
            if not args.errors_only:
                for msg in result.warns:
                    print(f"[WARN]   {rel} : {msg}")
        elif result.warns:
            warn_count += 1
            if not args.errors_only:
                for msg in result.warns:
                    print(f"[WARN]   {rel} : {msg}")
        else:
            ok_count += 1
            print(f"[OK]     {rel}")

    print()
    print(f"검사 완료: 총 {total}개 파일 | OK {ok_count} / WARN {warn_count} / ERROR {error_count}")

    sys.exit(1 if error_count else 0)


if __name__ == "__main__":
    main()
