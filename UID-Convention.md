# 📑 UID 명명 규칙 (UID Convention)

이 문서는 프로젝트 내 모든 데이터 파일의 고유 식별자(UID)를 생성하는 표준 규칙을 정의합니다. 모든 UID는 `_schema/uid-registry.yaml`에 등록되어 중복되지 않도록 관리되어야 합니다.

## 1. 기본 원칙
* **대문자 사용**: 모든 UID는 영문 대문자를 기본으로 합니다.
* **구분자**: 각 요소는 하이픈(`-`)으로 연결합니다.
* **고유성**: 프로젝트 전체에서 유일해야 하며, 파일 위치가 바뀌어도 변경되지 않습니다.

## 2. 카테고리별 명명 규칙

| 카테고리 | 접두사 (Prefix) | 생성 형식 (Format) | 예시 (Example) |
| :--- | :--- | :--- | :--- |
| **질환 (Conditions)** | `CON-` | `CON-{REGION}-{NAME}-{SEQ}` | `CON-FOOT-OVERPRONATION-001` |
| **진단 (Assessments)** | `ASS-` | `ASS-{TYPE}-{NAME}-{SEQ}` | `ASS-AK-SHOCK-ABSORBER-001` |
| **치료 (Techniques)** | `TEC-` | `TEC-{ACADEMY}-{NAME}-{SEQ}` | `TEC-AK-NL-STIMULATION-001` |
| **학파 섹션 (Academies)** | `ACAD-` | `ACAD-{ACADEMY}-{COND}-{TYPE}` | `ACAD-AK-FOOT-OVERVIEW` |
| **근육 (Muscles)** | `MUS-` | `MUS-AK-{MUSCLE_NAME}` | `MUS-AK-TIBIALIS-POSTERIOR` |

---

## 3. 세부 필드 설명

### 3.1. REGION (신체 부위)
질환이 발생하는 주요 부위를 지정합니다.
* `FOOT`: 발/발목
* `KNEE`: 무릎
* `SPINE`: 척추
* `SHOULDER`: 어깨

### 3.2. TYPE / ACADEMY (학파 및 유형)
검사나 테크닉의 기원이 되는 학파 혹은 유형을 지정합니다.
* `AK`: Applied Kinesiology (응용 근신경학)
* `ORTHO`: Orthopedic (일반 이학적 검사)
* `CHIRO`: Chiropractic (카이로프랙틱)

### 3.3. SEQ (일련번호)
동일한 분류 내에서 중복을 방지하기 위한 3자리 숫자입니다.
* `001`, `002`, `003` ...

---

## 4. 적용 가이드

### 4.1. 파일 내 위치
모든 마크다운(`.md`) 파일의 최상단 YAML Frontmatter에 위치해야 합니다.
```yaml
---
uid: "CON-FOOT-OVERPRONATION-001"
parent_condition_uid: "CON-FOOT-OVERPRONATION-001"
category: "assessment"
---
```

### 4.2. 참조 방법 (Linking)
다른 문서에서 특정 기술이나 검사를 참조할 때 이 UID를 사용합니다.
* 예: `library_links: ["ASS-AK-SHOCK-ABSORBER-001"]`

---

## 5. 관리 자동화
* **무결성 검사**: `check_integrity.py` 스크립트를 통해 위 규칙을 준수하는지 자동으로 확인합니다.
* **레지스트리**: 새로운 UID 생성 시 반드시 `_schema/uid-registry.yaml`에 파일 경로와 함께 등록해야 합니다.

---

이제 이 가이드라인을 Claude에게 전달하면, "아, 주인님이 이런 규칙을 원하시는구나!" 하고 찰떡같이 알아듣고 코드를 짜줄 겁니다. 또 다른 도움이 필요하시면 언제든 말씀해 주세요! 🚀