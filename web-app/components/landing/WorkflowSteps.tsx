const STEPS = [
  {
    n: '01', title: 'Concept 작성',
    body: 'Concepts/Concept-{질환명}.md에 통합 원본을 작성합니다. 표준 헤더 구조를 따릅니다.',
  },
  {
    n: '02', title: '자동 감지',
    body: '파일 저장 시 Claude Code hook이 변경을 감지하고 sync_concepts.py를 실행합니다.',
  },
  {
    n: '03', title: '섹션 분리',
    body: '스크립트가 헤딩 구조를 파싱해 섹션별 파일을 Conditions/{slug}/에 생성합니다.',
  },
  {
    n: '04', title: '지식 완성',
    body: 'Overview, Mechanism, Assessment, Treatment, Prognosis가 각각 독립 파일로 완성됩니다.',
  },
]

export default function WorkflowSteps() {
  return (
    <section style={{ padding: '96px 0', background: '#f7f7f7' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 14 }}>워크플로</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 14 }}>한 번 작성,<br />자동으로 전개</h2>
          <p style={{ fontSize: 15, color: '#555', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>Concept 파일을 작성하는 것만으로 전체 지식 구조가 완성됩니다.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 20, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(62,207,178,0.3) 50%, transparent 100%)',
          }} />
          {STEPS.map((s, i) => (
            <div key={i} style={{ position: 'relative', zIndex: 1, padding: '0 20px', textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: (i === 0 || i === 3) ? '1px solid rgba(62,207,178,0.4)' : '1px solid rgba(0,0,0,0.12)',
                background: (i === 0 || i === 3) ? 'rgba(62,207,178,0.08)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                color: (i === 0 || i === 3) ? '#3ecfb2' : '#555',
                margin: '0 auto 20px',
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.01em' }}>{s.title}</div>
              <p style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
