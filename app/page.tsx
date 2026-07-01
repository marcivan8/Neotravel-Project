'use client'

// ─────────────────────────────────────────────
// NeoTravel — Landing Page
// Full marketing page matching the prototype:
// hero, social proof, features, FAQ, footer,
// floating chat bubble.
// ─────────────────────────────────────────────

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ChatModal from '@/components/ChatModal'
import Logo from '@/components/Logo'

const FAQ_DATA = [
  {
    q: 'Comment obtenir un devis avec NeoTravel ?',
    a: "Ouvrez l'assistant (la bulle en bas à droite ou « Demander un devis »), décrivez votre voyage de groupe — départ, destination, date et nombre de passagers — et recevez un devis instantané et transparent.",
  },
  {
    q: 'Comment le prix est-il calculé ?',
    a: "Par un moteur de règles déterministe : tarif de l'autocar, distance, saisonnalité, délai de réservation, capacité et options, plus la marge et la TVA. Le calcul est documenté et auditable — jamais laissé à l'IA ni au hasard.",
  },
  {
    q: 'NeoTravel possède-t-il ses propres autocars ?',
    a: "Non. Depuis 2010, NeoTravel orchestre la mise en relation avec un réseau d'autocaristes partenaires qualifiés, et sécurise chaque prestation de bout en bout.",
  },
  {
    q: 'Et pour les très grands groupes ou demandes complexes ?',
    a: "Au-delà de 85 passagers, ou pour un besoin atypique (multi-villes, besoins spécifiques), l'assistant passe le relais à un conseiller humain qui construit une offre sur mesure.",
  },
  {
    q: 'Comment se passe la réservation après le devis ?',
    a: "Une fois le devis accepté dans le chat, un agent de réservation NeoTravel prend le relais : il mobilise l'autocariste partenaire et vous recontacte pour finaliser.",
  },
  {
    q: 'Pour qui est NeoTravel ?',
    a: "Pour tout groupe ayant besoin d'un autocar avec chauffeur : associations, clubs sportifs, écoles, entreprises, comités, collectivités et particuliers.",
  },
]

