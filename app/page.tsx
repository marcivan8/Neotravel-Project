'use client'

// ─────────────────────────────────────────────
// NeoTravel — Landing Page
// Full marketing page matching the prototype:
// hero, social proof, features, FAQ, footer,
// floating chat bubble.
// ─────────────────────────────────────────────

import { useState } from 'react'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import ChatModal from '@/components/ChatModal'

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
    <div style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: '#15180e', background: '#f3f2ec', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <NavBar activePage="landing" />

      {/* ══ HERO ══ */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '54px 30px 64px',
        background: 'radial-gradient(1100px 480px at 78% -8%, rgba(194,232,74,0.2), transparent 60%), #f3f2ec',
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
              color: '#15180e',
              margin: '0 0 18px',
            }}>
              Le voyage de groupe en autocar, sans prise de tête.
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.6, color: '#565a4d', maxWidth: 450, margin: '0 0 28px' }}>
              Associations, écoles, entreprises, collectivités — NeoTravel organise votre trajet et mobilise le bon autocariste, depuis 2010. Un devis instantané, un conseiller quand il le faut.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
              <button
                onClick={() => openChat()}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: '#1f2613',
                  background: '#c2e84a',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: 13,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(194, 232, 74, 0.45)';
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
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: '#c2e84a', color: '#1f2613', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>✓</span>
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
                  <div style={{ fontSize: 11.5, color: b.dark ? '#bcc6a6' : '#6b7059', fontWeight: 600 }}>{b.label}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: b.dark ? '#f3f2ec' : '#15180e' }}>{b.value}</div>
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
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c8568', marginBottom: 12 }}>
              Une réservation qui parle votre langue
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#15180e', margin: '0 0 14px' }}>
              De la demande au devis, sans formulaire
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#565a4d', margin: 0 }}>
              L&apos;assistant qualifie votre besoin et notre moteur calcule un prix juste et transparent. Dès qu&apos;une demande sort de l&apos;ordinaire, un conseiller humain prend le relais.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))', gap: 20 }}>
            {[
              { icon: '💬', title: 'Décrivez votre besoin', text: "Parlez naturellement de votre voyage de groupe. L'assistant qualifie la demande et détecte les informations manquantes." },
              { icon: '📐', title: 'Un devis au juste prix', text: "Saison, distance, délai, capacité, options : le prix est calculé par un moteur déterministe et auditable — pas par l'IA." },
              { icon: '🤝', title: 'Un humain pour les cas complexes', text: "Très grand groupe ou demande atypique ? L'assistant passe le relais à un conseiller NeoTravel." },
              { icon: '🚌', title: 'Le bon autocariste, à chaque fois', text: 'Depuis 2010, NeoTravel mobilise un réseau de partenaires qualifiés et sécurise votre prestation.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="nt-fade-up nt-hover-lift"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(46,58,31,0.09)',
                  borderRadius: 18,
                  padding: 26,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: '#2e3a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 19, color: '#15180e', margin: '0 0 9px' }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#5b5f52', margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ scrollMarginTop: 78, padding: '60px 26px 80px', background: '#f3f2ec' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 3.6vw, 42px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#15180e', margin: '0 0 36px', textAlign: 'center' }}>
            Questions fréquentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ_DATA.map((f, i) => (
              <div key={i} style={{ border: '1px solid rgba(46,58,31,0.12)', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#15180e',
                    background: 'transparent',
                    border: 'none',
                    padding: '18px 20px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{f.q}</span>
                  <span style={{
                    flexShrink: 0,
                    fontSize: 20,
                    color: '#7c8568',
                    fontWeight: 400,
                    transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}>
                    {faqOpen === i ? '−' : '+'}
                  </span>
                </button>
                <div style={{
                  maxHeight: faqOpen === i ? '150px' : '0px',
                  opacity: faqOpen === i ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, padding 0.35s ease',
                  padding: faqOpen === i ? '0 20px 19px' : '0 20px 0',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: '#565a4d',
                }}>
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#171b0f', color: '#c2cbb4', padding: '60px 26px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1130, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between', paddingBottom: 48 }}>
          <div style={{ flex: '1 1 300px', maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: '#f3f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Image src="/logo-neotravel-icon.svg" alt="" width={28} height={28} />
              </span>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: '-0.025em', color: '#f3f2ec' }}>NeoTravel</span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
              L&apos;intermédiaire qui organise vos voyages de groupe en autocar depuis 2010. Un assistant chaleureux, un conseiller humain quand il le faut.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 50, flexWrap: 'wrap' }}>
            {[
              { title: 'Voyager', links: ['Demander un devis', 'Voyages scolaires', 'Associations & clubs', 'Entreprises & séminaires'] },
              { title: 'Aide', links: ['FAQ', 'Nous contacter'] },
              { title: 'NeoTravel', links: ['À propos', 'Carrières'] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f3f2ec', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5 }}>
                  {col.links.map((l) => (
                    <a key={l} href="#" style={{ color: '#c2cbb4', textDecoration: 'none' }}>{l}</a>
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
      {/* Full-screen chat modal */}
      <ChatModal open={chatOpen} seedQuery={seedQuery} onClose={() => setChatOpen(false)} />
    </div>
  )
}
