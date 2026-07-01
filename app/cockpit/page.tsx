'use client'

// ─────────────────────────────────────────────
// NeoTravel — Internal Cockpit
// /cockpit — CRM dashboard for the commercial team.
// Views: Overview, Pipeline (Kanban), Leads table, Relances.
// Data is mock (same as prototype). Airtable live
// connection is a separate step.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Logo from '@/components/Logo'

// ── SVG Icons (Lucide-style Outline) ───────────
interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

const IconDashboard = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="10" rx="1" />
    <rect width="7" height="5" x="3" y="15" rx="1" />
  </svg>
)

const IconColumns = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M12 3v18" />
  </svg>
)

const IconUsers = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconMail = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const IconExternalLink = ({ size = 12, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const IconSearch = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const IconZap = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconHandshake = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m11 17 2 2c.4.4 1 .4 1.4 0l4-4c.4-.4.4-1 0-1.4l-4-4c-.4-.4-1-.4-1.4 0l-2 2" />
    <path d="m13 11-2-2c-.4-.4-1-.4-1.4 0l-4 4c-.4.4-.4 1 0 1.4l4 4c.4.4 1 .4 1.4 0l2-2" />
  </svg>
)

const IconCheck = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconX = ({ size = 16, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconRefreshCw = ({ size = 14, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
)

const IconArrowRight = ({ size = 14, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const IconBus = ({ size = 24, className = '', style }: IconProps) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <rect width="16" height="16" x="4" y="2" rx="2" />
    <path d="M4 14h16" />
    <path d="M12 2v12" />
    <circle cx="8" cy="18" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
)

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
  nouveau:     { label:'Nouveau',       dot:'#74874c', bg:'#f1f3eb', fg:'#4d5835' },
  qualifie:    { label:'Qualifié',      dot:'#48688c', bg:'#edf2f8', fg:'#2e4a6a' },
  devis_envoye:{ label:'Devis envoyé', dot:'#6f5b9c', bg:'#f3f0f9', fg:'#4d3f6d' },
  relance:     { label:'En relance',    dot:'#c88b2a', bg:'#fef5e9', fg:'#8c5c16' },
  gagne:       { label:'Gagné',         dot:'#2f7d4a', bg:'#ebf6ed', fg:'#225833' },
  perdu:       { label:'Perdu',         dot:'#918680', bg:'#f4f2f0', fg:'#5a5450' },
}
const COMPLEXITE_META: Record<Complexite,{label:string;bg:string;fg:string}> = {
  simple:   { label:'Simple',   bg:'#f1f3eb', fg:'#4d5835' },
  standard: { label:'Standard', bg:'#edf2f8', fg:'#2e4a6a' },
  complexe: { label:'Complexe', bg:'#fdf5eb', fg:'#94521b' },
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
      <span style={{ fontWeight: 700, color: 'var(--olive)', textTransform: 'uppercase', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        {cap(from)}
      </span>
      <span style={{ color: 'var(--nt-text-discretion)', fontWeight: 500 }}>→</span>
      <span style={{ fontWeight: 700, color: 'var(--olive)', textTransform: 'uppercase', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [commercialName, setCommercialName] = useState('Commercial')

  useEffect(() => {
    // Initialize mock commercial accounts in localStorage
    const existing = localStorage.getItem('neo_commercial_users')
    if (!existing) {
      const defaultCommercials = [
        { email: 'commercial@neotravel.fr', password: 'neo2026', name: 'Claire Bonnet' },
        { email: 'admin@neotravel.com', password: 'admin', name: 'Admin Cockpit' }
      ]
      localStorage.setItem('neo_commercial_users', JSON.stringify(defaultCommercials))
    }

    const logged = localStorage.getItem('neo_cockpit_logged_in')
    const activeName = localStorage.getItem('neo_cockpit_user_name')
    if (logged === 'true') {
      setIsLoggedIn(true)
      if (activeName) {
        setCommercialName(activeName)
      }
    }
    setCheckingAuth(false)
  }, [])

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')

    const usersStr = localStorage.getItem('neo_commercial_users') || '[]'
    let users = []
    try {
      users = JSON.parse(usersStr)
    } catch {
      users = []
    }

    if (authMode === 'login') {
      const found = users.find(
        (u: any) => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput
      )
      if (found) {
        setLoginSuccess('Connexion réussie !')
        localStorage.setItem('neo_cockpit_logged_in', 'true')
        localStorage.setItem('neo_cockpit_user_name', found.name)
        setCommercialName(found.name)
        setTimeout(() => {
          setIsLoggedIn(true)
          setLoginSuccess('')
        }, 800)
      } else {
        setLoginError('Email ou mot de passe incorrect. (Défaut : commercial@neotravel.fr / neo2026)')
      }
    } else {
      // Inscription
      if (!nameInput) {
        setLoginError('Veuillez renseigner votre nom.')
        return
      }
      const exists = users.some((u: any) => u.email.toLowerCase() === emailInput.toLowerCase())
      if (exists) {
        setLoginError('Cet email est déjà enregistré.')
        return
      }

      const newUser = {
        email: emailInput.toLowerCase(),
        password: passwordInput,
        name: nameInput
      }
      users.push(newUser)
      localStorage.setItem('neo_commercial_users', JSON.stringify(users))
      setLoginSuccess('Inscription réussie !')
      localStorage.setItem('neo_cockpit_logged_in', 'true')
      localStorage.setItem('neo_cockpit_user_name', newUser.name)
      setCommercialName(newUser.name)
      setTimeout(() => {
        setIsLoggedIn(true)
        setLoginSuccess('')
      }, 800)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('neo_cockpit_logged_in')
    localStorage.removeItem('neo_cockpit_user_name')
    setIsLoggedIn(false)
  }

  const initials = commercialName
    ? commercialName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'CO'

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

  const navItems: { v: View; icon: React.ReactNode; label: string; badge?: string }[] = [
    { v:'overview', icon:<IconDashboard size={18} />, label:'Vue d\'ensemble' },
    { v:'pipeline', icon:<IconColumns size={18} />, label:'Pipeline' },
    { v:'leads', icon:<IconUsers size={18} />, label:'Leads', badge: activeLeads.length.toString() },
    { v:'relances', icon:<IconMail size={18} />, label:'Relances' },
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
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 34, background: '#1b2110', padding: 12, borderRadius: 16, display: 'inline-block', marginBottom: 14 }}>🚌</span>
            <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 24, color: '#1b2110', margin: 0 }}>NeoTravel CRM</h2>
            <p style={{ fontSize: 13, color: '#6b7059', margin: '4px 0 0' }}>
              {authMode === 'login' ? 'Espace sécurisé pour les commerciaux' : 'Créer un compte commercial'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(46,58,31,0.1)', marginBottom: 20 }}>
            <button
              onClick={() => { setAuthMode('login'); setLoginError(''); setLoginSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: authMode === 'login' ? '2px solid #2e3a1f' : 'none',
                fontWeight: authMode === 'login' ? 700 : 500,
                color: authMode === 'login' ? '#2e3a1f' : '#6b7059',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14
              }}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setLoginError(''); setLoginSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: authMode === 'signup' ? '2px solid #2e3a1f' : 'none',
                fontWeight: authMode === 'signup' ? 700 : 500,
                color: authMode === 'signup' ? '#2e3a1f' : '#6b7059',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14
              }}
            >
              S&apos;inscrire
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e3a1f', marginBottom: 6, textTransform: 'uppercase' }}>Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={nameInput} 
                  onChange={e => setNameInput(e.target.value)} 
                  placeholder="Ex. Claire Bonnet" 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #c8cbd0', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
                />
              </div>
            )}

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

            {loginSuccess && (
              <div style={{ fontSize: 13, color: '#2f7d4a', background: '#e6f3e9', border: '1px solid #c5e3cd', padding: '9px 12px', borderRadius: 8, fontWeight: 500 }}>
                ✓ {loginSuccess}
              </div>
            )}

            <button 
              type="submit" 
              style={{
                fontFamily: 'inherit',
                fontSize: 14.5,
                fontWeight: 700,
                color: '#ffffff',
                background: '#8ea31e',
                border: 'none',
                padding: 12,
                borderRadius: 10,
                cursor: 'pointer',
                marginTop: 6,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#81941b'}
              onMouseLeave={e => e.currentTarget.style.background = '#8ea31e'}
            >
              {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Hanken Grotesk',system-ui,sans-serif", color:'var(--nt-text-primary)', background:'var(--nt-bg-app)', WebkitFontSmoothing:'antialiased' }}>

      {/* ── Sidebar ── */}
      <aside style={{ flexShrink:0, width:236, background:'var(--olive-dark)', color:'var(--nt-text-on-olive)', display:'flex', flexDirection:'column', padding:'18px 14px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4, padding:'6px 8px 20px', borderBottom:'1px solid rgba(243,242,236,0.08)', marginBottom:12 }}>
          <Logo theme="dark" height={36} />
          <div style={{ fontSize:11, color:'rgba(243,242,236,0.65)', marginTop:2, display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
            <span>Cockpit commercial</span>
            <a 
              href="/" 
              style={{ 
                color: 'var(--lime)', 
                textDecoration: 'none', 
                fontWeight: 700, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 4,
                fontSize: 10.5
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Site client <IconExternalLink size={10} />
            </a>
          </div>
        </div>

        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#b2bca0', padding:'8px 10px 6px' }}>Pilotage</div>
        {navItems.map(n => (
          <button
            key={n.v}
            onClick={() => setView(n.v)}
            aria-current={view===n.v ? 'page' : undefined}
            style={{
              display:'flex', alignItems:'center', gap:11, width:'100%',
              fontFamily:'inherit', fontSize:13.5, fontWeight:600,
              cursor:'pointer', border:'none', borderRadius:10, padding:'10px 11px', marginBottom:3,
              transition: 'all 0.2s ease',
              ...(view===n.v 
                ? { background:'var(--olive)', color:'var(--nt-text-on-olive)', borderLeft:'3px solid var(--lime)', borderTopLeftRadius:0, borderBottomLeftRadius:0 } 
                : { background:'transparent', color:'#b2bca0' }
              ),
            }}
          >
            <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, flexShrink:0 }} aria-hidden="true">{n.icon}</span>
            <span style={{ flex:1, textAlign:'left' }}>{n.label}</span>
            {n.badge && <span style={{ fontSize:11, fontWeight:700, background:'rgba(243,242,236,0.2)', color:'#ffffff', padding:'1px 7px', borderRadius:999 }}>{n.badge}</span>}
          </button>
        ))}

        <div style={{ flex:1 }} />
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 8px', borderTop:'1px solid rgba(243,242,236,0.1)', paddingTop:15 }}>
          <span style={{ width:30, height:30, borderRadius:'50%', background:'var(--olive)', display:'flex', alignItems:'center', justifyContent: 'center', fontSize:13, fontWeight:700, color:'var(--lime)', flexShrink:0 }}>{initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#e7ebda', lineHeight:1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{commercialName}</div>
            <button 
              onClick={handleLogout}
              style={{ background:'transparent', border:'none', color:'#b2bca0', fontSize:11, padding:0, cursor:'pointer', fontWeight:600, textDecoration:'underline', display:'block', marginTop:2 }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--nt-bg-app)' }}>

        {/* Header */}
        <header style={{ flexShrink:0, display:'flex', alignItems:'center', gap:16, padding:'16px 26px', background:'var(--nt-bg-card)', borderBottom:'1px solid var(--nt-border-card)' }}>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:21, letterSpacing:'-0.02em', color:'var(--nt-text-primary)', lineHeight:1.1 }}>{viewTitle}</div>
            <div style={{ fontSize:13, color:'var(--nt-text-secondary)', marginTop:1 }}>{viewSubtitle}</div>
          </div>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:10, padding:'8px 12px', width:220 }}>
            <span style={{ display:'inline-flex', alignItems:'center', color:'var(--nt-text-discretion)' }}><IconSearch size={14} /></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un lead…" style={{ flex:1, border:'none', outline:'none', fontFamily:'inherit', fontSize:13.5, background:'transparent', color:'var(--nt-text-primary)', minWidth:0 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:600, color:'var(--nt-text-secondary)', background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', padding:'8px 12px', borderRadius:10 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#3f9d5a', display:'inline-block' }} />Agent IA actif
          </div>
        </header>

        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {loading && leads.length === 0 && (
            <div style={{ height:'100%', minHeight:'300px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--olive)', gap:12, padding:40 }}>
              <span style={{ display:'inline-flex', animation:'ntPulse 1.5s infinite' }} aria-hidden="true"><IconBus size={36} /></span>
              <div style={{ fontSize:14.5, fontWeight:600, color:'var(--olive)' }}>Chargement des données Airtable...</div>
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
                        background:'var(--nt-bg-card)',
                        border:'1px solid var(--nt-border-card)',
                        borderRadius:16,
                        padding:18,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        animationDelay: `${i * 0.06}s`,
                      }}
                    >
                      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--nt-text-discretion)', marginBottom:10 }}>{k.label}</div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:9 }}>
                        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:30, letterSpacing:'-0.02em', color:'var(--nt-text-primary)', lineHeight:1 }}>{k.value}</div>
                        {k.delta && <span style={{ fontSize:12, fontWeight:700, padding:'2px 7px', borderRadius:6, color:k.up?'#2f7d4a':'#a13812', background:k.up?'#e6f3e9':'#fbeae3' }}>{k.delta}</span>}
                      </div>
                      <div style={{ fontSize:12, color:'var(--nt-text-secondary)', marginTop:9, lineHeight:1.35 }}>{k.note}</div>
                    </div>
                  ))}
                </div>

              {/* Charts row */}
              <div style={{ display:'grid', gridTemplateColumns:'1.55fr 1fr', gap:16, marginBottom:16 }}>
                {/* Bar chart */}
                <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:16, padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, color:'var(--nt-text-primary)' }}>Leads captés — 7 derniers jours</div>
                    <div style={{ fontSize:12.5, color:'var(--nt-text-discretion)' }}>moyenne 54 / jour</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:14, height:172, paddingTop:6 }}>
                    {[['Lun',54],['Mar',61],['Mer',58],['Jeu',63],['Ven',60],['Sam',42],['Dim',38]].map(([d,v],i) => (
                      <div key={d} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, height:'100%', justifyContent:'flex-end' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--nt-text-secondary)' }}>{v}</div>
                        <div
                          className="nt-bar-grow"
                          style={{
                            width:'100%',
                            maxWidth:38,
                            borderRadius:'7px 7px 0 0',
                            background:i===4?'var(--lime)':'var(--olive)',
                            height:`${Math.round(Number(v)/63*100)}%`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                        <div style={{ fontSize:11.5, color:'var(--nt-text-discretion)', fontWeight:600 }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Funnel */}
                <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:16, padding:'20px 22px' }}>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, color:'var(--nt-text-primary)', marginBottom:18 }}>Entonnoir de conversion</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                    {[['Leads captés',60,'var(--olive)'],['Qualifiés',57,'#4a5a30'],['Devis générés',41,'#7a9142'],['Acceptés',14,'var(--lime)']].map(([l,v,c]) => (
                      <div key={String(l)}>
                        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:'var(--nt-text-secondary)' }}>{l}</span>
                          <span style={{ fontSize:13, color:'var(--nt-text-discretion)' }}><b style={{ color:'var(--nt-text-primary)' }}>{v}</b> · {Math.round(Number(v)/60*100)}%</span>
                        </div>
                        <div style={{ height:13, borderRadius:7, background:'var(--nt-row-border)', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.round(Number(v)/60*100)}%`, background:String(c), borderRadius:7 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before/after */}
              <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:16, padding:'20px 22px', color:'var(--nt-text-primary)' }}>
                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:600, fontSize:16, marginBottom:5, color:'var(--nt-text-primary)' }}>Avant / après automatisation</div>
                <div style={{ fontSize:12.5, color:'var(--nt-text-discretion)', marginBottom:18 }}>Impact estimé sur le flux de 60 leads/jour.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {[['Leads traités','62 %','95 %'],['Délai 1er contact','9 h','2 min'],['Taux de transfo.','16 %','24 %'],['Leads Ads ignorés','38 %','4 %']].map(([l,b,a]) => (
                    <div key={String(l)} style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1, fontSize:13, color:'var(--nt-text-secondary)' }}>{l}</div>
                      <div style={{ fontSize:13, color:'var(--nt-text-discretion)', textDecoration:'line-through', whiteSpace:'nowrap' }}>{b}</div>
                      <div style={{ fontSize:13, color:'var(--nt-text-discretion)' }}>→</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--nt-text-primary)', whiteSpace:'nowrap', minWidth:54, textAlign:'right' }}>{a}</div>
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
                    <div key={key} style={{ flexShrink:0, width:248, background:'var(--nt-row-border)', borderRadius:14, padding:11 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px 11px' }}>
                        <span style={{ width:9, height:9, borderRadius:'50%', background:meta.dot }} />
                        <span style={{ fontWeight:700, fontSize:13.5, color:'var(--nt-text-primary)' }}>{meta.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--nt-text-secondary)', background:'var(--nt-bg-card)', borderRadius:999, padding:'1px 8px' }}>{ls.length}</span>
                        <span style={{ flex:1 }} />
                        <span style={{ fontSize:11.5, color:'var(--nt-text-discretion)' }}>{sum?eur(sum)+' €':'—'}</span>
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
                              background:'var(--nt-bg-card)',
                              border:'1px solid var(--nt-border-card)',
                              borderRadius:11,
                              padding:12,
                              display:'flex',
                              flexDirection:'column',
                              gap:8,
                              boxShadow:'0 1px 2px rgba(46,58,31,0.02)',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                          >
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                              <span style={{ fontSize:13.5, fontWeight:700, color:'var(--nt-text-primary)', lineHeight:1.2 }}>{l.client}</span>
                              {l.urgent && <span style={{ display:'inline-flex', alignItems:'center', gap:3.5, fontSize:10, fontWeight:700, color:'var(--nt-urgent-text)', background:'var(--nt-urgent-bg)', border:'1px solid var(--nt-urgent-border)', padding:'1.5px 6px', borderRadius:5, whiteSpace:'nowrap' }}><IconZap size={10} />Urgent</span>}
                            </div>
                            <div style={{ fontSize:12.5, color:'var(--nt-text-secondary)' }}>{renderTrajet(l.from, l.to)}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                              <span style={{ fontSize:11, fontWeight:600, color:'var(--nt-text-secondary)', background:'var(--nt-bg-app)', padding:'2px 7px', borderRadius:6 }}>{l.type}</span>
                              <span style={{ fontSize:11, color:'var(--nt-text-discretion)' }}>{l.pax} pax · {l.dateDepart}</span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, borderTop:'1px solid var(--nt-row-border)', paddingTop:8 }}>
                              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--nt-text-discretion)' }}>
                                <span style={{ width:7, height:7, borderRadius:'50%', background:SOURCE_COLOR[l.source]??'#aaa' }} />{l.source}
                              </span>
                              <span style={{ fontSize:13, fontWeight:700, color:'var(--nt-text-primary)' }}>{hasDevis(l)?eur(getPrice(l))+' €':'—'}</span>
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
                    <button key={f} onClick={()=>setFilter(f)} style={{ fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', borderRadius:9, padding:'8px 13px', border:`1px solid ${filter===f?'var(--olive)':'var(--nt-border-card)'}`, background:filter===f?'var(--olive)':'var(--nt-bg-card)', color:filter===f?'var(--nt-text-on-olive)':'var(--nt-text-secondary)', transition:'all 0.2s ease' }}>
                      {lbl} <span style={{ opacity:.65, marginLeft:6 }}>{cnt}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:14, overflowX:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'84px 1.6fr 1.5fr 56px 70px 1fr 100px 118px 96px', gap:12, padding:'12px 18px', minWidth:940, background:'var(--nt-thead-bg)', borderBottom:'1px solid var(--nt-border-card)', fontSize:11.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--nt-text-discretion)' }}>
                  <div>Réf</div><div>Client</div><div>Trajet</div><div>Pax</div><div>Départ</div><div>Source</div><div>Complexité</div><div>Statut</div><div style={{ textAlign:'right' }}>Devis</div>
                </div>
                {filtered.map(l => {
                  const sm = STATUS_META[statutOf(l)]; const cm = COMPLEXITE_META[l.complexite]
                  return (
                    <button key={l.ref} onClick={()=>setDrawerId(l.ref)} style={{ width:'100%', textAlign:'left', fontFamily:'inherit', cursor:'pointer', background:'var(--nt-bg-card)', border:'none', borderBottom:'1px solid var(--nt-row-border)', display:'grid', gridTemplateColumns:'84px 1.6fr 1.5fr 56px 70px 1fr 100px 118px 96px', gap:12, padding:'13px 18px', alignItems:'center', minWidth:940 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--nt-text-discretion)' }}>{l.ref}</div>
                      <div><div style={{ fontSize:13.5, fontWeight:700, color:'var(--nt-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.client}</div><div style={{ fontSize:11.5, color:'var(--nt-text-discretion)' }}>{l.type}</div></div>
                      <div style={{ fontSize:13, color:'var(--nt-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{renderTrajet(l.from, l.to)}</div>
                      <div style={{ fontSize:13, color:'var(--nt-text-secondary)' }}>{l.pax}</div>
                      <div style={{ fontSize:13, color:'var(--nt-text-secondary)' }}>{l.dateDepart}</div>
                      <div style={{ fontSize:12.5, color:'var(--nt-text-secondary)', display:'flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:'50%', background:SOURCE_COLOR[l.source]??'#aaa', flexShrink:0 }} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.source}</span></div>
                      <div><span style={{ fontSize:12, fontWeight:600, color:cm.fg, background:cm.bg, padding:'2px 8px', borderRadius:6 }}>{cm.label}</span></div>
                      <div><span style={{ fontSize:12, fontWeight:600, color:sm.fg, background:sm.bg, padding:'2px 8px', borderRadius:6, display:'flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:'50%', background:sm.dot }} />{sm.label}</span></div>
                      <div style={{ textAlign:'right', fontSize:13, fontWeight:700, color:'var(--nt-text-primary)' }}>{hasDevis(l)?eur(getPrice(l))+' €':'—'}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ RELANCES ══ */}
          {!loading && view==='relances' && (
            <div style={{ padding:'20px 26px 40px' }}>
              <div style={{ background:'rgba(46,58,31,0.05)', border:'1px solid var(--nt-border-card)', borderRadius:12, padding:'13px 16px', marginBottom:18, fontSize:13.5, color:'var(--nt-text-secondary)', display:'flex', alignItems:'center', gap:10 }}>
                <IconMail size={16} style={{ flexShrink:0, color:'var(--nt-text-secondary)' }} /> Les séquences sont déclenchées automatiquement par l&apos;agent. Les textes sont personnalisés par l&apos;IA, l&apos;envoi par le code — à J+1, J+3 puis J+7.
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
                    <div key={l.ref} style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:14, padding:'16px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, flexWrap:'wrap' }}>
                        <button onClick={()=>setDrawerId(l.ref)} style={{ fontFamily:'inherit', cursor:'pointer', background:'transparent', border:'none', textAlign:'left', padding:0 }}>
                          <span style={{ fontSize:14.5, fontWeight:700, color:'var(--nt-text-primary)' }}>{l.client}</span>
                        </button>
                        <span style={{ fontSize:12, fontWeight:600, color:sm.fg, background:sm.bg, padding:'2px 8px', borderRadius:6 }}>{sm.label}</span>
                        <span style={{ fontSize:12.5, color:'var(--nt-text-discretion)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>{renderTrajet(l.from, l.to)} · {eur(getPrice(l))} €</span>
                        <span style={{ flex:1 }} />
                        <span style={{ fontSize:12, color:'var(--nt-text-discretion)' }}>Devis envoyé {l.lastAgo}</span>
                      </div>
                      <div style={{ display:'flex', gap:0, alignItems:'stretch' }}>
                        {stepDefs.map((st, i) => (
                          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                              <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background:st.done?'var(--olive)':'var(--nt-bg-app)', color:st.done?'var(--nt-text-on-olive)':'var(--nt-text-discretion)', border:`1.5px solid ${st.done?'var(--olive)':'var(--nt-border-card)'}` }}>
                                {st.done ? <IconCheck size={11} style={{ strokeWidth: 3 }} /> : `${i+1}`}
                              </span>
                              {i<2 && <span style={{ flex:1, height:2, background:st.done&&step>i?'var(--olive)':'var(--nt-border-card)' }} />}
                            </div>
                            <div style={{ paddingRight:14 }}>
                              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--nt-text-secondary)' }}>{st.title}</div>
                              <div style={{ fontSize:12, color:'var(--nt-text-discretion)', margin:'2px 0 6px' }}>{st.when}</div>
                              <div style={{ fontSize:12, color:'var(--nt-text-secondary)', lineHeight:1.4, background:'var(--nt-bg-app)', border:'1px solid var(--nt-border-card)', borderRadius:8, padding:'8px 10px' }}>{st.preview}</div>
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
          <div onClick={e=>e.stopPropagation()} style={{ width:440, maxWidth:'94vw', height:'100%', background:'var(--nt-bg-app)', boxShadow:'-12px 0 40px -16px rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', animation:'ntDrawer 0.26s cubic-bezier(0.2,0.8,0.2,1)', overflow:'hidden' }}>
            {/* Drawer header */}
            <div style={{ flexShrink:0, background:'var(--olive)', color:'var(--nt-text-on-olive)', padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
                    <span style={{ fontSize:11.5, fontWeight:600, color:'var(--nt-text-on-olive)', background:'rgba(243,242,236,0.12)', padding:'2px 8px', borderRadius:6 }}>{drawerLead.ref}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:STATUS_META[statutOf(drawerLead)].fg, background:STATUS_META[statutOf(drawerLead)].bg, padding:'2px 8px', borderRadius:6 }}>{STATUS_META[statutOf(drawerLead)].label}</span>
                  </div>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, letterSpacing:'-0.02em', lineHeight:1.15 }}>{drawerLead.client}</div>
                  <div style={{ fontSize:13, color:'rgba(243,242,236,0.7)', marginTop:3 }}>{drawerLead.type} · {drawerLead.contact}</div>
                </div>
                <button onClick={()=>setDrawerId(null)} style={{ flexShrink:0, width:36, height:36, borderRadius:9, border:'1px solid rgba(243,242,236,0.25)', background:'transparent', color:'var(--nt-text-on-olive)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} aria-label="Fermer le volet"><IconX size={16} /></button>
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ flex:1, overflowY:'auto', padding:'18px 20px 28px', display:'flex', flexDirection:'column', gap:18 }}>
              {drawerLead.complexite==='complexe' && (
                <div style={{ background:'var(--nt-urgent-bg)', border:'1px solid var(--nt-urgent-border)', borderRadius:12, padding:'13px 15px' }}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color:'var(--nt-urgent-text)', marginBottom:4, display:'flex', alignItems:'center', gap:5 }}><IconHandshake size={14} /> Cas complexe — relais humain</div>
                  <div style={{ fontSize:13, lineHeight:1.5, color:'var(--nt-urgent-text)' }}>Demande nécessitant un traitement manuel par un conseiller NeoTravel.</div>
                </div>
              )}
              {/* Qualification */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--nt-text-secondary)', marginBottom:10 }}>Qualification automatique</div>
                <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:12, padding:'4px 16px' }}>
                  {[
                    ['Trajet', renderTrajet(drawerLead.from, drawerLead.to)],
                    ['Direction', drawerLead.ar ? <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>Aller-retour <IconRefreshCw size={13} /></span> : <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>Aller simple <IconArrowRight size={13} /></span>],
                    ['Passagers', `${drawerLead.pax} personnes`],
                    ['Date départ', drawerLead.dateDepart],
                    ['Source', drawerLead.source],
                    ['Urgence', drawerLead.urgent ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'var(--nt-urgent-text)', fontWeight:700 }}><IconZap size={13} /> Oui</span> : 'Non'],
                    ['Options', drawerLead.options.join(', ')||'—'],
                  ].map(([k,v]) => (
                    <div key={String(k)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'9px 0', borderBottom:'1px solid var(--nt-row-border)' }}>
                      <span style={{ fontSize:13, color:'var(--nt-text-discretion)' }}>{k}</span>
                      <span style={{ fontSize:13.5, fontWeight:600, color:'var(--nt-text-primary)', textAlign:'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devis */}
              {hasDevis(drawerLead) && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--nt-text-secondary)' }}>Devis</span>
                    <span style={{ fontSize:11, fontWeight:600, color:'#2f7d4a', background:'#e6f3e9', border:'1px solid #c5e3cd', padding:'2px 8px', borderRadius:6 }}>déterministe</span>
                  </div>
                  <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:11, paddingTop:11, borderTop:'2px solid var(--olive)' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--nt-text-primary)' }}>Total TTC</span>
                      <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'var(--nt-text-primary)' }}>{eur(getPrice(drawerLead))} €</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--nt-text-secondary)', marginBottom:10 }}>Conversation (résumé IA)</div>
                <div style={{ background:'var(--nt-bg-card)', border:'1px solid var(--nt-border-card)', borderRadius:12, padding:'14px 16px', fontSize:13, lineHeight:1.55, color:'var(--nt-text-secondary)', fontStyle:'italic' }}>
                  &ldquo;{drawerLead.summary}&rdquo;
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div style={{ flexShrink:0, borderTop:'1px solid var(--nt-border-card)', background:'var(--nt-bg-card)', padding:'13px 18px', display:'flex', gap:9 }}>
              <button onClick={() => handleUpdateStatus(drawerLead, 'relance', 'Relance envoyée à ' + drawerLead.client)} style={{ flex:1, fontFamily:'inherit', fontSize:13.5, fontWeight:700, color:'var(--nt-text-on-olive)', background:'var(--olive)', border:'none', padding:11, borderRadius:10, cursor:'pointer' }}>
                Relancer maintenant
              </button>
              <button onClick={() => handleUpdateStatus(drawerLead, 'Cas complexe', drawerLead.client + ' escaladé vers un commercial')} style={{ fontFamily:'inherit', fontSize:13.5, fontWeight:600, color:'var(--olive)', background:'transparent', border:'1.5px solid var(--nt-border-card)', padding:'11px 14px', borderRadius:10, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                Escalader <IconHandshake size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', zIndex:120, background:'var(--olive)', color:'var(--nt-text-on-olive)', fontSize:13.5, fontWeight:600, padding:'12px 20px', borderRadius:11, boxShadow:'0 16px 36px -12px rgba(0,0,0,0.5)', animation:'ntToast 0.24s ease', display:'flex', alignItems:'center', gap:9, transform:'translateX(-50%)' }}>
          <span style={{ color:'var(--lime)', display:'inline-flex', alignItems:'center' }}><IconCheck size={16} style={{ strokeWidth: 2.5 }} /></span>{toast}
        </div>
      )}
    </div>
  )
}
