import { notFound } from 'next/navigation'
import { allConditionSections } from 'contentlayer/generated'
import { getAllConditionSlugs, getConditionMeta } from '@/lib/getConditionMeta'
import ConditionTabs from '@/components/conditions/ConditionTabs'

export async function generateStaticParams() {
  const slugs = getAllConditionSlugs()
  return slugs.map(slug => ({ slug }))
}

interface Props {
  params: { slug: string }
}

export default function ConditionDetailPage({ params }: Props) {
  const { slug } = params
  const meta = getConditionMeta(slug)
  if (!meta) return notFound()

  const sections = allConditionSections.filter(s => s.conditionSlug === slug)

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 12 }}>
            <a href="/conditions" style={{ color: '#999', textDecoration: 'none' }}>질환 목록</a>
            <span style={{ margin: '0 8px', color: '#ddd' }}>/</span>
            {meta.name_en}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 8 }}>
            {meta.name_en}
          </h1>
          <p style={{ fontSize: 16, color: '#999', marginBottom: 16 }}>{meta.name_ko}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {meta.body_region?.map(r => (
              <span key={r} style={{ fontSize: 11.5, padding: '3px 10px', background: 'rgba(62,207,178,0.08)', color: '#3ecfb2', borderRadius: 100, border: '1px solid rgba(62,207,178,0.2)' }}>{r}</span>
            ))}
            {meta.tags?.map(t => (
              <span key={t} style={{ fontSize: 11.5, padding: '3px 9px', background: '#f0f0f0', color: '#555', borderRadius: 4 }}>#{t}</span>
            ))}
          </div>
        </div>

        {/* Tabbed sections */}
        <ConditionTabs sections={sections.map(s => ({
          sectionKey: s.sectionKey,
          body: s.body,
          status: s.status,
        }))} />
      </div>
    </div>
  )
}
