manual-therapy-manual/
├── Concepts/              # [Input] 사용자님이 작성하는 통합 원본 파일 (Master Draft)
│   └── Concept-Foot-Overpronation.md
├── Conditions/            # [Output/Hub] 질환별 통합 폴더 (의료 4단계 흐름)
│   └── foot-overpronation/
│       ├── _meta.yaml          # UID: CON-FOOT-OVERPRONATION-001
│       ├── Disease-Definition.md
│       ├── Overview.md
│       ├── Mechanism.md
│       ├── Assessment.md       # General + /Assessments의 링크
│       └── (Treatment.md)      # 미작성 — 데이터 추가 시 생성 예정
├── Academies/             # [Library] 학파별 원천 지식 (예: AK 근육 프로필)
│   └── applied-kinesiology/
│       └── Muscle/             # 근육 프로필 — 데이터 추가 시 파일 증가
│           └── tibialis-posterior.md
├── Assessments/           # [Library] 질환에 구애받지 않는 표준 검사법
│   └── Assessments-AK-Foot-Overpronation.md
│   # 검사법 증가 시 하위폴더(orthopedic-tests/, ak-tests/ 등)로 분류 예정
├── Treatments/            # [Library] 표준 치료 기술 및 프로토콜 (미작성)
│   # 치료법 추가 시 하위폴더로 분류 예정
├── Assets/                # [Static] 이미지 및 영상 자료
│   └── foot-overpronation/ # 질환별 하위폴더 — 데이터 추가 시 폴더 증가
│       └── foot_overpronation.jpg
├── _schema/               # [Meta] 파일 작성 양식 및 UID 레지스트리
│   ├── uid-registry.yaml
│   ├── academy-ak-muscle.md.example
│   ├── academy-section.md.example
│   ├── condition-meta.yaml.example
│   ├── condition-section.md.example
│   ├── library-assessment.md.example
│   └── library-technique.md.example
├── UID-Convention.md      # UID 명명 규칙 문서
├── check_integrity.py     # 파일 구조 무결성 검사 스크립트
└── Tree.md                # 이 파일
