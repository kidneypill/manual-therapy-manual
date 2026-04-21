import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      padding: '120px 32px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 400,
        background: 'radial-gradient(ellipse at center, rgba(62,207,178,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 12, fontWeight: 500, color: '#3ecfb2',
          border: '1px solid rgba(62,207,178,0.3)',
          background: 'rgba(62,207,178,0.08)',
          borderRadius: 100, padding: '5px 13px',
          marginBottom: 32, letterSpacing: '0.03em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#3ecfb2',
            boxShadow: '0 0 6px #3ecfb2',
            animation: 'pulse-dot 2.4s ease-in-out infinite',
            flexShrink: 0,
          }} />
          Markdown-based Knowledge Base
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 72px)',
          fontWeight: 700, lineHeight: 1.08,
          letterSpacing: '-0.03em', color: '#111',
          marginBottom: 24,
        }}>
          도수치료 지식의<br />
          <span style={{ color: '#3ecfb2' }}>체계적 관리</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)', color: '#555',
          maxWidth: 520, margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          질환, 검사, 치료, 학파 지식을 마크다운으로 작성하면<br />
          섹션별 데이터베이스가 자동으로 완성됩니다.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/conditions" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', fontSize: 14, fontWeight: 500,
            borderRadius: 8, background: '#3ecfb2', color: '#0a0a0a',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 7L7 13M1 7H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            질환 목록 보기
          </Link>
          <Link href="/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', fontSize: 14, fontWeight: 400,
            borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)',
            color: '#555',
          }}>
            검색하기
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: '#999', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        <span>Scroll</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: 'bounce-down 2s ease-in-out infinite' }}>
          <path d="M6 1V11M1 6L6 11L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </section>
  )
}
