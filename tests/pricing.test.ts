import { describe, it, expect } from 'vitest'
import { calculer_devis_stub } from '@/lib/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// NeoTravel — pricing engine tests
//
// RÈGLES CRITIQUES :
//  - Le LLM ne calcule JAMAIS un prix : il appelle calculer_devis_stub()
//  - Le moteur est 100 % déterministe (mêmes inputs → mêmes outputs)
//
// Tarif/km dégressif :
//   ≤ 100 km → 2,80 €/km
//   ≤ 300 km → 2,50 €/km
//   ≤ 500 km → 2,20 €/km
//   > 500 km → 2,00 €/km
//
// Coefficient saisonnier :
//   Haute  (juin–sept, déc) → ×1,25
//   Normale (mars–mai, oct–nov) → ×1,00
//   Basse  (jan–fév)        → ×0,90
//
// Aller-retour : transport ×2 − 2 % de remise ; péages ×2 sans remise
// TVA 10 %
// ─────────────────────────────────────────────────────────────────────────────

// Saison normale → coeff 1,0 → résultat le plus prévisible pour les tests
const BASE_NORMALE = {
  nb_passagers: 45,
  date_depart:  '2026-04-15',   // avril = saison normale (×1,00)
  date_demande: '2026-03-01',
  type_vehicule: 'Standard' as const,
  options: [] as string[],
}

// Haute saison pour tester le coefficient
const BASE_HAUTE = {
  ...BASE_NORMALE,
  date_depart: '2026-08-01',    // août = haute saison (×1,25)
}

// Basse saison
const BASE_BASSE = {
  ...BASE_NORMALE,
  date_depart: '2026-01-20',    // janvier = basse saison (×0,90)
}

describe('calculer_devis_stub — tarif dégressif', () => {

  it('≤ 100 km : tarif 2,80 €/km (saison normale)', () => {
    // 100 × 2,80 = 280 HT  |  TVA 28  |  TTC 308
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 100 })
    expect(r.prix_ht).toBe(280)
    expect(r.tva).toBe(28)
    expect(r.prix_ttc).toBe(308)
    expect(r.tarif_km).toBe(2.80)
  })

  it('100–300 km : tarif 2,50 €/km (saison normale)', () => {
    // 200 × 2,50 = 500 HT  |  TVA 50  |  TTC 550
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    expect(r.prix_ht).toBe(500)
    expect(r.tva).toBe(50)
    expect(r.prix_ttc).toBe(550)
    expect(r.tarif_km).toBe(2.50)
  })

  it('300–500 km : tarif 2,20 €/km (saison normale)', () => {
    // 400 × 2,20 = 880 HT  |  TVA 88  |  TTC 968
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 400 })
    expect(r.prix_ht).toBe(880)
    expect(r.tva).toBe(88)
    expect(r.prix_ttc).toBe(968)
    expect(r.tarif_km).toBe(2.20)
  })

  it('> 500 km : tarif 2,00 €/km (saison normale)', () => {
    // 930 × 2,00 = 1860 HT  |  TVA 186  |  TTC 2046
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 930 })
    expect(r.prix_ht).toBe(1860)
    expect(r.tva).toBe(186)
    expect(r.prix_ttc).toBe(2046)
    expect(r.tarif_km).toBe(2.00)
  })

  it('edge case — 0 km', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 0 })
    expect(r.prix_ht).toBe(0)
    expect(r.tva).toBe(0)
    expect(r.prix_ttc).toBe(0)
  })

})

describe('calculer_devis_stub — coefficient saisonnier', () => {

  it('haute saison (août) applique ×1,25 au transport', () => {
    // 200 km × 2,50 = 500 brut × 1,25 = 625 HT  |  TVA 62,50  |  TTC 687,50
    const r = calculer_devis_stub({ ...BASE_HAUTE, distance_km: 200 })
    expect(r.prix_ht).toBe(625)
    expect(r.tva).toBe(62.5)
    expect(r.prix_ttc).toBe(687.5)
    expect(r.type_tarification).toContain('Haute')
    expect(r.coefficients.find(c => c.nom.includes('Haute'))?.valeur).toBe(1.25)
  })

  it('basse saison (janvier) applique ×0,90 au transport', () => {
    // 200 km × 2,50 = 500 brut × 0,90 = 450 HT  |  TVA 45  |  TTC 495
    const r = calculer_devis_stub({ ...BASE_BASSE, distance_km: 200 })
    expect(r.prix_ht).toBe(450)
    expect(r.tva).toBe(45)
    expect(r.prix_ttc).toBe(495)
    expect(r.type_tarification).toContain('Basse')
  })

  it('saison normale (avril) n\'applique aucun coefficient (×1,00)', () => {
    // 200 km × 2,50 = 500 HT  (aucun ajustement)
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    expect(r.prix_ht).toBe(500)
    expect(r.type_tarification).toContain('Normale')
  })

})

