'use client'

// ─────────────────────────────────────────────
// NeoTravel — Shared Navigation Bar
// Used on landing page and assistant page.
// ─────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'

interface Props {
  activePage?: 'landing' | 'assistant' | 'cockpit'
}

const navStyle = (active: boolean): React.CSSProperties => ({
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 600,
  padding: '7px 12px',
  borderRadius: 9,
  ...(active
    ? { color: '#f3f2ec', background: '#2e3a1f' }
    : { color: '#3a4030', border: '1px solid rgba(46,58,31,0.16)' }),
})

export default function NavBar({ activePage = 'landing' }: Props) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      flexWrap: 'wrap' as const,
      padding: '13px 30px',
      background: 'rgba(243,242,236,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(46,58,31,0.1)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#16190f' }}>
        <Image src="/logo-neotravel-icon.svg" alt="" width={34} height={34} />
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.025em' }}>
          NeoTravel
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Link href="/" style={navStyle(activePage === 'landing')}>Accueil</Link>
        <Link href="/assistant" style={navStyle(activePage === 'assistant')}>Assistant</Link>
        <Link href="/cockpit" style={navStyle(activePage === 'cockpit')}>Cockpit</Link>
      </div>

      {/* CTA */}
      <Link
        href="/assistant"
        style={{
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 700,
          color: '#1f2613',
          background: '#c2e84a',
          padding: '10px 17px',
          borderRadius: 12,
        }}
      >
        Demander un devis
      </Link>
    </nav>
  )
}
