export interface DevisResult {
  prix_ht: number
  tva: number
  prix_ttc: number
  lignes: Array<{ libelle: string; montant: number }>
  coefficients: Array<{ nom: string; valeur: number }>
  devise: 'EUR'
  cout_par_personne: number
  type_tarification: string
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

  const paxCount = params.nb_passagers || 1
  const cout_par_personne = Math.round((prix_ttc / paxCount) * 100) / 100

  const getTarificationType = (dateDepart: string) => {
    if (!dateDepart) return 'Saison Basse 📉'
    const month = new Date(dateDepart).getMonth() + 1
    if ([5, 6, 7, 8, 9, 12].includes(month)) {
      return 'Saison Haute 📈'
    }
    return 'Saison Basse 📉'
  }
  const type_tarification = getTarificationType(params.date_depart)

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
    cout_par_personne,
    type_tarification,
  }
}
