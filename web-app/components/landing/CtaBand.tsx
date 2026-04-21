import Link from 'next/link'

export default function CtaBand() {
  return (
    <section style={{ padding: '96px 0', textAlign: 'center', background: '#f7f7f7' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: 16, padding: '64px 48px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 200,
            background: 'radial-gradient(ellipse, rgba(62,207,178,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 14 }}>시작하기</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 16 }}>지식을 체계로</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 40 }}>질환 목록을 탐색하거나 검색으로 원하는 지식을 찾아보세요.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/conditions" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', fontSize: 14, fontWeight: 500,
                borderRadius: 8, background: '#3ecfb2', color: '#0a0a0a',
              }}>
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
        </div>
      </div>
    </section>
  )
}
