import Link from 'next/link'
import { getAllConditions } from '@/lib/getConditionMeta'

export default function ConditionsPage() {
  const conditions = getAllConditions()

  return (
    <div style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 12 }}>질환 목록</div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 12 }}>모든 질환</h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>
            {conditions.length}개 질환의 Overview, Mechanism, Assessment, Treatment, Prognosis를 열람할 수 있습니다.
          </p>
        </div>

        {conditions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#999' }}>데이터를 불러올 수 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {conditions.map(c => (
              <Link key={c.slug} href={`/conditions/${c.slug}`} style={{
                display: 'block', padding: '28px 28px',
                background: '#fff', border: '1px solid rgba(0,0,0,0.09)',
                borderRadius: 12, transition: 'border-color 0.15s, box-shadow 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(62,207,178,0.4)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.09)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 600, color: '#111', letterSpacing: '-0.01em', marginBottom: 4 }}>{c.name_en}</h2>
                  <p style={{ fontSize: 13, color: '#999' }}>{c.name_ko}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {c.body_region?.map(r => (
                    <span key={r} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(62,207,178,0.08)', color: '#3ecfb2', borderRadius: 100, border: '1px solid rgba(62,207,178,0.2)' }}>{r}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {c.tags?.slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 7px', background: '#f0f0f0', color: '#555', borderRadius: 4 }}>#{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
