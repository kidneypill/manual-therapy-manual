# Manual Therapy Manual

도수치료 지식을 체계적으로 관리하기 위한 마크다운 기반 지식 베이스.

## 구조

```
Concepts/        ← 작성 입력: 통합 원본 파일 (Concept-*.md)
Conditions/      ← 자동 출력: 질환별 섹션 파일 (Overview, Mechanism, Assessment, Treatment, Prognosis)
Assessments/     ← 라이브러리: 학파별 검사법
Academies/       ← 라이브러리: 학파별 근육·지식 프로필
Treatments/      ← 라이브러리: 치료 기술 프로토콜 (작성 예정)
Assets/          ← 이미지·영상 정적 자료
_schema/         ← 파일 작성 양식 및 UID 레지스트리
```

## 워크플로

1. `Concepts/Concept-{질환명}.md` 작성
2. `sync_concepts.py` 실행 → `Conditions/{slug}/` 하위 섹션 파일 자동 생성·갱신
3. `check_integrity.py` 로 UID 무결성 확인

`Concepts/` 파일을 저장하면 hook이 `sync_concepts.py`를 자동 실행합니다.

## UID 규칙

| 카테고리 | 형식 | 예시 |
|---|---|---|
| 질환 | `CON-{REGION}-{NAME}-{SEQ}` | `CON-FOOT-OVERPRONATION-001` |
| 검사 | `ASS-{TYPE}-{NAME}-{SEQ}` | `ASS-AK-SHOCK-ABSORBER-001` |
| 치료 | `TEC-{ACADEMY}-{NAME}-{SEQ}` | `TEC-AK-NL-STIMULATION-001` |
| 근육 | `MUS-AK-{NAME}` | `MUS-AK-TIBIALIS-POSTERIOR` |

자세한 규칙은 [`UID-Convention.md`](UID-Convention.md) 참고.

## 스크립트

| 스크립트 | 용도 |
|---|---|
| `sync_concepts.py` | Concept → Conditions 섹션 동기화 |
| `create_concept.py` | 새 Concept 파일 템플릿 생성 |
| `check_integrity.py` | UID 중복·누락 검사 |

```bash
python sync_concepts.py            # 변경된 파일만 동기화
python sync_concepts.py --force    # 전체 강제 동기화
python sync_concepts.py --dry-run  # 미리보기
```
