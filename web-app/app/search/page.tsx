import SearchBox from '@/components/search/SearchBox'

export default function SearchPage() {
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3ecfb2', marginBottom: 12 }}>검색</div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', color: '#111', lineHeight: 1.15, marginBottom: 12 }}>지식 검색</h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>질환명, 증상, 치료법, 근육명으로 검색할 수 있습니다.</p>
        </div>
        <SearchBox />
      </div>
    </div>
  )
}
