export default function StructureSection() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 14 }}>구조</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 14 }}>명확한<br />디렉토리 설계</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
              Input, Output, Library 세 역할로 디렉토리가 분리됩니다. 작성과 읽기의 흐름이 단방향으로 유지됩니다.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '9px 12px', color: '#999', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.09)' }}>카테고리</th>
                  <th style={{ textAlign: 'left', padding: '9px 12px', color: '#999', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.09)' }}>형식</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['질환', 'CON-FOOT-OVERPRONATION-001'],
                  ['검사', 'ASS-AK-OVERPRONATION-001'],
                  ['치료', 'TEC-AK-NL-STIMULATION-001'],
                  ['근육', 'MUS-AK-TIBIALIS-POSTERIOR'],
                ].map(([cat, uid]) => (
                  <tr key={cat}>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#111', fontWeight: 500 }}>{cat}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f0f0f0', color: '#3ecfb2', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>{uid}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Directory panel */}
          <div style={{ background: '#f7f7f7', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: 4, fontSize: 12, color: '#999', fontFamily: 'monospace' }}>manual-therapy-manual/</span>
            </div>
            <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 2 }}>
              {[
                { indent: '', name: 'Concepts/', accent: true, comment: '← 작성' },
                { indent: '│  ', name: 'Concept-Foot-Overpronation.md', dim: true },
                { indent: '', name: '│', dim: true },
                { indent: '', name: 'Conditions/', accent: true, comment: '← 자동 생성' },
                { indent: '│  ', name: 'foot-overpronation/', dim: true },
                { indent: '│  │  ', name: 'Overview.md', dim: true },
                { indent: '│  │  ', name: 'Mechanism.md', dim: true },
                { indent: '│  │  ', name: 'Assessment.md', dim: true },
                { indent: '│  │  ', name: 'Treatment.md', dim: true },
                { indent: '', name: '│', dim: true },
                { indent: '', name: 'Assessments/', comment: '← 검사 라이브러리' },
                { indent: '', name: 'Academies/', comment: '← 학파별 지식' },
                { indent: '', name: 'Assets/', comment: '← 이미지·영상' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#ccc' }}>{row.indent}</span>
                  <span style={{ color: row.accent ? '#3ecfb2' : row.dim ? '#bbb' : '#555' }}>{row.name}</span>
                  {row.comment && <span style={{ marginLeft: 10, color: '#bbb', fontSize: 11 }}>{row.comment}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
