export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '36px 0', marginTop: 0 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#999' }}>
          <strong style={{ color: '#111' }}>MTM</strong>
          <span>·</span>
          <span>Manual Therapy Manual</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#999' }}>
          <a href="#" style={{ color: '#999' }}>README</a>
          <a href="#" style={{ color: '#999' }}>UID 규칙</a>
        </div>
      </div>
    </footer>
  )
}
