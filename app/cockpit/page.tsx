'use client'

// ─────────────────────────────────────────────
// NeoTravel — Internal Cockpit
// /cockpit — CRM dashboard for the commercial team.
// Views: Overview, Pipeline (Kanban), Leads table, Relances.
// Data is mock (same as prototype). Airtable live
// connection is a separate step.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────
type Statut = 'nouveau' | 'qualifie' | 'devis_envoye' | 'relance' | 'gagne' | 'perdu'
type Complexite = 'simple' | 'standard' | 'complexe'

interface Lead {
  ref: string; client: string; type: string; from: string; to: string
  pax: number; dateDepart: string; month: number; jours: number
  source: string; complexite: Complexite; statut: Statut; urgent: boolean
  ar: boolean; options: string[]; contact: string; summary: string; lastAgo: string
  relanceStep?: number
  airtableId?: string
  prixTotal?: number
}

// ── Mock data ──────────────────────────────────
const MOCK_LEADS: Lead[] = [
  { ref:'L-2041', client:'Lycée Jean-Moulin', type:'École', from:'paris', to:'versailles', pax:55, dateDepart:'12/07', month:7, jours:18, source:'SEO', complexite:'standard', statut:'nouveau', urgent:false, ar:false, options:['Guide / accompagnateur'], contact:'M. Berger', summary:'Sortie pédagogique pour 2 classes de seconde, départ tôt le matin, retour en fin de journée.', lastAgo:'il y a 8 min' },
  { ref:'L-2040', client:'ASC Handball', type:'Club sportif', from:'lyon', to:'geneve', pax:30, dateDepart:'28/06', month:6, jours:4, source:'Google Ads', complexite:'simple', statut:'nouveau', urgent:true, ar:true, options:[], contact:'Mme Roche', summary:'Déplacement pour un tournoi, aller-retour dans la journée, besoin d\'une réponse rapide.', lastAgo:'il y a 22 min' },
  { ref:'L-2039', client:'Amicale des Cheminots', type:'Association', from:'nantes', to:'la baule', pax:48, dateDepart:'05/09', month:9, jours:73, source:'Direct', complexite:'standard', statut:'qualifie', urgent:false, ar:true, options:[], contact:'M. Pichon', summary:'Sortie annuelle de l\'amicale, journée à la mer, prévue de longue date.', lastAgo:'il y a 1 h' },
  { ref:'L-2038', client:'Mairie de Sète', type:'Collectivité', from:'montpellier', to:'marseille', pax:60, dateDepart:'19/07', month:7, jours:25, source:'SEO', complexite:'complexe', statut:'qualifie', urgent:false, ar:true, options:['Nuit chauffeur'], contact:'Service événementiel', summary:'Transport pour un festival, plusieurs points de ramassage à confirmer.', lastAgo:'il y a 2 h' },
  { ref:'L-2037', client:'CE Veolia', type:'Entreprise', from:'paris', to:'lille', pax:52, dateDepart:'02/07', month:7, jours:8, source:'Google Ads', complexite:'standard', statut:'devis_envoye', urgent:true, ar:true, options:[], contact:'Mme Faure', summary:'Séminaire d\'équipe sur une journée, aller-retour, budget validé en interne.', lastAgo:'hier' },
  { ref:'L-2036', client:'Université de Lyon', type:'École', from:'grenoble', to:'lyon', pax:45, dateDepart:'15/07', month:7, jours:21, source:'SEO', complexite:'standard', statut:'devis_envoye', urgent:false, ar:true, options:['Guide / accompagnateur'], contact:'M. Andrieu', summary:'Visite de laboratoire pour un groupe d\'étudiants en master.', lastAgo:'il y a 2 j' },
  { ref:'L-2035', client:'Club Aviron Bordeaux', type:'Club sportif', from:'bordeaux', to:'toulouse', pax:28, dateDepart:'11/07', month:7, jours:17, source:'Google Ads', complexite:'simple', statut:'devis_envoye', urgent:false, ar:true, options:[], contact:'Mme Lacombe', summary:'Compétition régionale, aller-retour sur le week-end.', lastAgo:'il y a 2 j' },
  { ref:'L-2033', client:'Collège Voltaire', type:'École', from:'paris', to:'strasbourg', pax:58, dateDepart:'22/07', month:7, jours:28, source:'SEO', complexite:'standard', statut:'relance', urgent:false, ar:true, options:['Nuit chauffeur'], contact:'Mme Klein', relanceStep:2, summary:'Voyage de fin d\'année, nuit sur place, devis en attente de validation du conseil.', lastAgo:'il y a 4 j' },
  { ref:'L-2032', client:'Startup Lab', type:'Entreprise', from:'nantes', to:'rennes', pax:22, dateDepart:'03/07', month:7, jours:9, source:'Google Ads', complexite:'simple', statut:'relance', urgent:true, ar:true, options:[], contact:'M. Texier', relanceStep:1, summary:'Offsite d\'équipe, aller-retour, attend l\'accord du CEO.', lastAgo:'il y a 3 j' },
  { ref:'L-2031', client:'Comité Entreprise SNCF', type:'Entreprise', from:'paris', to:'lyon', pax:63, dateDepart:'18/07', month:7, jours:24, source:'Direct', complexite:'complexe', statut:'gagne', urgent:false, ar:true, options:['Guide / accompagnateur','Nuit chauffeur'], contact:'M. Delaunay', summary:'Week-end collaborateurs, prestation confirmée, acompte reçu.', lastAgo:'il y a 1 j' },
  { ref:'L-2030', client:'Team Trail 06', type:'Club sportif', from:'nice', to:'marseille', pax:35, dateDepart:'29/06', month:6, jours:5, source:'Google Ads', complexite:'simple', statut:'gagne', urgent:true, ar:true, options:[], contact:'Mme Olivier', summary:'Trail régional, transport confirmé pour les coureurs.', lastAgo:'il y a 6 h' },
  { ref:'L-2029', client:'Lycée Pasteur', type:'École', from:'paris', to:'bordeaux', pax:50, dateDepart:'09/07', month:7, jours:15, source:'SEO', complexite:'standard', statut:'perdu', urgent:false, ar:true, options:[], contact:'M. Garnier', summary:'Voyage de classe — budget finalement insuffisant côté établissement.', lastAgo:'il y a 5 j' },
  { ref:'L-2028', client:'Asso Seniors Dijon', type:'Association', from:'dijon', to:'paris', pax:44, dateDepart:'01/07', month:7, jours:7, source:'Téléphone', complexite:'standard', statut:'perdu', urgent:true, ar:true, options:[], contact:'Mme Humbert', summary:'Sortie culturelle — a choisi un autre prestataire sur le délai.', lastAgo:'il y a 6 j' },
  { ref:'L-2027', client:'Groupe Pèlerinage', type:'Association', from:'lyon', to:'montpellier', pax:90, dateDepart:'20/08', month:8, jours:57, source:'Direct', complexite:'complexe', statut:'qualifie', urgent:false, ar:true, options:['Nuit chauffeur'], contact:'M. Reynaud', summary:'Groupe de 90 — nécessite plusieurs autocars, transmis à un conseiller.', lastAgo:'il y a 3 h' },
]

