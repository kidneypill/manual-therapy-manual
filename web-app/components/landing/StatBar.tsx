'use client'

const STATS = [
  ['질환별 섹션 자동 분리', '5 섹션'],
  ['UID 기반 지식 관리', '단일 식별자'],
  ['학파 독립 아카이브', 'Applied Kinesiology'],
  ['파일 저장 시 즉시 동기화', 'Hook 기반'],
  ['무결성 자동 검사', 'check_integrity.py'],
  ['YAML 프론트매터', '구조화 메타데이터'],
]

export default function StatBar() {
  return (
    <div style={{
      padding: '24px 0',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', gap: 64,
        width: 'max-content',
        animation: 'scroll-left 28s linear infinite',
      }}>
        {[...STATS, ...STATS].map(([label, val], i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', color: '#555', fontSize: 13 }}>
            {label} <span style={{ color: '#999' }}>{val}</span>
            {i < STATS.length * 2 - 1 && (
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }} />
            )}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
