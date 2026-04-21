'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '56px',
      backdropFilter: 'blur(16px) saturate(180%)',
      background: 'rgba(255,255,255,0.88)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>
        <div style={{
          width: 24, height: 24, background: '#3ecfb2', borderRadius: 5,
          display: 'grid', placeItems: 'center',
        }}>
          <svg viewBox="0 0 13 13" fill="none" width="13" height="13">
            <rect x="1" y="1" width="4" height="4" rx="1" fill="white"/>
            <rect x="8" y="1" width="4" height="4" rx="1" fill="white"/>
            <rect x="1" y="8" width="4" height="4" rx="1" fill="white"/>
            <rect x="8" y="8" width="4" height="4" rx="1" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        MTM
      </Link>

      <ul style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13.5, color: '#555' }}>
        <li><Link href="/conditions" style={{ color: path?.startsWith('/conditions') ? '#111' : '#555' }}>질환</Link></li>
        <li><Link href="/search" style={{ color: path?.startsWith('/search') ? '#111' : '#555' }}>검색</Link></li>
      </ul>

      <Link href="/conditions" style={{
        fontSize: 13, fontWeight: 500, padding: '7px 16px',
        borderRadius: 8, background: '#111', color: '#fff',
      }}>
        열람하기
      </Link>
    </nav>
  )
}
