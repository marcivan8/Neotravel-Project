'use client'

// ─────────────────────────────────────────────
// NeoTravel — Assistant Explore Page
// /assistant — browse inspiration cards, then
// open a seeded chat. Also reads ?q= from URL.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import ChatModal from '@/components/ChatModal'

const CHIPS = [
  ['Voyages scolaires', "Je veux organiser un voyage scolaire en autocar pour ma classe."],
  ['Clubs sportifs', "Déplacement d'un club sportif en autocar pour une compétition."],
  ['Séminaires', "Transport en autocar pour un séminaire d'entreprise."],
  ['Associations', "Sortie d'association en autocar à la journée."],
  ['Collectivités', "Transport de groupe pour une collectivité."],
  ['Sorties culturelles', "Sortie culturelle en autocar pour un groupe."],
]

const CARDS = [
  { id: 'scolaire', tag: '🎒 Voyage scolaire', title: 'Paris → Versailles', sub: 'À la journée · 55 élèves', seed: 'Voyage scolaire Paris → Versailles, 55 élèves, à la journée le 12/07.', image: '/images/destination_versailles.png' },
  { id: 'club', tag: '⚽ Club sportif', title: 'Lyon → Annecy', sub: 'Week-end · 30 joueurs', seed: 'Déplacement club sportif Lyon → Annecy, 30 joueurs, samedi prochain.', image: '/images/destination_annecy.png' },
  { id: 'seminaire', tag: '💼 Séminaire', title: 'Nantes → La Baule', sub: '2 jours · 48 collaborateurs', seed: "Séminaire d'entreprise Nantes → La Baule, 48 collaborateurs, sur 2 jours.", image: '/images/destination_labaule.png' },
  { id: 'asso', tag: '🎭 Association', title: 'Marseille → Avignon', sub: 'À la journée · 50 personnes', seed: 'Sortie association Marseille → Avignon, 50 personnes, à la journée.', image: '/images/destination_avignon.png' },
  { id: 'collectivite', tag: '🏛 Collectivité', title: 'Lille → Bruxelles', sub: 'À la journée · 60 personnes', seed: 'Sortie collectivité Lille → Bruxelles, 60 personnes, à la journée.', image: '/images/destination_bruxelles.png' },
  { id: 'culture', tag: '🍇 Sortie culturelle', title: 'Bordeaux → Saint-Émilion', sub: 'À la journée · 44 personnes', seed: 'Sortie culturelle Bordeaux → Saint-Émilion, 44 personnes, à la journée.', image: '/images/destination_saintemilion.png' },
]

export default function AssistantPage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [seedQuery, setSeedQuery] = useState('')
  const [askInput, setAskInput] = useState('')

  // Read ?q= from URL on mount
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('q')
      if (q?.trim()) {
        setSeedQuery(q.trim())
        setChatOpen(true)
      }
    } catch { /* ignore */ }
  }, [])

  const openChat = (seed: string) => {
    setSeedQuery(seed)
    setChatOpen(true)
  }

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: '#1b1f15', background: '#f5f4ee', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <NavBar activePage="assistant" />

      {/* ══ HERO SEARCH ══ */}
      <section className="nt-fade-up" style={{ maxWidth: 1060, margin: '0 auto', padding: '56px 26px 18px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: '#fff',
          border: '1px solid rgba(46,58,31,0.12)',
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 600,
          color: '#2e3a1f',
          marginBottom: 20,
        }}>
          ✦ Assistant de voyage de groupe
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(34px, 5vw, 58px)',
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          color: '#15180e',
          margin: '0 auto 16px',
          maxWidth: 760,
        }}>
          Où emmenez-vous votre groupe ?
        </h1>
        <p style={{ fontSize: 17.5, lineHeight: 1.55, color: '#565a4d', margin: '0 auto 30px', maxWidth: 540 }}>
          Décrivez votre voyage en autocar en une phrase. L&apos;assistant qualifie, propose un devis instantané, et passe le relais à un humain si besoin.
        </p>

        {/* Search bar */}
        <div className="nt-fade-up" style={{
          maxWidth: 680,
          margin: '0 auto',
          background: '#fff',
          border: '1px solid rgba(46,58,31,0.14)',
          borderRadius: 18,
          boxShadow: '0 18px 44px -22px rgba(46,58,31,0.35)',
          padding: '8px 8px 8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animationDelay: '0.1s',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0, color: '#7c9b2e' }}>✦</span>
          <input
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') openChat(askInput.trim()) }}
            placeholder="Ex. Paris → Lyon, 45 passagers, le 12 juillet…"
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 16, background: 'transparent', color: '#1b1f15', minWidth: 0, padding: '12px 0' }}
          />
          <button
            onClick={() => openChat(askInput.trim())}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              color: '#1f2613',
              background: '#c2e84a',
              border: 'none',
              padding: '13px 20px',
              borderRadius: 13,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            Lancer <span style={{ fontSize: 17 }}>↑</span>
          </button>
        </div>

        {/* Chips */}
        <div className="nt-fade-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 9, marginTop: 18, animationDelay: '0.18s' }}>
          {CHIPS.map(([label, seed]) => (
            <button
              key={label}
              onClick={() => openChat(seed)}
              style={{
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                color: '#3a4030',
                background: '#fff',
                border: '1px solid rgba(46,58,31,0.16)',
                padding: '8px 14px',
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = '#f4f6ee'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.backgroundColor = '#fff'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ══ INSPIRATION CARDS ══ */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '34px 26px 70px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: '#15180e' }}>
            Inspirations de voyages de groupe
          </div>
          <div style={{ fontSize: 13.5, color: '#8a8f7d' }}>Cliquez sur « Planifier » pour démarrer</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 18 }}>
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              className="nt-fade-up nt-hover-lift"
              style={{
                position: 'relative',
                height: 264,
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid rgba(46,58,31,0.1)',
                background: '#dfe3d2',
                animationDelay: `${i * 0.08}s`,
                cursor: 'pointer',
              }}
              onClick={() => openChat(card.seed)}
            >
              {/* Card background image with hover zoom */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 264px"
                  className="nt-hover-zoom"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(21,24,14,0) 30%, rgba(21,24,14,0.82) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 14,
                zIndex: 10,
              }}>
                <span style={{ alignSelf: 'flex-start', fontSize: 11.5, fontWeight: 700, color: '#1f2613', background: '#c2e84a', padding: '3px 9px', borderRadius: 6 }}>
                  {card.tag}
                </span>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 19, color: '#fff', lineHeight: 1.1 }}>{card.title}</div>
                  <div style={{ fontSize: 12.5, color: '#dfe3d2', margin: '3px 0 11px' }}>{card.sub}</div>
                  <button
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1f2613',
                      background: '#fff',
                      border: 'none',
                      padding: '9px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c2e84a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    Planifier ce trajet →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full-screen chat modal */}
      <ChatModal open={chatOpen} seedQuery={seedQuery} onClose={() => setChatOpen(false)} />
    </div>
  )
}
