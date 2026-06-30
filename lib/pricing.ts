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
  peages_cost?: number
}): DevisResult {
  const base = params.distance_km * 2.5
  const peages = params.peages_cost || 0
  const total_ht = base + peages
  const prix_ht = Math.round(total_ht * 100) / 100
  const tva = Math.round(prix_ht * 0.1 * 100) / 100
  const prix_ttc = Math.round((prix_ht + tva) * 100) / 100

  const lignes = [
    { libelle: `Distance ${params.distance_km} km × 2,50 €/km`, montant: base },
  ]
  if (peages > 0) {
    lignes.push({ libelle: `Frais de péages d'autoroute`, montant: peages })
  }
  lignes.push({ libelle: 'TVA 10%', montant: tva })

  return {
    prix_ht,
    tva,
    prix_ttc,
    lignes,
    coefficients: [{ nom: 'STUB — remplacer par calculer_devis() de P5', valeur: 0 }],
    devise: 'EUR',
  }
}
