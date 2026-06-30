'use client'

// ─────────────────────────────────────────────
// NeoTravel — Updated Typing Indicator
// Matches prototype: 3 animated dots with bot icon.
// ─────────────────────────────────────────────

import Image from 'next/image'

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', alignSelf: 'flex-start' }}>
      <Image src="/logo-assistant-icon.svg" alt="" width={27} height={27} style={{ borderRadius: '50%', flexShrink: 0 }} />
      <div style={{
        background: '#fff',
        border: '1px solid #e7e6dd',
        padding: '13px 16px',
        borderRadius: '14px 14px 14px 4px',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#9aa48a',
              animation: `ntDot 1.1s infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
