manual-therapy-manual/
├── _schema/                        # 데이터 일관성을 위한 스키마 및 템플릿
├── Conditions/                     # [핵심] 질환/증상별 통합 폴더
│   └── {condition-slug}/           # 예: foot-overpronation
│       ├── _meta.yaml              # 질환 통합 메타데이터 (ICD-10, 태그, UID 등)
│       ├── 01_Definition.md         # 질환 정의 및 분류 (Disease Definition)
│       ├── 02_Overview.md           # 핵심 원리, 기전, 시각 자료 (General + Academy Insights)
│       ├── 03_Assessment/           # [진단 및 평가] 통합 폴더
│       │   ├── General.md           # 이학적 검사, 영상 진단 등 표준 검사
│       │   ├── Applied-Kinesiology.md # AK 학파 특화 검사 (충격흡수검사 등)
│       │   └── Chiro-Specific.md    # 타 학파 특화 검사 (필요 시 확장)
│       ├── 04_Therapy/              # [치료법] 통합 폴더
│       │   ├── Strategy.md          # 치료 적응증, 금기증 및 일반적 치료 원칙
│       │   ├── Applied-Kinesiology.md # AK 관점의 치료 접근법 (반사점 자극 등)
│       │   └── ...
│       └── 05_Prognosis.md          # 예후, 치료 빈도, 환자 교육
├── Techniques/                     # [라이브러리] 실제 구현되는 수기 테크닉 모음
│   └── {academy-slug}/             # 테크닉은 여러 질환에 중복 사용되므로 별도 관리
│       └── {technique-name}.md      # 예: origin-insertion-technique.md
└── Assets/                         # 이미지, 영상 등 시각 자료