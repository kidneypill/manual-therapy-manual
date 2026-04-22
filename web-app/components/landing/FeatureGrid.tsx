'use client'

const FEATURES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: '자동 섹션 동기화',
    desc: 'Concepts 파일을 저장하면 Overview, Mechanism, Assessment, Treatment, Prognosis가 자동으로 생성·갱신됩니다.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'UID 기반 연결 구조',
    desc: '모든 지식 노드는 고유 UID로 식별됩니다. 질환, 검사, 치료 간의 참조 관계가 명확히 추적됩니다.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 2V4M8 12V14M2 8H4M12 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: '학파별 독립 라이브러리',
    desc: 'Applied Kinesiology, Orthopedic 등 학파별 지식이 독립된 섹션으로 분리되어 혼용을 방지합니다.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '무결성 자동 검사',
    desc: 'check_integrity.py가 UID 중복, 필수 필드 누락, 링크 오류를 자동으로 검출합니다.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 6h4M6 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'YAML 프론트매터',
    desc: '각 파일은 구조화된 메타데이터를 YAML로 관리합니다. 기존 파일에 이식하거나 스키마를 확장하기 쉽습니다.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v4l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="9" r="5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: '저장 시 즉시 실행',
    desc: 'Claude Code hook이 파일 저장을 감지해 동기화를 자동으로 실행합니다. 별도 명령 없이 항상 최신 상태.',
  },
]

export default function FeatureGrid() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 14 }}>기능</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 14 }}>단순한 메모에서<br />체계적인 지식으로</h2>
          <p style={{ fontSize: 15, color: '#555', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>Concept 파일 하나로 질환의 전체 지식 체계를 구성합니다.</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(0,0,0,0.09)', borderRadius: 12, overflow: 'hidden',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: '36px 32px',
              background: '#fff',
              borderRight: (i % 3 !== 2) ? '1px solid rgba(0,0,0,0.09)' : 'none',
              borderBottom: (i < 3) ? '1px solid rgba(0,0,0,0.09)' : 'none',
              transition: 'background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f7f7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 9,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#f0f0f0',
                display: 'grid', placeItems: 'center',
                marginBottom: 20, color: '#3ecfb2',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
