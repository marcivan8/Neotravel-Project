export interface DevisResult {
  prix_ht: number
  tva: number
  prix_ttc: number
  lignes: Array<{ libelle: string; montant: number }>
  coefficients: Array<{ nom: string; valeur: number }>
  devise: 'EUR'
}

export function calculer_devis_stub(params: {
  nb_passagers: number
  date_depart: string
  date_demande: string
  distance_km: number
  type_vehicule: string
  options: string[]
}): DevisResult {
  const base = params.distance_km * 2.5
  const prix_ht = Math.round(base * 100) / 100
  const tva = Math.round(prix_ht * 0.1 * 100) / 100
  const prix_ttc = Math.round((prix_ht + tva) * 100) / 100

  return {
    prix_ht,
    tva,
    prix_ttc,
    lignes: [
      { libelle: `Distance ${params.distance_km} km × 2,50 €/km`, montant: base },
      { libelle: 'TVA 10%', montant: tva },
    ],
    coefficients: [{ nom: 'STUB — remplacer par calculer_devis() de P5', valeur: 0 }],
    devise: 'EUR',
  }
}