export default function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [seedQuery, setSeedQuery] = useState('')
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [bubbleInput, setBubbleInput] = useState('')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const openChat = (seed = '') => {
    setSeedQuery(seed)
    setChatOpen(true)
    setBubbleOpen(false)
  }

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: '#000000', background: '#f3f2ec', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <NavBar activePage="landing" />

      {/* ══ HERO ══ */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '54px 30px 64px',
        background: 'radial-gradient(1100px 480px at 78% -8%, rgba(142, 163, 30, 0.2), transparent 60%), #f3f2ec',
      }}>
        <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 50 }}>

          {/* Left: copy */}
          <div className="nt-fade-up" style={{ flex: '1 1 380px', maxWidth: 520 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#fff',
              border: '1px solid rgba(46,58,31,0.1)',
              padding: '6px 13px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#2e3a1f',
              marginBottom: 22,
            }}>
              ⭐ 4,9 · 1 200 groupes transportés chaque année
            </div>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(33px, 4.6vw, 58px)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: '#000000',
              margin: '0 0 18px',
            }}>
              Le voyage de groupe en autocar, sans prise de tête.
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.6, color: '#1e2019', maxWidth: 450, margin: '0 0 28px' }}>
              Associations, écoles, entreprises, collectivités — NeoTravel organise votre trajet et mobilise le bon autocariste, depuis 2010. Un devis instantané, un conseiller quand il le faut.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
              <button
                onClick={() => openChat()}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: 'var(--nt-lime-fg)',
                  background: 'var(--nt-lime)',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: 13,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(142, 163, 30, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Demander un devis →
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px 20px' }}>
              {['Devis instantané & auditable', 'Conseiller humain pour les cas complexes'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, color: '#33382a' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--nt-lime)', color: 'var(--nt-lime-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: image + badges */}
          <div className="nt-fade-up" style={{ flex: '1 1 380px', maxWidth: 540, width: '100%', position: 'relative', height: 460, animationDelay: '0.15s' }}>
            <div style={{
              height: '100%',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(46,58,31,0.12)',
              background: '#dfe3d2',
              boxShadow: '0 34px 70px -34px rgba(46,58,31,0.45)',
              position: 'relative',
            }}>
              <Image
                src="/images/hero_autocar.png"
                alt="Premium autocar NeoTravel"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 540px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            {/* Stats badges */}
            <div style={{ position: 'absolute', left: 18, bottom: 18, right: 18, display: 'flex', gap: 10, flexWrap: 'wrap', zIndex: 10 }}>
              {[
                { label: 'Devis moyen', value: 'en 2 minutes', dark: false },
                { label: 'Autocaristes partenaires', value: '+120 en France', dark: true },
              ].map((b) => (
                <div key={b.label} className="nt-hover-lift" style={{
                  background: b.dark ? 'rgba(46,58,31,0.94)' : 'rgba(255,255,255,0.94)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 13,
                  padding: '11px 14px',
                  boxShadow: '0 8px 22px -12px rgba(0,0,0,0.4)',
                  cursor: 'default',
                }}>
                  <div style={{ fontSize: 11.5, color: b.dark ? '#bcc6a6' : '#5e6255', fontWeight: 600 }}>{b.label}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: b.dark ? '#f3f2ec' : '#000000' }}>{b.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SOCIAL PROOF ══ */}
      <section style={{ background: '#2e3a1f', padding: '18px 26px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px 38px', color: '#c2cbb4', fontSize: 13.5 }}>
          <span style={{ fontWeight: 600 }}>Ils voyagent avec NeoTravel</span>
          <span style={{ opacity: 0.5 }}>•</span>
          {['Lycée Jean-Moulin', 'ASC Handball', 'Mairie de Sète', 'CE\u00a0Veolia', 'Université de Lyon'].map((n) => (
            <span key={n} style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="fonctionnalites" style={{ scrollMarginTop: 78, padding: '80px 26px', background: '#f3f2ec' }}>
        <div style={{ maxWidth: 1130, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 50px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5e6255', marginBottom: 12 }}>
              Une réservation qui parle votre langue
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#000000', margin: '0 0 14px' }}>
              De la demande au devis, sans formulaire
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#1e2019', margin: 0 }}>
              NeoTravel combine une intelligence artificielle conversationnelle pour recueillir votre besoin et un moteur de calcul de devis déterministe.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 50 }}>
            {[
              { title: 'IA conversationnelle', desc: 'Décrivez votre trajet, vos dates et le profil des voyageurs de façon naturelle, comme avec un conseiller par SMS.', icon: '💬' },
              { title: 'Calcul transparent & immédiat', desc: 'Dès que la demande est claire, le prix exact s\'affiche instantanément. Pas d\'attente, pas de surprise.', icon: '📊' },
              { title: 'Précision et conformité', desc: 'Notre moteur tarifaire applique les règles de prix réelles de l\'autocar (distance, temps de conduite, saison). Le tarif est auditable et garanti.', icon: '⚖️' },
            ].map((f, i) => (
              <div key={f.title} className="nt-hover-lift" style={{
                background: '#fff',
                border: '1px solid rgba(46,58,31,0.08)',
                borderRadius: 18,
                padding: '24px 26px',
                boxShadow: '0 8px 30px -12px rgba(46,58,31,0.15)',
                transition: 'transform 0.3s ease',
                animationDelay: `${i * 0.08}s`,
              }}>
                <span style={{ fontSize: 24, marginBottom: 14, display: 'inline-block' }}>{f.icon}</span>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: '#000000', margin: '0 0 9px' }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#1e2019', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION ══ */}
      <section id="faq" style={{ scrollMarginTop: 70, padding: '80px 26px', background: '#ffffff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#000000', margin: '0 0 36px', textAlign: 'center' }}>
            Questions fréquentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ_DATA.map((faq, i) => {
              const isOpen = faqOpen === i
              return (
                <div key={i} style={{ border: '1px solid rgba(46,58,31,0.12)', borderRadius: 14, overflow: 'hidden', background: '#faf9f4' }}>
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                      textAlign: 'left',
                      font: 'inherit',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#000000',
                      background: 'transparent',
                      border: 'none',
                      padding: '18px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ flex: 'none', fontSize: 20, color: '#5e6255', fontWeight: 400 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 19px', fontSize: 15, lineHeight: 1.6, color: '#1e2019' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#171b0f', color: '#c2cbb4', padding: '60px 26px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1130, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', paddingBottom: 48 }}>
          <div style={{ flex: '1 1 300px', maxWidth: 340 }}>
            <div style={{ marginBottom: 16 }}>
              <Logo theme="dark" height={36} />
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
              L&apos;intermédiaire qui organise vos voyages de groupe en autocar depuis 2010. Un assistant chaleureux, un conseiller humain quand il le faut.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 50, flexWrap: 'wrap' }}>
            {[
              { title: 'Voyager', links: ['Demander un devis', 'Voyages scolaires', 'Associations & clubs', 'Entreprises & séminaires'] },
              { title: 'Aide', links: ['FAQ', 'Nous contacter', 'Suivi de réservation'] },
              { title: 'NeoTravel', links: ['À propos', 'Nos partenaires', 'Carrières'] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f3f2ec', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <Link key={l} href="/assistant" style={{ fontSize: 14.5, color: '#c2cbb4', textDecoration: 'none' }}>
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1130, margin: '0 auto', borderTop: '1px solid rgba(243,242,236,0.1)', padding: '20px 0', fontSize: 13, color: '#8b9379' }}>
          © 2026 NeoTravel. Tous droits réservés.
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(70px, 17vw, 230px)', lineHeight: 0.82, letterSpacing: '-0.04em', color: '#21270f', textAlign: 'center', margin: '0 0 -0.12em', userSelect: 'none' }}>
          NeoTravel
        </div>
      </footer>

      {/* Floating launcher bubble */}
      <div style={{ position: 'fixed', right: 26, bottom: 26, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {bubbleOpen && (
          <div className="nt-fade-up" style={{
            background: '#fff',
            border: '1px solid rgba(46,58,31,0.14)',
            borderRadius: 18,
            width: 320,
            padding: 16,
            boxShadow: '0 16px 36px -12px rgba(46,58,31,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2e3a1f' }}>
              🚌 Bonjour ! Où souhaitez-vous voyager en groupe ?
            </div>
            <textarea
              value={bubbleInput}
              onChange={(e) => setBubbleInput(e.target.value)}
              placeholder="Ex: Paris vers Lyon le 14 Juillet pour 50 passagers..."
              style={{
                width: '100%',
                height: 72,
                borderRadius: 10,
                border: '1px solid #c8cbd0',
                padding: 10,
                fontFamily: 'inherit',
                fontSize: 13,
                outline: 'none',
                resize: 'none',
              }}
            />
            <button
              onClick={() => openChat(bubbleInput)}
              style={{
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--nt-lime-fg)',
                background: 'var(--nt-lime)',
                border: 'none',
                padding: '9px 12px',
                borderRadius: 9,
                cursor: 'pointer',
              }}
            >
              Démarrer le devis →
            </button>
          </div>
        )}

        <button
          onClick={() => setBubbleOpen(!bubbleOpen)}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#2e3a1f',
            border: 'none',
            boxShadow: '0 8px 24px -6px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          {bubbleOpen ? '✕' : '💬'}
        </button>
      </div>

      <ChatModal open={chatOpen} seedQuery={seedQuery} onClose={() => setChatOpen(false)} />
    </div>
  )
}
