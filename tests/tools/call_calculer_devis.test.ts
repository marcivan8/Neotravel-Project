import { describe, it, expect } from 'vitest'
import { call_calculer_devis } from '@/lib/tools/call_calculer_devis'

// ─────────────────────────────────────────────────────────────────────────────
// NeoTravel — call_calculer_devis tool tests
//
// This tool is the agent's ONLY path to a price.
// The LLM must never calculate or estimate a price on its own.
//
// Tested here: the runtime validation guards inside execute().
// These guards supplement Zod validation (which the AI SDK runs first) with
// NeoTravel-specific business rules.
// ─────────────────────────────────────────────────────────────────────────────

// Minimal valid params for reuse
const VALID_PARAMS = {
  demande_id:    'recABC123',
  nb_passagers:  45,
  date_depart:   '2026-08-01',
  date_demande:  '2026-06-01',
  distance_km:   100,
  type_vehicule: 'Standard'  as const,
  options:       []          as ('Guide' | 'Nuit chauffeur' | 'Péages')[],
}

// Helper: call execute() ignoring the unused ToolExecutionOptions arg
const exec = (params: typeof VALID_PARAMS & { nb_passagers?: number; date_depart?: string; date_demande?: string; distance_km?: number }) =>
  call_calculer_devis.execute!({ ...VALID_PARAMS, ...params } as any, {} as any)

describe('call_calculer_devis — validation guards', () => {

  // ── Business-rule guards inside execute() ────────────────────────────────

  it('returns escalate:true when nb_passagers > 85 (max coach capacity)', async () => {
    const result = await exec({ nb_passagers: 86 })

    expect(result.success).toBe(false)
    expect((result as any).escalate).toBe(true)
    // Error message must mention the 85-seat limit
    expect((result as any).error).toMatch(/85/)
  })

  it('handles the exact boundary (85 passengers) successfully', async () => {
    const result = await exec({ nb_passagers: 85 })
    expect(result.success).toBe(true)
  })

  it('returns an error when departure date is before request date', async () => {
    const result = await exec({
      date_depart:  '2026-05-01',  // before date_demande
      date_demande: '2026-06-01',
    })

    expect(result.success).toBe(false)
    expect((result as any).error).toMatch(/antérieure/)
  })

  it('accepts same-day departure (date_depart === date_demande)', async () => {
    const result = await exec({
      date_depart:  '2026-06-01',
      date_demande: '2026-06-01',
    })
    expect(result.success).toBe(true)
  })

  // ── Success path ────────────────────────────────────────────────────────

  it('returns a complete devis for valid params', async () => {
    const result = await exec({})

    expect(result.success).toBe(true)
    const devis = (result as any).devis
    expect(devis).toBeDefined()

    // 100 km × 2.50 = 275 TTC
    expect(devis.prix_ht).toBe(250)
    expect(devis.tva).toBe(25)
    expect(devis.prix_ttc).toBe(275)
  })

  it('echoes back the demande_id so downstream tools can chain on it', async () => {
    const result = await exec({})

    expect(result.success).toBe(true)
    expect((result as any).demande_id).toBe('recABC123')
  })

  it('always returns devise EUR', async () => {
    const result = await exec({})

    expect(result.success).toBe(true)
    expect((result as any).devis.devise).toBe('EUR')
  })

  it('includes lignes and coefficients in the devis', async () => {
    const result = await exec({})

    expect(result.success).toBe(true)
    const devis = (result as any).devis
    expect(Array.isArray(devis.lignes)).toBe(true)
    expect(devis.lignes.length).toBeGreaterThan(0)
    expect(Array.isArray(devis.coefficients)).toBe(true)
  })

  // ── Different vehicle types and options ─────────────────────────────────

  it('accepts Grand tourisme vehicle type', async () => {
    const result = await call_calculer_devis.execute!(
      { ...VALID_PARAMS, type_vehicule: 'Grand tourisme' },
      {} as any
    )
    expect(result.success).toBe(true)
  })

  it('accepts all valid option combinations', async () => {
    const result = await call_calculer_devis.execute!(
      { ...VALID_PARAMS, options: ['Guide', 'Nuit chauffeur', 'Péages'] },
      {} as any
    )
    expect(result.success).toBe(true)
  })
})
