'use client'

// ─────────────────────────────────────────────
// NeoTravel — Devis Card Component
// Rendered as a special rich message type when
// the agent returns a ```devis JSON block.
// ─────────────────────────────────────────────

export interface DevisData {
  ref: string
  trajetLabel: string
  subLabel: string
  rows: { label: string; value: string }[]
  total: string
  urgent: boolean
}

interface Props {
  devis: DevisData
  onAccept: () => void
  onModify: () => void
  onConseiller: () => void
}

export default function DevisCard({ devis, onAccept, onModify, onConseiller }: Props) {
  return (
    <div style={{
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: 410,
      background: '#fff',
      border: '1px solid #d6e2ad',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 8px 22px -12px rgba(46,58,31,0.3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '13px 16px',
        background: '#2e3a1f',
        color: '#f3f2ec',
      }}>
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15 }}>
          Votre devis NeoTravel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#c2e84a',
            background: 'rgba(194,232,74,0.12)',
            border: '1px solid rgba(194,232,74,0.25)',
            padding: '2px 8px',
            borderRadius: 6,
          }}>
            déterministe
          </span>
          <span style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: '#c2cbb4',
            background: 'rgba(243,242,236,0.12)',
            padding: '3px 8px',
            borderRadius: 6,
          }}>
            {devis.ref}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#15180e', marginBottom: 3 }}>
          {devis.trajetLabel}
        </div>
        <div style={{ fontSize: 12.5, color: '#6b6f63', marginBottom: 12 }}>
          {devis.subLabel}
        </div>

        {/* Breakdown rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid #efeee5', paddingTop: 11 }}>
          {devis.rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ color: '#5b5f52' }}>{row.label}</span>
              <span style={{ color: '#15180e', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '2px solid #2e3a1f',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#15180e' }}>Total</span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 21, color: '#15180e' }}>
            {devis.total}
          </span>
        </div>

        {/* Urgent badge */}
        {devis.urgent && (
          <div style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 600,
            color: '#a9762a',
            background: '#fff6e9',
            border: '1px solid #f0d6a4',
            padding: '7px 10px',
            borderRadius: 9,
          }}>
            ⚡ Demande urgente — un conseiller NeoTravel est notifié en priorité.
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.45, color: '#9aa08c' }}>
          Prix calculé par notre moteur déterministe (règles métier NeoTravel), pas par l&apos;IA — transparent et auditable. Marge et TVA 10 % incluses.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, padding: '0 16px 16px' }}>
        <button
          onClick={onAccept}
          style={{
            flex: '1 1 auto',
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: 700,
            color: '#1f2613',
            background: '#c2e84a',
            border: 'none',
            padding: '11px 14px',
            borderRadius: 11,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(194, 232, 74, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Accepter le devis
        </button>
        <button
          onClick={onModify}
          style={{
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: 600,
            color: '#2e3a1f',
            background: '#f1f0e7',
            border: '1px solid rgba(46,58,31,0.16)',
            padding: '11px 13px',
            borderRadius: 11,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.backgroundColor = '#e7e5d8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.backgroundColor = '#f1f0e7';
          }}
        >
          Modifier
        </button>
        <button
          onClick={onConseiller}
          style={{
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: 600,
            color: '#2e3a1f',
            background: '#f1f0e7',
            border: '1px solid rgba(46,58,31,0.16)',
            padding: '11px 13px',
            borderRadius: 11,
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.backgroundColor = '#e7e5d8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.backgroundColor = '#f1f0e7';
          }}
        >
          Un conseiller
        </button>
      </div>
    </div>
  )
}
