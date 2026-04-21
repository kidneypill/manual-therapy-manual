'use client'
import { useState } from 'react'

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  definition: '질환 정의',
  mechanism: '기전',
  assessment: '진단/평가',
  treatment: '치료',
  prognosis: '예후',
}

interface Section {
  sectionKey: string
  body: { html: string }
  status: string | null | undefined
}

interface Props {
  sections: Section[]
}

export default function ConditionTabs({ sections }: Props) {
  const available = sections.filter(s => s.status !== 'planned')
  const [active, setActive] = useState(available[0]?.sectionKey ?? 'overview')
  const current = available.find(s => s.sectionKey === active)

  if (available.length === 0) {
    return <p style={{ color: '#999', padding: '24px 0' }}>섹션 데이터가 없습니다.</p>
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.09)',
        marginBottom: 32, overflowX: 'auto',
      }}>
        {available.map(s => (
          <button
            key={s.sectionKey}
            onClick={() => setActive(s.sectionKey)}
            style={{
              padding: '12px 20px',
              fontSize: 13.5, fontWeight: active === s.sectionKey ? 600 : 400,
              color: active === s.sectionKey ? '#111' : '#555',
              borderBottom: active === s.sectionKey ? '2px solid #3ecfb2' : '2px solid transparent',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: active === s.sectionKey ? '#3ecfb2' : 'transparent',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {SECTION_LABELS[s.sectionKey] ?? s.sectionKey}
          </button>
        ))}
      </div>

      {/* Section content */}
      {current && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: current.body.html }}
        />
      )}
    </div>
  )
}