// ── Pricing engine ────────────────────────────
const DIST: Record<string, number> = {
  'lyon|paris':465,'marseille|paris':775,'lille|paris':225,'bordeaux|paris':585,'nantes|paris':385,
  'paris|strasbourg':490,'paris|toulouse':680,'nice|paris':930,'paris|rennes':350,'paris|reims':145,
  'dijon|paris':315,'grenoble|paris':575,'montpellier|paris':750,'lyon|marseille':315,'grenoble|lyon':110,
  'marseille|nice':200,'marseille|montpellier':170,'bordeaux|toulouse':245,'geneve|lyon':150,'nantes|rennes':110,
  'lyon|montpellier':300,'paris|versailles':22,'la baule|nantes':75,
}
function distKm(a: string, b: string): number {
  const k = [a,b].sort().join('|')
  if (DIST[k]) return DIST[k]
  let h = 0; for (const c of k) h = (h*31+c.charCodeAt(0))%100000
  return 120 + (h%460)
}
function calcTtc(l: Lead): number {
  const km = distKm(l.from,l.to)*(l.ar?2:1)
  const dayRate = l.pax<=19?650:l.pax<=53?950:l.pax<=63?1200:l.pax<=67?1350:1600
  const base = dayRate + km*2.2
  const sa = [11,1,2,8].includes(l.month)?-0.07:[3,4,7].includes(l.month)?0.10:[5,6].includes(l.month)?0.15:0
  const ur = l.jours<7?0.10:l.jours<30?0.05:l.jours<90?-0.05:-0.10
  const ca = l.pax<=19?-0.05:l.pax<=53?0:l.pax<=63?0.15:l.pax<=67?0.20:0.40
  const opts = l.options.reduce((a,o)=>a+(o==='Guide / accompagnateur'?80:o==='Nuit chauffeur'?120:0),0)
  const sub = base*(1+sa)*(1+ur)*(1+ca)+opts
  return Math.round(sub*1.15*1.10)
}
function eur(n: number) { return Math.round(n).toLocaleString('fr-FR') }
function getPrice(l: Lead): number {
  return l.prixTotal && l.prixTotal > 0 ? l.prixTotal : calcTtc(l)
}

// ── Meta helpers ──────────────────────────────
const STATUS_META: Record<Statut,{label:string;dot:string;bg:string;fg:string}> = {
  nouveau:     { label:'Nouveau',       dot:'#8aa05a', bg:'#eef1e6', fg:'#5b6a3f' },
  qualifie:    { label:'Qualifié',      dot:'#5d82ad', bg:'#e7eef6', fg:'#3d5e85' },
  devis_envoye:{ label:'Devis envoyé', dot:'#8a6fc0', bg:'#efe9f6', fg:'#5b4a85' },
  relance:     { label:'En relance',    dot:'#e8a13a', bg:'#fdf1e1', fg:'#a9762a' },
  gagne:       { label:'Gagné',         dot:'#3f9d5a', bg:'#e6f3e9', fg:'#2f7d4a' },
  perdu:       { label:'Perdu',         dot:'#b0a59d', bg:'#f1eeec', fg:'#8a7d76' },
}
const COMPLEXITE_META: Record<Complexite,{label:string;bg:string;fg:string}> = {
  simple:   { label:'Simple',   bg:'#eef1e6', fg:'#5b6a3f' },
  standard: { label:'Standard', bg:'#eceef4', fg:'#4a5670' },
  complexe: { label:'Complexe', bg:'#fdeee2', fg:'#b06a32' },
}
const SOURCE_COLOR: Record<string,string> = {
  'Google Ads':'#d98a3a', 'SEO':'#5d9d6a', 'Direct':'#5d82ad', 'Téléphone':'#8a7da0',
}
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
const trajet = (l: Lead) => cap(l.from) + ' → ' + cap(l.to)
const hasDevis = (l: Lead) => ['devis_envoye','relance','gagne','perdu'].includes(l.statut)

