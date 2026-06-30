import { describe, it, expect } from 'vitest'
import { calculer_devis_stub } from '@/lib/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// NeoTravel — pricing engine tests
//
// CRITICAL: NeoTravel's pricing must ALWAYS be deterministic.
// The LLM must never calculate or estimate a price — it calls this function.
//
// Formula (stub — will be replaced by P5's full engine):
//   prix_ht  = distance_km × 2.50 (rounded to 2dp)
//   tva      = prix_ht × 0.10     (rounded to 2dp)
//   prix_ttc = prix_ht + tva      (rounded to 2dp)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_PARAMS = {
  nb_passagers: 45,
  date_depart: '2026-08-01',
  date_demande: '2026-06-01',
  type_vehicule: 'Standard' as const,
  options: [] as string[],
}

describe('calculer_devis_stub — pricing formula', () => {

  // ── Core calculation ────────────────────────────────────────────────────

  it('calculates correct HT, TVA, and TTC for a round distance', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 100 })

    // 100 × 2.50 = 250.00 HT
    expect(result.prix_ht).toBe(250)
    // 250 × 0.10 = 25.00 TVA
    expect(result.tva).toBe(25)
    // 250 + 25 = 275.00 TTC
    expect(result.prix_ttc).toBe(275)
  })

  it('calculates correct values for a float distance (Paris–Lyon 465 km)', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 465 })

    // 465 × 2.50 = 1162.50 HT
    expect(result.prix_ht).toBe(1162.5)
    // 1162.50 × 0.10 = 116.25 TVA
    expect(result.tva).toBe(116.25)
    // 1162.50 + 116.25 = 1278.75 TTC
    expect(result.prix_ttc).toBe(1278.75)
  })

  it('handles a large distance (Paris–Nice ~930 km)', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 930 })

    expect(result.prix_ht).toBe(2325)
    expect(result.tva).toBe(232.5)
    expect(result.prix_ttc).toBe(2557.5)
  })

  it('returns zero amounts for 0 km (edge case)', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 0 })

    expect(result.prix_ht).toBe(0)
    expect(result.tva).toBe(0)
    expect(result.prix_ttc).toBe(0)
  })

  // ── Currency & metadata ─────────────────────────────────────────────────

  it('always returns devise EUR', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200 })
    expect(result.devise).toBe('EUR')
  })

  it('includes a coefficients array (required by downstream PDF generator)', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200 })

    expect(Array.isArray(result.coefficients)).toBe(true)
    expect(result.coefficients.length).toBeGreaterThan(0)
    // Each entry must have nom (string) and valeur (number)
    for (const c of result.coefficients) {
      expect(typeof c.nom).toBe('string')
      expect(typeof c.valeur).toBe('number')
    }
  })

  // ── Line items ──────────────────────────────────────────────────────────

  it('returns exactly 2 line items: base transport + TVA', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 100 })

    expect(result.lignes).toHaveLength(2)
    expect(result.lignes[0].libelle).toContain('100 km')
    expect(result.lignes[0].montant).toBe(250)
    expect(result.lignes[1].libelle).toContain('TVA 10%')
    expect(result.lignes[1].montant).toBe(25)
  })

  it('uses the correct distance label in line 1', () => {
    const result = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 465 })
    expect(result.lignes[0].libelle).toContain('465 km')
    expect(result.lignes[0].libelle).toContain('2,50')
  })

  // ── Stub isolation — these params should NOT change the price (stub only) ─

  it('produces the same price regardless of nb_passagers (stub limitation)', () => {
    const r1 = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200, nb_passagers: 10 })
    const r2 = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200, nb_passagers: 85 })
    // The stub does not factor in passenger count — documented behaviour
    expect(r1.prix_ttc).toBe(r2.prix_ttc)
  })

  it('produces the same price regardless of type_vehicule (stub limitation)', () => {
    const r1 = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200, type_vehicule: 'Standard' })
    const r2 = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200, type_vehicule: 'Grand tourisme' })
    expect(r1.prix_ttc).toBe(r2.prix_ttc)
  })

  it('produces the same price regardless of options (stub limitation)', () => {
    const r1 = calculer_devis_stub({ ...BASE_PARAMS, distance_km: 200, options: [] })
    const r2 = calculer_devis_stub({
      ...BASE_PARAMS,
      distance_km: 200,
      options: ['Guide', 'Nuit chauffeur', 'Péages'],
    })
    expect(r1.prix_ttc).toBe(r2.prix_ttc)
  })
})
