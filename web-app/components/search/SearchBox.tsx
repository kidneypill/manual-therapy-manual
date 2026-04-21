'use client'
import { useState, useEffect, useCallback } from 'react'

interface SearchResult {
  id: string
  conditionSlug: string
  sectionType: string
  nameEn: string
  nameKo: string
  excerpt: string
}

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [indexData, setIndexData] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/search-index.json')
      .then(r => r.json())
      .then((data: SearchResult[]) => {
        setIndexData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const search = useCallback((q: string) => {
    if (!indexData || !q.trim()) { setResults([]); return }
    const lower = q.toLowerCase()
    const matched = indexData.filter(doc =>
      doc.nameEn?.toLowerCase().includes(lower) ||
      doc.nameKo?.toLowerCase().includes(lower) ||
      doc.excerpt?.toLowerCase().includes(lower)
    ).slice(0, 20)
    setResults(matched)
  }, [indexData])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150)
    return () => clearTimeout(timer)
  }, [query, search])

  const SECTION_LABELS: Record<string, string> = {
    overview: 'Overview', definition: '질환 정의', mechanism: '기전',
    assessment: '진단/평가', treatment: '치료', prognosis: '예후',
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }}>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={loading ? '인덱스 로딩 중...' : '검색어 입력...'}
          disabled={loading}
          style={{
            width: '100%', padding: '13px 16px 13px 42px',
            fontSize: 15, border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 10, outline: 'none', background: '#fff',
            color: '#111',
          }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#3ecfb2' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.12)' }}
        />
      </div>

      {query && results.length === 0 && !loading && (
        <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>검색 결과가 없습니다.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map(r => (
          <a key={r.id} href={`/conditions/${r.conditionSlug}`} style={{
            display: 'block', padding: '20px 20px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: 10, textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{r.nameEn}</span>
              <span style={{ fontSize: 11, color: '#999' }}>{r.nameKo}</span>
              <span style={{
                fontSize: 11, padding: '2px 7px',
                background: 'rgba(62,207,178,0.08)', color: '#3ecfb2',
                borderRadius: 100, border: '1px solid rgba(62,207,178,0.2)',
                marginLeft: 'auto',
              }}>
                {SECTION_LABELS[r.sectionType] ?? r.sectionType}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {r.excerpt}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