const renderTrajet = (from: string, to: string) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontWeight: 700, color: '#2e3a1f', textTransform: 'uppercase', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        {cap(from)}
      </span>
      <span style={{ color: '#8a8f7d', fontWeight: 500 }}>→</span>
      <span style={{ fontWeight: 700, color: '#2e3a1f', textTransform: 'uppercase', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        {cap(to)}
      </span>
    </span>
  )
}

type View = 'overview'|'pipeline'|'leads'|'relances'
type Filter = 'tous'|'non_traites'|'urgents'|'complexes'|'gagnes'

export default function CockpitPage() {
  const [view, setView] = useState<View>('overview')
  const [filter, setFilter] = useState<Filter>('tous')
  const [search, setSearch] = useState('')
  const [drawerId, setDrawerId] = useState<string|null>(null)
  const [toast, setToast] = useState('')
  const [statusOverride, setStatusOverride] = useState<Record<string,Statut>>({})
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const logged = localStorage.getItem('neo_cockpit_logged_in')
    if (logged === 'true') {
      setIsLoggedIn(true)
    }
    setCheckingAuth(false)
  }, [])

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailInput === 'commercial@neotravel.fr' && passwordInput === 'neo2026') {
      localStorage.setItem('neo_cockpit_logged_in', 'true')
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Email ou mot de passe incorrect.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('neo_cockpit_logged_in')
    setIsLoggedIn(false)
  }

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/cockpit')
      const data = await res.json()
      if (data.success) {
        setLeads(data.leads)
      } else {
        console.error('Failed to fetch leads:', data.error)
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const activeLeads = leads.length > 0 ? leads : (loading ? [] : MOCK_LEADS)

  const handleUpdateStatus = async (lead: Lead, newStatus: string, toastMsg: string) => {
    if (!lead.airtableId) {
      setStatusOverride(s => ({ ...s, [lead.ref]: newStatus as Statut }))
      flashToast(toastMsg)
      setDrawerId(null)
      return
    }

    try {
      const res = await fetch('/api/cockpit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.airtableId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        flashToast(toastMsg)
        await fetchLeads()
      } else {
        console.error('Failed to update status:', data.error)
        flashToast('Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      flashToast('Erreur réseau')
    }
    setDrawerId(null)
  }

  const statutOf = (l: Lead): Statut => statusOverride[l.ref] ?? l.statut

  const flashToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const drawerLead = drawerId ? activeLeads.find(l => l.ref === drawerId) : null

  const navItems: { v: View; icon: string; label: string; badge?: string }[] = [
    { v:'overview', icon:'◷', label:'Vue d\'ensemble' },
    { v:'pipeline', icon:'▦', label:'Pipeline' },
    { v:'leads', icon:'☰', label:'Leads', badge: activeLeads.length.toString() },
    { v:'relances', icon:'✉', label:'Relances' },
  ]

  // ── Filter logic ──
  const passFilter = (l: Lead): boolean => {
    const st = statutOf(l)
    if (filter==='non_traites') return st==='nouveau' || st==='qualifie'
    if (filter==='urgents') return l.urgent && !['gagne','perdu'].includes(st)
    if (filter==='complexes') return l.complexite==='complexe'
    if (filter==='gagnes') return st==='gagne'
    return true
  }
  const q = search.trim().toLowerCase()
  const matchSearch = (l: Lead) => !q || l.client.toLowerCase().includes(q) || l.from.includes(q) || l.to.includes(q) || l.ref.toLowerCase().includes(q)
  const filtered = activeLeads.filter(l => passFilter(l) && matchSearch(l))

  const viewTitles: Record<View,[string,string]> = {
    overview: ['Vue d\'ensemble', 'Pilotage du flux commercial en temps réel'],
    pipeline: ['Pipeline commercial', 'Suivi des opportunités, de la captation à la signature'],
    leads: ['Leads centralisés', 'Toutes les demandes, qualifiées automatiquement'],
    relances: ['Relances automatiques', 'Séquences emailing déclenchées par l\'agent'],
  }
  const [viewTitle, viewSubtitle] = viewTitles[view]

  const columnOrder: Statut[] = ['nouveau','qualifie','devis_envoye','relance','gagne','perdu']

  if (checkingAuth) {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#1b2110', color:'#f3f2ec', fontFamily:"'Hanken Grotesk',sans-serif" }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:10, animation:'ntPulse 1.5s infinite' }}>🚌</div>
          <div style={{ fontSize:14.5, fontWeight:600 }}>Vérification de la session...</div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div style={{ 
        display:'flex', 
        height:'100vh', 
        alignItems:'center', 
        justifyContent:'center', 
        background:'linear-gradient(135deg, #1b2110 0%, #2e3a1f 100%)',
        fontFamily:"'Hanken Grotesk',system-ui,sans-serif",
        color:'#1b1f15'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.93)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          animation: 'ntPop 0.25s ease'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 34, background: '#1b2110', padding: 12, borderRadius: 16, display: 'inline-block', marginBottom: 14 }}>🚌</span>
            <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 24, color: '#1b2110', margin: 0 }}>NeoTravel CRM</h2>
            <p style={{ fontSize: 13, color: '#6b7059', margin: '4px 0 0' }}>Espace sécurisé pour les commerciaux</p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e3a1f', marginBottom: 6, textTransform: 'uppercase' }}>Email Professionnel</label>
              <input 
                type="email" 
                required
                value={emailInput} 
                onChange={e => setEmailInput(e.target.value)} 
                placeholder="commercial@neotravel.fr" 
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #c8cbd0', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e3a1f', marginBottom: 6, textTransform: 'uppercase' }}>Mot de Passe</label>
              <input 
                type="password" 
                required
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #c8cbd0', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
              />
            </div>

            {loginError && (
              <div style={{ fontSize: 13, color: '#b4471f', background: '#fbeae3', border: '1px solid #f0c9b8', padding: '9px 12px', borderRadius: 8, fontWeight: 500 }}>
                ⚠️ {loginError}
              </div>
            )}

            <button 
              type="submit" 
              style={{
                fontFamily: 'inherit',
                fontSize: 14.5,
                fontWeight: 700,
                color: '#1f2613',
                background: '#c2e84a',
                border: 'none',
                padding: 12,
                borderRadius: 10,
                cursor: 'pointer',
                marginTop: 6,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#b1d43e'}
              onMouseLeave={e => e.currentTarget.style.background = '#c2e84a'}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Hanken Grotesk',system-ui,sans-serif", color:'#1b1f15', background:'#f5f4ee', WebkitFontSmoothing:'antialiased' }}>

      {/* ── Sidebar ── */}
      <aside style={{ flexShrink:0, width:236, background:'#1b2110', color:'#c2cbb4', display:'flex', flexDirection:'column', padding:'18px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 8px 20px' }}>
          <span style={{ width:34, height:34, borderRadius:10, background:'#c2e84a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            🚌
          </span>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:18, letterSpacing:'-0.02em', color:'#f3f2ec', lineHeight:1 }}>NeoTravel</div>
            <div style={{ fontSize:11, color:'#c2cbb4', marginTop:2 }}>Cockpit commercial</div>
          </div>
        </div>

        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#aab495', padding:'8px 10px 6px' }}>Pilotage</div>
        {navItems.map(n => (
          <button
            key={n.v}
            onClick={() => setView(n.v)}
            style={{
              display:'flex', alignItems:'center', gap:11, width:'100%',
              fontFamily:'inherit', fontSize:13.5, fontWeight:600,
              cursor:'pointer', border:'none', borderRadius:10, padding:'10px 11px', marginBottom:3,
              ...(view===n.v ? { background:'#2e3a1f', color:'#f3f2ec' } : { background:'transparent', color:'#aab495' }),
            }}
          >
            <span style={{ fontSize:16, width:20, textAlign:'center', flexShrink:0 }}>{n.icon}</span>
            <span style={{ flex:1, textAlign:'left' }}>{n.label}</span>
            {n.badge && <span style={{ fontSize:11, fontWeight:700, background:'#c2e84a', color:'#1f2613', padding:'1px 7px', borderRadius:999 }}>{n.badge}</span>}
          </button>
        ))}

        <div style={{ flex:1 }} />
        <div style={{ background:'#222a15', border:'1px solid #2f3a1d', borderRadius:12, padding:13, marginBottom:12 }}>
          <div style={{ fontSize:12, color:'#b2bca0', lineHeight:1.45, marginBottom:9 }}>La captation se fait sur la landing conversationnelle.</div>
          <a href="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, textDecoration:'none', fontSize:12.5, fontWeight:700, color:'#1f2613', background:'#c2e84a', padding:8, borderRadius:9 }}>
            ↗ Voir la landing
          </a>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 8px', borderTop:'1px solid rgba(243,242,236,0.1)', paddingTop:15 }}>
          <span style={{ width:30, height:30, borderRadius:'50%', background:'#3a4030', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#c2e84a', flexShrink:0 }}>CB</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#e7ebda', lineHeight:1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Claire Bonnet</div>
            <button 
              onClick={handleLogout}
              style={{ background:'transparent', border:'none', color:'#c2e84a', fontSize:11, padding:0, cursor:'pointer', fontWeight:600, textDecoration:'underline', display:'block', marginTop:2 }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden', background:'#f5f4ee' }}>

        {/* Header */}
        <header style={{ flexShrink:0, display:'flex', alignItems:'center', gap:16, padding:'16px 26px', background:'#fff', borderBottom:'1px solid rgba(46,58,31,0.1)' }}>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:21, letterSpacing:'-0.02em', color:'#15180e', lineHeight:1.1 }}>{viewTitle}</div>
            <div style={{ fontSize:13, color:'#565a4d', marginTop:1 }}>{viewSubtitle}</div>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid rgba(46,58,31,0.14)', borderRadius:10, padding:'8px 12px', width:220 }}>
            <span style={{ fontSize:14, color:'#9aa090' }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un lead…" style={{ flex:1, border:'none', outline:'none', fontFamily:'inherit', fontSize:13.5, background:'transparent', color:'#1b1f15', minWidth:0 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:600, color:'#3a4030', background:'#e6f3e9', border:'1px solid #c5e3cd', padding:'8px 12px', borderRadius:10 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#3f9d5a', display:'inline-block' }} />Agent IA actif
          </div>
        </header>

        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {loading && leads.length === 0 && (
            <div style={{ height:'100%', minHeight:'300px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#2e3a1f', gap:12, padding:40 }}>
              <span style={{ fontSize:32, animation:'ntPulse 1.5s infinite' }}>🚌</span>
              <div style={{ fontSize:14.5, fontWeight:600, color:'#2e3a1f' }}>Chargement des données Airtable...</div>
            </div>
          )}

          <div key={view} className="nt-fade-up">
            {/* ══ OVERVIEW ══ */}
            {!loading && view==='overview' && (
              <div style={{ padding:'24px 26px 40px' }}>
                {/* KPIs */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(192px,1fr))', gap:14, marginBottom:22 }}>
                  {[
                    { label:'Leads aujourd\'hui', value:'60', delta:'+12', up:true, note:'Flux entrant régulier (Ads + SEO)' },
                    { label:'Traités automatiquement', value:'95 %', delta:'+33 pts', up:true, note:'Avant automatisation : 62 %' },
                    { label:'Taux de transformation', value:'24 %', delta:'+8 pts', up:true, note:'Devis acceptés / leads qualifiés' },
                    { label:'Délai 1er contact', value:'2 min', delta:'−9 h', up:true, note:'Réponse instantanée de l\'agent' },
                    { label:'CA pipeline actif', value: eur(activeLeads.filter(l=>['devis_envoye','relance','gagne'].includes(statutOf(l))).reduce((a,l)=>a+getPrice(l),0))+' €', delta:'', up:true, note:'Devis en cours + gagnés', hl:true },
                  ].map((k, i) => (
                    <div
                      key={k.label}
                      className="nt-hover-lift"
                      style={{
                        background:k.hl?'#eef6d4':'#fff',
                        border:`1px solid ${k.hl?'#c2e84a':'rgba(46,58,31,0.1)'}`,
                        borderRadius:16,
                        padding:18,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        animationDelay: `${i * 0.06}s`,
                      }}
                    >
                      <div style={{ fontSize:12.5, fontWeight:600, color:'#565a4d', marginBottom:10 }}>{k.label}</div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:9 }}>
                        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:30, letterSpacing:'-0.02em', color:'#15180e', lineHeight:1 }}>{k.value}</div>
                        {k.delta && <span style={{ fontSize:12, fontWeight:700, padding:'2px 7px', borderRadius:6, color:k.up?'#2f7d4a':'#a13812', background:k.up?'#e6f3e9':'#fbeae3' }}>{k.delta}</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#565a4d', marginTop:9, lineHeight:1.35 }}>{k.note}</div>
                    </div>
                  ))}
                </div>

              {/* Charts row */}
              <div style={{ display:'grid', gridTemplateColumns:'1.55fr 1fr', gap:16, marginBottom:16 }}>
                {/* Bar chart */}
                <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:16, padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, color:'#15180e' }}>Leads captés — 7 derniers jours</div>
                    <div style={{ fontSize:12.5, color:'#8a8f7d' }}>moyenne 54 / jour</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:14, height:172, paddingTop:6 }}>
                    {[['Lun',54],['Mar',61],['Mer',58],['Jeu',63],['Ven',60],['Sam',42],['Dim',38]].map(([d,v],i) => (
                      <div key={d} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, height:'100%', justifyContent:'flex-end' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#3a4030' }}>{v}</div>
                        <div
                          className="nt-bar-grow"
                          style={{
                            width:'100%',
                            maxWidth:38,
                            borderRadius:'7px 7px 0 0',
                            background:i===4?'#c2e84a':'#2e3a1f',
                            height:`${Math.round(Number(v)/63*100)}%`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                        <div style={{ fontSize:11.5, color:'#9aa090', fontWeight:600 }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Funnel */}
                <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:16, padding:'20px 22px' }}>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, color:'#15180e', marginBottom:18 }}>Entonnoir de conversion</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                    {[['Leads captés',60,'#2e3a1f'],['Qualifiés',57,'#4a5a30'],['Devis générés',41,'#7a9142'],['Acceptés',14,'#c2e84a']].map(([l,v,c]) => (
                      <div key={String(l)}>
                        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:'#3a4030' }}>{l}</span>
                          <span style={{ fontSize:13, color:'#565a4d' }}><b style={{ color:'#15180e' }}>{v}</b> · {Math.round(Number(v)/60*100)}%</span>
                        </div>
                        <div style={{ height:13, borderRadius:7, background:'#eef0e6', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.round(Number(v)/60*100)}%`, background:String(c), borderRadius:7 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before/after */}
              <div style={{ background:'linear-gradient(150deg,#2e3a1f,#222a15)', border:'1px solid #2f3a1d', borderRadius:16, padding:'20px 22px', color:'#f3f2ec' }}>
                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, marginBottom:5 }}>Avant / après automatisation</div>
                <div style={{ fontSize:12.5, color:'#b2bca0', marginBottom:18 }}>Impact estimé sur le flux de 60 leads/jour.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {[['Leads traités','62 %','95 %'],['Délai 1er contact','9 h','2 min'],['Taux de transfo.','16 %','24 %'],['Leads Ads ignorés','38 %','4 %']].map(([l,b,a]) => (
                    <div key={String(l)} style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1, fontSize:13, color:'#dce2cc' }}>{l}</div>
                      <div style={{ fontSize:13, color:'#aab495', textDecoration:'line-through', whiteSpace:'nowrap' }}>{b}</div>
                      <div style={{ fontSize:13, color:'#aab495' }}>→</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#c2e84a', whiteSpace:'nowrap', minWidth:54, textAlign:'right' }}>{a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ PIPELINE ══ */}
          {!loading && view==='pipeline' && (
            <div style={{ padding:'20px 26px 40px' }}>
              <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:10, alignItems:'flex-start' }}>
                {columnOrder.map(key => {
                  const meta = STATUS_META[key]
                  const ls = activeLeads.filter(l => statutOf(l)===key)
                  const sum = ls.filter(hasDevis).reduce((a,l)=>a+getPrice(l),0)
                  return (
                    <div key={key} style={{ flexShrink:0, width:248, background:'#e7e9de', borderRadius:14, padding:11 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px 11px' }}>
                        <span style={{ width:9, height:9, borderRadius:'50%', background:meta.dot }} />
                        <span style={{ fontWeight:700, fontSize:13.5, color:'#2b3120' }}>{meta.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:'#3a4030', background:'#fff', borderRadius:999, padding:'1px 8px' }}>{ls.length}</span>
                        <span style={{ flex:1 }} />
                        <span style={{ fontSize:11.5, color:'#565a4d' }}>{sum?eur(sum)+' €':'—'}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                        {ls.map(l => (
                          <button
                            key={l.ref}
                            onClick={()=>setDrawerId(l.ref)}
                            className="nt-hover-lift"
                            style={{
                              textAlign:'left',
                              fontFamily:'inherit',
                              cursor:'pointer',
                              background:'#fff',
                              border:'1px solid rgba(46,58,31,0.1)',
                              borderRadius:11,
                              padding:12,
                              display:'flex',
                              flexDirection:'column',
                              gap:8,
                              boxShadow:'0 1px 2px rgba(46,58,31,0.05)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                          >
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                              <span style={{ fontSize:13.5, fontWeight:700, color:'#15180e', lineHeight:1.2 }}>{l.client}</span>
                              {l.urgent && <span style={{ fontSize:10, fontWeight:700, color:'#a9762a', background:'#fdf1e1', border:'1px solid #f0d6a4', padding:'1px 6px', borderRadius:5, whiteSpace:'nowrap' }}>⚡ Urgent</span>}
                            </div>
                            <div style={{ fontSize:12.5 }}>{renderTrajet(l.from, l.to)}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                              <span style={{ fontSize:11, fontWeight:600, color:'#5b6a3f', background:'#eef1e6', padding:'2px 7px', borderRadius:6 }}>{l.type}</span>
                              <span style={{ fontSize:11, color:'#565a4d' }}>{l.pax} pax · {l.dateDepart}</span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, borderTop:'1px solid #eef0e6', paddingTop:8 }}>
                              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#565a4d' }}>
                                <span style={{ width:7, height:7, borderRadius:'50%', background:SOURCE_COLOR[l.source]??'#aaa' }} />{l.source}
                              </span>
                              <span style={{ fontSize:13, fontWeight:700, color:'#15180e' }}>{hasDevis(l)?eur(getPrice(l))+' €':'—'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ LEADS ══ */}
          {!loading && view==='leads' && (
            <div style={{ padding:'20px 26px 40px' }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                {([['tous','Tous'],['non_traites','Non traités'],['urgents','Urgents'],['complexes','Complexes'],['gagnes','Gagnés']] as [Filter,string][]).map(([f,lbl]) => {
                  const cnt = activeLeads.filter(l=>{ const st=statutOf(l); if(f==='non_traites') return st==='nouveau'||st==='qualifie'; if(f==='urgents') return l.urgent&&!['gagne','perdu'].includes(st); if(f==='complexes') return l.complexite==='complexe'; if(f==='gagnes') return st==='gagne'; return true }).length
                  return (
                    <button key={f} onClick={()=>setFilter(f)} style={{ fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', borderRadius:9, padding:'8px 13px', border:`1px solid ${filter===f?'#2e3a1f':'rgba(46,58,31,0.16)'}`, background:filter===f?'#2e3a1f':'#fff', color:filter===f?'#f3f2ec':'#3a4030' }}>
                      {lbl} <span style={{ opacity:.65, marginLeft:6 }}>{cnt}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:14, overflowX:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'84px 1.6fr 1.5fr 56px 70px 1fr 100px 118px 96px', gap:12, padding:'12px 18px', minWidth:940, background:'#f5f6f0', borderBottom:'1px solid rgba(46,58,31,0.1)', fontSize:11.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'#565a4d' }}>
                  <div>Réf</div><div>Client</div><div>Trajet</div><div>Pax</div><div>Départ</div><div>Source</div><div>Complexité</div><div>Statut</div><div style={{ textAlign:'right' }}>Devis</div>
                </div>
                {filtered.map(l => {
                  const sm = STATUS_META[statutOf(l)]; const cm = COMPLEXITE_META[l.complexite]
                  return (
                    <button key={l.ref} onClick={()=>setDrawerId(l.ref)} style={{ width:'100%', textAlign:'left', fontFamily:'inherit', cursor:'pointer', background:'#fff', border:'none', borderBottom:'1px solid #f0f1ea', display:'grid', gridTemplateColumns:'84px 1.6fr 1.5fr 56px 70px 1fr 100px 118px 96px', gap:12, padding:'13px 18px', alignItems:'center', minWidth:940 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#9aa090' }}>{l.ref}</div>
                      <div><div style={{ fontSize:13.5, fontWeight:700, color:'#15180e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.client}</div><div style={{ fontSize:11.5, color:'#565a4d' }}>{l.type}</div></div>
                      <div style={{ fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{renderTrajet(l.from, l.to)}</div>
                      <div style={{ fontSize:13, color:'#3a4030' }}>{l.pax}</div>
                      <div style={{ fontSize:13, color:'#3a4030' }}>{l.dateDepart}</div>
                      <div style={{ fontSize:12.5, color:'#3a4030', display:'flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:'50%', background:SOURCE_COLOR[l.source]??'#aaa', flexShrink:0 }} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.source}</span></div>
                      <div><span style={{ fontSize:12, fontWeight:600, color:cm.fg, background:cm.bg, padding:'2px 8px', borderRadius:6 }}>{cm.label}</span></div>
                      <div><span style={{ fontSize:12, fontWeight:600, color:sm.fg, background:sm.bg, padding:'2px 8px', borderRadius:6, display:'flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:'50%', background:sm.dot }} />{sm.label}</span></div>
                      <div style={{ textAlign:'right', fontSize:13, fontWeight:700, color:'#15180e' }}>{hasDevis(l)?eur(getPrice(l))+' €':'—'}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ RELANCES ══ */}
          {!loading && view==='relances' && (
            <div style={{ padding:'20px 26px 40px' }}>
              <div style={{ background:'#e6f3e9', border:'1px solid #c5e3cd', borderRadius:12, padding:'13px 16px', marginBottom:18, fontSize:13.5, color:'#2f5d3f', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16 }}>✉</span> Les séquences sont déclenchées automatiquement par l&apos;agent. Les textes sont personnalisés par l&apos;IA, l&apos;envoi par le code — à J+1, J+3 puis J+7.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                {activeLeads.filter(l=>['relance','devis_envoye'].includes(statutOf(l))).map(l => {
                  const sm = STATUS_META[statutOf(l)]
                  const step = l.relanceStep ?? 0
                  const stepDefs = [
                    { title:'Envoi devis', when:'J+0', preview:'Bonjour, veuillez trouver ci-joint votre devis NeoTravel…', done:true },
                    { title:'Relance J+3', when:'J+3', preview:'Je souhaitais m\'assurer que vous avez bien reçu le devis…', done:step>=1 },
                    { title:'Relance J+7', when:'J+7', preview:'Avez-vous pu prendre connaissance de notre proposition ?…', done:step>=2 },
                  ]
                  return (
                    <div key={l.ref} style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:14, padding:'16px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, flexWrap:'wrap' }}>
                        <button onClick={()=>setDrawerId(l.ref)} style={{ fontFamily:'inherit', cursor:'pointer', background:'transparent', border:'none', textAlign:'left', padding:0 }}>
                          <span style={{ fontSize:14.5, fontWeight:700, color:'#15180e' }}>{l.client}</span>
                        </button>
                        <span style={{ fontSize:12, fontWeight:600, color:sm.fg, background:sm.bg, padding:'2px 8px', borderRadius:6 }}>{sm.label}</span>
                        <span style={{ fontSize:12.5, color:'#565a4d', display: 'inline-flex', alignItems: 'center', gap: 8 }}>{renderTrajet(l.from, l.to)} · {eur(getPrice(l))} €</span>
                        <span style={{ flex:1 }} />
                        <span style={{ fontSize:12, color:'#565a4d' }}>Devis envoyé {l.lastAgo}</span>
                      </div>
                      <div style={{ display:'flex', gap:0, alignItems:'stretch' }}>
                        {stepDefs.map((st, i) => (
                          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                              <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background:st.done?'#2e3a1f':'#eef0e6', color:st.done?'#f3f2ec':'#9aa090', border:`1.5px solid ${st.done?'#2e3a1f':'#dfe0d6'}` }}>
                                {st.done?'✓':`${i+1}`}
                              </span>
                              {i<2 && <span style={{ flex:1, height:2, background:st.done&&step>i?'#2e3a1f':'#dfe0d6' }} />}
                            </div>
                            <div style={{ paddingRight:14 }}>
                              <div style={{ fontSize:12.5, fontWeight:700, color:'#3a4030' }}>{st.title}</div>
                              <div style={{ fontSize:12, color:'#565a4d', margin:'2px 0 6px' }}>{st.when}</div>
                              <div style={{ fontSize:12, color:'#5b5f52', lineHeight:1.4, background:'#f7f6f0', border:'1px solid #eceadf', borderRadius:8, padding:'8px 10px' }}>{st.preview}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ══ DRAWER ══ */}
      {drawerLead && (
        <div onClick={()=>setDrawerId(null)} style={{ position:'fixed', inset:0, zIndex:80, background:'rgba(21,24,14,0.42)', display:'flex', justifyContent:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:440, maxWidth:'94vw', height:'100%', background:'#f5f4ee', boxShadow:'-12px 0 40px -16px rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', animation:'ntDrawer 0.26s cubic-bezier(0.2,0.8,0.2,1)', overflow:'hidden' }}>
            {/* Drawer header */}
            <div style={{ flexShrink:0, background:'#2e3a1f', color:'#f3f2ec', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
                    <span style={{ fontSize:11.5, fontWeight:600, color:'#c2cbb4', background:'rgba(243,242,236,0.12)', padding:'2px 8px', borderRadius:6 }}>{drawerLead.ref}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:STATUS_META[statutOf(drawerLead)].fg, background:STATUS_META[statutOf(drawerLead)].bg, padding:'2px 8px', borderRadius:6 }}>{STATUS_META[statutOf(drawerLead)].label}</span>
                  </div>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, letterSpacing:'-0.02em', lineHeight:1.15 }}>{drawerLead.client}</div>
                  <div style={{ fontSize:13, color:'#c2cbb4', marginTop:3 }}>{drawerLead.type} · {drawerLead.contact}</div>
                </div>
                <button onClick={()=>setDrawerId(null)} style={{ flexShrink:0, width:32, height:32, borderRadius:9, border:'1px solid rgba(243,242,236,0.25)', background:'transparent', color:'#f3f2ec', fontSize:16, cursor:'pointer' }}>✕</button>
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ flex:1, overflowY:'auto', padding:'18px 20px 28px', display:'flex', flexDirection:'column', gap:18 }}>
              {drawerLead.complexite==='complexe' && (
                <div style={{ background:'#fdf1e1', border:'1px solid #f0d6a4', borderRadius:12, padding:'13px 15px' }}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'#a9762a', marginBottom:4 }}>🤝 Cas complexe — relais humain</div>
                  <div style={{ fontSize:13, lineHeight:1.5, color:'#6b4e1f' }}>Demande nécessitant un traitement manuel par un conseiller NeoTravel.</div>
                </div>
              )}
              {/* Qualification */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#3a4030', marginBottom:10 }}>Qualification automatique</div>
                <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:12, padding:'4px 16px' }}>
                  {[
                    ['Trajet', renderTrajet(drawerLead.from, drawerLead.to)],
                    ['Direction', drawerLead.ar ? 'Aller-retour 🔄' : 'Aller simple ➡️'],
                    ['Passagers', `${drawerLead.pax} personnes`],
                    ['Date départ', drawerLead.dateDepart],
                    ['Source', drawerLead.source],
                    ['Urgence', drawerLead.urgent?'⚡ Oui':'Non'],
                    ['Options', drawerLead.options.join(', ')||'—'],
                  ].map(([k,v]) => (
                    <div key={String(k)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'9px 0', borderBottom:'1px solid #f0f1ea' }}>
                      <span style={{ fontSize:13, color:'#565a4d' }}>{k}</span>
                      <span style={{ fontSize:13.5, fontWeight:600, color:'#15180e', textAlign:'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devis */}
              {hasDevis(drawerLead) && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#3a4030' }}>Devis</span>
                    <span style={{ fontSize:11, fontWeight:600, color:'#2f7d4a', background:'#e6f3e9', border:'1px solid #c5e3cd', padding:'2px 8px', borderRadius:6 }}>déterministe</span>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:11, paddingTop:11, borderTop:'2px solid #2e3a1f' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#15180e' }}>Total TTC</span>
                      <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#15180e' }}>{eur(getPrice(drawerLead))} €</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#3a4030', marginBottom:10 }}>Conversation (résumé IA)</div>
                <div style={{ background:'#fff', border:'1px solid rgba(46,58,31,0.1)', borderRadius:12, padding:'14px 16px', fontSize:13, lineHeight:1.55, color:'#3a4030', fontStyle:'italic' }}>
                  &ldquo;{drawerLead.summary}&rdquo;
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div style={{ flexShrink:0, borderTop:'1px solid rgba(46,58,31,0.12)', background:'#fff', padding:'13px 18px', display:'flex', gap:9 }}>
              <button onClick={() => handleUpdateStatus(drawerLead, 'relance', 'Relance envoyée à ' + drawerLead.client)} style={{ flex:1, fontFamily:'inherit', fontSize:13.5, fontWeight:700, color:'#1f2613', background:'#c2e84a', border:'none', padding:11, borderRadius:10, cursor:'pointer' }}>
                Relancer maintenant
              </button>
              <button onClick={() => handleUpdateStatus(drawerLead, 'Cas complexe', drawerLead.client + ' escaladé vers un commercial')} style={{ fontFamily:'inherit', fontSize:13.5, fontWeight:600, color:'#2e3a1f', background:'#f1f0e7', border:'1px solid rgba(46,58,31,0.16)', padding:'11px 14px', borderRadius:10, cursor:'pointer' }}>
                Escalader 🤝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', zIndex:120, background:'#2e3a1f', color:'#f3f2ec', fontSize:13.5, fontWeight:600, padding:'12px 20px', borderRadius:11, boxShadow:'0 16px 36px -12px rgba(0,0,0,0.5)', animation:'ntToast 0.24s ease', display:'flex', alignItems:'center', gap:9, transform:'translateX(-50%)' }}>
          <span style={{ color:'#c2e84a' }}>✓</span>{toast}
        </div>
      )}
    </div>
  )
}
