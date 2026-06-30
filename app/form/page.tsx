'use client'

// ─────────────────────────────────────────────
// NeoTravel — Form Fallback
// For users who don't want to use the chatbot.
// Submits directly to the save_lead API endpoint.
// ─────────────────────────────────────────────

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const OPTIONS = ['Guide accompagnateur', 'Nuit chauffeur', 'Péages inclus'] as const

export default function FormPage() {
  const [state, setState] = useState<FormState>('idle')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  function toggleOption(opt: string) {
    setSelectedOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')

    const fd = new FormData(e.currentTarget)
    const body = {
      prospect_nom:   fd.get('nom'),
      prospect_email: fd.get('email'),
      prospect_tel:   fd.get('tel'),
      origine:        fd.get('origine'),
      destination:    fd.get('destination'),
      date_depart:    fd.get('date_depart'),
      nb_passagers:   Number(fd.get('nb_passagers')),
      type_vehicule:  fd.get('type_vehicule'),
      options:        selectedOptions.map((o) =>
        o === 'Guide accompagnateur' ? 'Guide'
        : o === 'Nuit chauffeur' ? 'Nuit chauffeur'
        : 'Péages'
      ),
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setState(res.ok ? 'success' : 'error')
    } catch {
      setState('error')
    }
  }

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, color: '#1a1a1a', background: '#fff', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: '#444', marginBottom: 5,
  }

  if (state === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="nt-fade-up" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#3f9d5a" strokeWidth="4" />
              <path
                className="nt-success-checkmark"
                d="M23 41L34 52L57 29"
                stroke="#3f9d5a"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Demande envoyée !</h2>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
            Nous allons vous envoyer un devis par email dans quelques instants.
          </p>
          <Link href="/" style={{
            color: 'var(--nt-green)', fontSize: 14.5, textDecoration: 'none',
            border: '1px solid var(--nt-green)', padding: '10px 22px', borderRadius: 9,
            fontWeight: 600, display: 'inline-block',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--nt-green)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--nt-green)'; }}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>

      {/* Header */}
      <header style={{
        background: 'var(--nt-green)', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>
          ← Retour au chat
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Formulaire de demande</span>
      </header>

      <div className="nt-fade-up" style={{ maxWidth: 560, margin: '32px auto', padding: '0 16px 40px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Demander un devis</h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>
          Remplissez ce formulaire et nous vous enverrons un devis par email.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Contact */}
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--nt-green)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contact
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle} htmlFor="nom">Nom / Organisation *</label>
                <input id="nom" name="nom" required className="nt-form-input" style={inputStyle} placeholder="Sophie Martin" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" required className="nt-form-input" style={inputStyle} placeholder="sophie@exemple.fr" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle} htmlFor="tel">Téléphone (optionnel)</label>
              <input id="tel" name="tel" type="tel" className="nt-form-input" style={inputStyle} placeholder="+33 6 00 00 00 00" />
            </div>
          </fieldset>

          {/* Trip */}
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--nt-green)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trajet
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle} htmlFor="origine">Ville de départ *</label>
                <input id="origine" name="origine" required className="nt-form-input" style={inputStyle} placeholder="Paris" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="destination">Ville d'arrivée *</label>
                <input id="destination" name="destination" required className="nt-form-input" style={inputStyle} placeholder="Lyon" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="date_depart">Date de départ *</label>
                <input id="date_depart" name="date_depart" type="date" required className="nt-form-input" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="nb_passagers">Nombre de passagers *</label>
                <input id="nb_passagers" name="nb_passagers" type="number" required min={1} max={85} className="nt-form-input" style={inputStyle} placeholder="45" />
              </div>
            </div>
          </fieldset>

          {/* Vehicle + options */}
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--nt-green)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Véhicule & options
            </legend>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="type_vehicule">Type de véhicule</label>
              <select id="type_vehicule" name="type_vehicule" className="nt-form-input" style={{ ...inputStyle }}>
                <option value="Standard">Standard</option>
                <option value="Grand tourisme">Grand tourisme</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OPTIONS.map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(opt)}
                    onChange={() => toggleOption(opt)}
                    style={{ width: 16, height: 16, accentColor: 'var(--nt-green)', cursor: 'pointer' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Error */}
          {state === 'error' && (
            <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c0392b' }}>
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={state === 'loading'}
            style={{
              background: state === 'loading' ? '#aaa' : 'var(--nt-green)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '13px 24px', fontSize: 15, fontWeight: 500,
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => { if (state !== 'loading') e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            {state === 'loading' ? 'Envoi en cours…' : 'Recevoir mon devis par email'}
          </button>

        </form>
      </div>
    </div>
  )
}
