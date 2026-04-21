#!/usr/bin/env python3
"""
fix_integrity.py — check_integrity.py 오류 자동 수정
사용법:
    python fix_integrity.py              # 인터랙티브: 미리보기 후 y/N 확인
    python fix_integrity.py --dry-run    # 수정 예정 목록만 출력 (파일 변경 없음)
    python fix_integrity.py --apply      # 확인 없이 즉시 적용
"""

import sys
import io
import os
import re
import argparse
import subprocess
from pathlib import Path
from dataclasses import dataclass, field
from typing import Literal

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).parent

# 수정 가능한 에러 패턴 → (필드, 새 값)
FIXABLE_PATTERNS: list[tuple[re.Pattern, str, str]] = [
    (re.compile(r"필수 필드 누락: status"),          "status",   "planned"),
    (re.compile(r"잘못된 status 값: '[^']*'"),        "status",   "planned"),
    (re.compile(r"category는 'assessment_library'"), "category", "assessment_library"),
    (re.compile(r"category는 'treatment_library'"),  "category", "treatment_library"),
    (re.compile(r"category는 'muscle_profile'"),     "category", "muscle_profile"),
]


@dataclass
class FixItem:
    rel_path: str
    field: str
    new_value: str
    error_msg: str


def run_check_integrity() -> str:
    result = subprocess.run(
        [sys.executable, str(ROOT / "check_integrity.py")],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        cwd=ROOT,
    )
    return result.stdout + result.stderr


def parse_fixable_errors(output: str) -> list[FixItem]:
    """[ERROR] 라인을 파싱해 자동 수정 가능한 항목 추출."""
    items: list[FixItem] = []
    seen: set[tuple[str, str]] = set()

    for line in output.splitlines():
        if not line.startswith("[ERROR]"):
            continue
        # "[ERROR]  <path> : <message>"
        match = re.match(r"\[ERROR\]\s+(.+?)\s+:\s+(.+)", line)
        if not match:
            continue
        rel_path, error_msg = match.group(1).strip(), match.group(2).strip()

        for pattern, fix_field, fix_value in FIXABLE_PATTERNS:
            if pattern.search(error_msg):
                key = (rel_path, fix_field)
                if key not in seen:
                    seen.add(key)
                    items.append(FixItem(
                        rel_path=rel_path,
                        field=fix_field,
                        new_value=fix_value,
                        error_msg=error_msg,
                    ))
                break

    return items


def apply_fix(item: FixItem) -> bool:
    """frontmatter에서 해당 필드를 삽입 또는 교체한다."""
    abs_path = ROOT / item.rel_path
    if not abs_path.exists():
        print(f"  [SKIP] 파일 없음: {item.rel_path}")
        return False

    text = abs_path.read_text(encoding="utf-8")

    if not text.startswith("---"):
        print(f"  [SKIP] frontmatter 없음: {item.rel_path}")
        return False

    end = text.find("\n---", 3)
    if end == -1:
        print(f"  [SKIP] frontmatter 닫힘 없음: {item.rel_path}")
        return False

    fm_block = text[3:end]  # '---' 이후 ~ 닫는 '---' 이전

    field_pattern = re.compile(
        rf"^({re.escape(item.field)}\s*:.*)$", re.MULTILINE
    )

    if field_pattern.search(fm_block):
        # 기존 값 교체
        new_fm_block = field_pattern.sub(f"{item.field}: {item.new_value}", fm_block)
    else:
        # 필드 없음 → frontmatter 끝에 삽입
        new_fm_block = fm_block.rstrip("\n") + f"\n{item.field}: {item.new_value}\n"

    new_text = "---" + new_fm_block + text[end:]
    abs_path.write_text(new_text, encoding="utf-8")
    return True


def print_fixable_items(items: list[FixItem]) -> None:
    if not items:
        print("자동 수정 가능한 오류가 없습니다.")
        return

    print(f"\n수정 가능한 항목 ({len(items)}개):")
    print("-" * 60)
    for i, item in enumerate(items, 1):
        print(f"  {i}. {item.rel_path}")
        print(f"     오류  : {item.error_msg}")
        print(f"     수정  : {item.field}: {item.new_value}")
    print("-" * 60)


def main() -> None:
    parser = argparse.ArgumentParser(description="check_integrity.py 오류 자동 수정")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true", help="미리보기만 (파일 변경 없음)")
    group.add_argument("--apply",   action="store_true", help="확인 없이 즉시 적용")
    args = parser.parse_args()

    print("check_integrity.py 실행 중...")
    output = run_check_integrity()

    # 원본 출력 표시
    print(output.rstrip())

    items = parse_fixable_errors(output)
    print_fixable_items(items)

    if not items:
        sys.exit(0)

    if args.dry_run:
        print("\n[dry-run] 파일이 변경되지 않았습니다.")
        print("적용하려면: python fix_integrity.py --apply")
        sys.exit(0)

    if not args.apply:
        # 인터랙티브 확인
        answer = input("\n위 변경사항을 적용하시겠습니까? [y/N]: ").strip().lower()
        if answer not in ("y", "yes"):
            print("취소되었습니다.")
            sys.exit(0)

    # 수정 적용
    print("\n수정 적용 중...")
    success = 0
    for item in items:
        if apply_fix(item):
            print(f"  [FIXED] {item.rel_path}  →  {item.field}: {item.new_value}")
            success += 1

    print(f"\n완료: {success}/{len(items)}개 항목 수정됨.")

    if success:
        print("\ncheck_integrity.py 재실행으로 결과 확인:")
        print("  python check_integrity.py")


if __name__ == "__main__":
    main()
