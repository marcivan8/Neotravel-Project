export interface DevisResult {
  prix_ht: number
  tva: number
  prix_ttc: number
  lignes: Array<{ libelle: string; montant: number }>
  coefficients: Array<{ nom: string; valeur: number }>
  devise: 'EUR'
  cout_par_personne: number
  type_tarification: string
  tarif_km: number
  aller_retour: boolean
}

// ── Tarif dégressif selon la distance ────────────────────────────────────────
// Plus le trajet est long, plus le tarif au km est bas.
function getTarifKm(distance_km: number): number {
  if (distance_km <= 100) return 2.80   // courts trajets
  if (distance_km <= 300) return 2.50   // trajets régionaux
  if (distance_km <= 500) return 2.20   // trajets interrégionaux
  return 2.00                           // longs trajets nationaux
}

// ── Coefficient saisonnier ────────────────────────────────────────────────────
// Haute saison (juin–sept + déc) : +25 %
// Basse saison (jan–fév)          : −10 %
// Saison normale (mars–mai, oct–nov) : ×1,00
function getSaison(dateDepart: string): { coeff: number; label: string } {
  if (!dateDepart) return { coeff: 1.0, label: 'Saison Normale' }
  const month = new Date(dateDepart).getMonth() + 1
  if ([6, 7, 8, 9, 12].includes(month)) return { coeff: 1.25, label: 'Haute Saison 📈' }
  if ([1, 2].includes(month))             return { coeff: 0.90, label: 'Basse Saison 📉' }
  return { coeff: 1.00, label: 'Saison Normale' }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Moteur de tarification NeoTravel.
 *
 * Éléments pris en compte :
 *  1. Tarif/km dégressif selon la distance
 *  2. Coefficient saisonnier (haute / normale / basse)
 *  3. Péages (montant aller simple — doublé automatiquement si A/R)
 *  4. Aller-retour : ×2 avec −2 % de remise sur la prestation transport
 *  5. TVA 10 %
 *  6. Prix par personne
 */
export function calculer_devis_stub(params: {
  nb_passagers: number
  date_depart: string
  date_demande: string
  distance_km: number
  type_vehicule: string
  options: string[]
  peages_cost?: number    // ← montant aller simple (non doublé)
  aller_retour?: boolean
}): DevisResult {
  const tarif_km = getTarifKm(params.distance_km)
  const { coeff: saison_coeff, label: saison_label } = getSaison(params.date_depart)
  const is_ar = params.aller_retour ?? false

  // ── 1. Transport aller (base brute + coefficient saison) ──────────────────
  const transport_brut   = round2(params.distance_km * tarif_km)
  const transport_aller  = round2(transport_brut * saison_coeff)
  const ajust_saison     = round2(transport_aller - transport_brut)

  // ── 2. Péages ─────────────────────────────────────────────────────────────
  const peages_aller = round2(params.peages_cost ?? 0)
  const peages_total = is_ar ? round2(peages_aller * 2) : peages_aller

  // ── 3. Calcul HT selon type de trajet ────────────────────────────────────
  let prix_ht: number
  const lignes: Array<{ libelle: string; montant: number }> = []

  lignes.push({
    libelle: `Transport aller — ${params.distance_km} km × ${tarif_km.toFixed(2).replace('.', ',')} €/km`,
    montant: transport_brut,
  })

  if (saison_coeff !== 1.0) {
    lignes.push({
      libelle: `Coefficient ${saison_label} (×${saison_coeff.toFixed(2)})`,
      montant: ajust_saison,
    })
  }

  if (is_ar) {
    const transport_retour  = transport_aller                       // même distance/tarif
    const remise_ar         = round2((transport_aller + transport_retour) * 0.02)
    const transport_ar_net  = round2(transport_aller + transport_retour - remise_ar)

    prix_ht = round2(transport_ar_net + peages_total)

    lignes.push({
      libelle: `Transport retour (trajet identique)`,
      montant: transport_retour,
    })
    lignes.push({
      libelle: `Remise aller-retour (−2 %)`,
      montant: -remise_ar,
    })
    if (peages_total > 0) {
      lignes.push({
        libelle: `Péages d'autoroute (aller-retour)`,
        montant: peages_total,
      })
    }
  } else {
    prix_ht = round2(transport_aller + peages_aller)

    if (peages_aller > 0) {
      lignes.push({
        libelle: `Péages d'autoroute`,
        montant: peages_aller,
      })
    }
  }

  // ── 4. TVA & totaux ───────────────────────────────────────────────────────
  const tva              = round2(prix_ht * 0.1)
  const prix_ttc         = round2(prix_ht + tva)
  const pax              = Math.max(params.nb_passagers, 1)
  const cout_par_personne = round2(prix_ttc / pax)

  lignes.push({ libelle: 'TVA 10 %', montant: tva })

  return {
    prix_ht,
    tva,
    prix_ttc,
    lignes,
    coefficients: [
      { nom: `Tarif/km (${params.distance_km} km)`, valeur: tarif_km },
      { nom: saison_label,                           valeur: saison_coeff },
    ],
    devise: 'EUR',
    cout_par_personne,
    type_tarification: saison_label,
    tarif_km,
    aller_retour: is_ar,
  }
}