describe('calculer_devis_stub — lignes du devis', () => {

  it('saison normale : 2 lignes (transport + TVA)', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 100 })
    // Pas de ligne saison si coeff = 1,0
    expect(r.lignes).toHaveLength(2)
    expect(r.lignes[0].libelle).toContain('100 km')
    expect(r.lignes[0].libelle).toContain('2,80')
    expect(r.lignes[0].montant).toBe(280)
    expect(r.lignes[1].libelle).toContain('TVA')
    expect(r.lignes[1].montant).toBe(28)
  })

  it('haute saison : 3 lignes (transport + coeff + TVA)', () => {
    const r = calculer_devis_stub({ ...BASE_HAUTE, distance_km: 100 })
    expect(r.lignes).toHaveLength(3)
    expect(r.lignes[0].libelle).toContain('100 km')
    expect(r.lignes[0].montant).toBe(280)
    expect(r.lignes[1].libelle).toContain('Haute Saison')
    expect(r.lignes[1].montant).toBe(70)   // 280 × 0,25 = 70
    expect(r.lignes[2].libelle).toContain('TVA')
    expect(r.lignes[2].montant).toBe(35)
  })

  it('inclut la ligne péages si peages_cost > 0', () => {
    // 100 km, saison normale → brut=280, péages=50, HT=330, TVA=33, TTC=363
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 100, peages_cost: 50 })
    expect(r.prix_ht).toBe(330)
    expect(r.tva).toBe(33)
    expect(r.prix_ttc).toBe(363)
    expect(r.lignes).toHaveLength(3)   // transport + péages + TVA
    const peagesLigne = r.lignes.find(l => l.libelle.toLowerCase().includes('péages'))
    expect(peagesLigne).toBeDefined()
    expect(peagesLigne!.montant).toBe(50)
  })

  it('n\'inclut PAS de ligne péages si peages_cost = 0', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    expect(r.lignes.find(l => l.libelle.toLowerCase().includes('péages'))).toBeUndefined()
  })

})

describe('calculer_devis_stub — aller-retour', () => {

  it('aller-retour : transport ×2 − 2 % + péages ×2', () => {
    // 200 km, saison normale, péages 25 €, A/R
    // transport_aller = 200 × 2,50 = 500
    // remise = 500 × 2 × 0,02 = 20
    // transport_ar = 500 × 2 − 20 = 980
    // péages_ar = 25 × 2 = 50
    // HT = 980 + 50 = 1030  |  TVA 103  |  TTC 1133
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200, peages_cost: 25, aller_retour: true })
    expect(r.prix_ht).toBe(1030)
    expect(r.tva).toBe(103)
    expect(r.prix_ttc).toBe(1133)
    expect(r.aller_retour).toBe(true)
  })

  it('aller-retour : présence de la ligne remise −2 %', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200, aller_retour: true })
    const remiseLigne = r.lignes.find(l => l.libelle.includes('2 %'))
    expect(remiseLigne).toBeDefined()
    expect(remiseLigne!.montant).toBe(-20)   // 500 × 2 × 0,02 = −20
  })

  it('aller simple : aller_retour = false par défaut', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    expect(r.aller_retour).toBe(false)
    // Prix aller simple ≠ aller-retour
    const rAR = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200, aller_retour: true })
    expect(r.prix_ttc).toBeLessThan(rAR.prix_ttc)
  })

})

describe('calculer_devis_stub — prix par personne & métadonnées', () => {

  it('cout_par_personne = prix_ttc / nb_passagers', () => {
    // 200 km, saison normale → TTC = 550, 45 pax → 550/45 = 12,22
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    const expected = Math.round((r.prix_ttc / BASE_NORMALE.nb_passagers) * 100) / 100
    expect(r.cout_par_personne).toBe(expected)
  })

  it('devise toujours EUR', () => {
    expect(calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 }).devise).toBe('EUR')
  })

  it('coefficients : tableau avec au moins 1 entrée { nom, valeur }', () => {
    const r = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200 })
    expect(Array.isArray(r.coefficients)).toBe(true)
    expect(r.coefficients.length).toBeGreaterThan(0)
    for (const c of r.coefficients) {
      expect(typeof c.nom).toBe('string')
      expect(typeof c.valeur).toBe('number')
    }
  })

  it('nb_passagers n\'affecte pas le prix TTC (tarif par véhicule)', () => {
    const r1 = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200, nb_passagers: 10 })
    const r2 = calculer_devis_stub({ ...BASE_NORMALE, distance_km: 200, nb_passagers: 85 })
    expect(r1.prix_ttc).toBe(r2.prix_ttc)
  })

})
