// ─────────────────────────────────────────────
// NeoTravel — Shared TypeScript Types
// ─────────────────────────────────────────────

// ── Vehicles ──────────────────────────────────
export type TypeVehicule = 'Standard' | 'Grand tourisme'

export type OptionVehicule = 'Guide' | 'Nuit chauffeur' | 'Péages'

// ── Lead statuses (pipeline) ──────────────────
export type LeadStatus =
  | 'Nouveau'
  | 'Incomplet'
  | 'Qualifié'
  | 'Devis envoyé'
  | 'Relance 1'
  | 'Relance 2'
  | 'Accepté'
  | 'Refusé'
  | 'Cas complexe'
  | 'Clôturé'

// ── Airtable records ──────────────────────────
export interface Demande {
  id?: string
  prospect_nom: string
  prospect_email: string
  prospect_tel?: string
  origine: string
  destination: string
  date_depart: string         // ISO date string YYYY-MM-DD
  date_demande: string        // ISO date string YYYY-MM-DD
  nb_passagers: number
  type_vehicule: TypeVehicule
  options: OptionVehicule[]
  statut: LeadStatus
  urgence: boolean
  score_completude: number    // 0–100
}

export interface Devis {
  id?: string
  demande_id: string
  prix_ht: number
  tva: number
  prix_ttc: number
  lignes_json: string         // JSON.stringify(LigneDevis[])
  statut: 'Généré' | 'Envoyé' | 'Accepté' | 'Refusé'
  pdf_url?: string
  date_envoi?: string
  prochaine_relance?: string
  nb_relances: number
}

// ── Pricing engine contract ───────────────────
// This is the interface P5's calculer_devis() must satisfy.
// Do not modify without syncing with P5.

export interface DevisParams {
  nb_passagers: number
  date_depart: string         // ISO date YYYY-MM-DD
  date_demande: string        // ISO date YYYY-MM-DD
  distance_km: number
  type_vehicule: TypeVehicule
  options: OptionVehicule[]
}

export interface LigneDevis {
  libelle: string
  montant: number             // in EUR, can be negative (discount)
}

export interface CoefficientApplique {
  nom: string                 // e.g. "Saisonnalité Mai"
  valeur: number              // e.g. 0.15 for +15%
}

export interface DevisResult {
  prix_ht: number
  tva: number
  prix_ttc: number
  lignes: LigneDevis[]
  coefficients: CoefficientApplique[]
  devise: 'EUR'
}

// ── Agent conversation context ────────────────
// Partial lead data collected so far in conversation
export interface LeadDraft {
  prospect_nom?: string
  prospect_email?: string
  prospect_tel?: string
  origine?: string
  destination?: string
  date_depart?: string
  nb_passagers?: number
  type_vehicule?: TypeVehicule
  options?: OptionVehicule[]
}

// Fields required before calculer_devis() can be called
export const REQUIRED_FIELDS: (keyof LeadDraft)[] = [
  'prospect_nom',
  'prospect_email',
  'origine',
  'destination',
  'date_depart',
  'nb_passagers',
]

// ── Escalation reasons ────────────────────────
export type EscalationReason =
  | 'PASSAGERS_HORS_CAPACITE'   // > 85 passengers
  | 'TRAJET_HORS_ZONE'          // destination not covered
  | 'DATE_INCOH ÉRENTE'         // departure before request
  | 'DEMANDE_COMPLEXE'          // multi-day, international, event
  | 'LITIGE_PRIX'               // client disputes the price
  | 'AUTRE'
