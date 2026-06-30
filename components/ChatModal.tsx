'use client'

// ─────────────────────────────────────────────
// NeoTravel — Chat Modal
// Full-screen overlay containing the Chat widget.
// Used on the landing page and assistant page.
// ─────────────────────────────────────────────

import Chat from './Chat'

interface Props {
  open: boolean
  seedQuery?: string
  onClose: () => void
}

export default function ChatModal({ open, seedQuery, onClose }: Props) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(21,24,14,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '22px 18px',
        animation: 'ntFade 0.2s ease',
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 820,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            color: '#f3f2ec',
            background: 'rgba(243,242,236,0.12)',
            border: '1px solid rgba(243,242,236,0.25)',
            padding: '9px 15px',
            borderRadius: 11,
            cursor: 'pointer',
          }}
        >
          ← Retour
        </button>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#c2cbb4' }}>
          Le prix est calculé par le moteur déterministe, pas par l&apos;IA
        </div>
      </div>

      {/* Chat widget */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 820,
          flex: 1,
          minHeight: 0,
          animation: 'ntZoom 0.24s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <Chat seedMessage={seedQuery} />
      </div>
    </div>
  )
}
