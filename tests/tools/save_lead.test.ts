import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// ── Mock @/lib/airtable BEFORE importing the tool ────────────────────────────
// save_lead.execute() calls createLead + createOpportunite.
// We stub those to avoid real HTTP calls in tests.
vi.mock('@/lib/airtable', () => ({
  createLead:       vi.fn(),
  createOpportunite: vi.fn(),
}))

import { save_lead } from '@/lib/tools/save_lead'
import { createLead, createOpportunite } from '@/lib/airtable'

// ─────────────────────────────────────────────────────────────────────────────
// NeoTravel — save_lead tool tests
//
// save_lead is the agent's first step: it persists contact info and an initial
// journey Opportunite to Airtable, then returns IDs used by downstream tools.
//
// Two layers tested here:
//   1. Zod schema — rejects bad input before execute() is called
//   2. execute() — business logic, non-fatal Opportunite failures, error path
// ─────────────────────────────────────────────────────────────────────────────

const VALID_PARAMS = {
  prospect_nom:   'Marie Dupont',
  prospect_email: 'marie.dupont@example.com',
  prospect_tel:   '06 12 34 56 78',
  origine:        'Paris',
  destination:    'Lyon',
  date_depart:    '2026-08-15',
  nb_passagers:   45,
  type_vehicule:  'Standard'  as const,
  options:        []          as ('Guide' | 'Nuit chauffeur' | 'Péages')[],
  urgence:        false,
}

// Helper to call execute() while bypassing ToolExecutionOptions
const exec = (params: Partial<typeof VALID_PARAMS> = {}) =>
  save_lead.execute!({ ...VALID_PARAMS, ...params } as any, {} as any)

describe('save_lead — Zod schema validation', () => {
  const schema = save_lead.parameters as z.ZodObject<any>

  it('accepts a fully valid payload', () => {
    const result = schema.safeParse(VALID_PARAMS)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email address', () => {
    const result = schema.safeParse({ ...VALID_PARAMS, prospect_email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects nb_passagers = 0 (must be ≥ 1)', () => {
    const result = schema.safeParse({ ...VALID_PARAMS, nb_passagers: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects nb_passagers > 85 (max coach capacity)', () => {
    const result = schema.safeParse({ ...VALID_PARAMS, nb_passagers: 86 })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed date_depart (not YYYY-MM-DD)', () => {
    const result = schema.safeParse({ ...VALID_PARAMS, date_depart: '15/08/2026' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown type_vehicule', () => {
    const result = schema.safeParse({ ...VALID_PARAMS, type_vehicule: 'Minibus' })
    expect(result.success).toBe(false)
  })

  it('allows prospect_tel to be omitted (optional field)', () => {
    const { prospect_tel, ...withoutTel } = VALID_PARAMS
    const result = schema.safeParse(withoutTel)
    expect(result.success).toBe(true)
  })
})

describe('save_lead — execute() logic', () => {
  beforeEach(() => {
    vi.mocked(createLead).mockResolvedValue('recLEAD001')
    vi.mocked(createOpportunite).mockResolvedValue('recOPP001')
  })

  // ── Success path ──────────────────────────────────────────────────────────

  it('returns success:true with demande_id and opportunite_id', async () => {
    const result = await exec()

    expect(result.success).toBe(true)
    expect((result as any).demande_id).toBe('recLEAD001')
    expect((result as any).opportunite_id).toBe('recOPP001')
  })

  it('returns the trajet string (origine → destination)', async () => {
    const result = await exec()

    expect(result.success).toBe(true)
    expect((result as any).trajet).toBe('Paris → Lyon')
  })

  it('returns a date_demande in YYYY-MM-DD format', async () => {
    const result = await exec()

    expect(result.success).toBe(true)
    expect((result as any).date_demande).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('calls createLead with the correct contact fields', async () => {
    await exec()

    expect(createLead).toHaveBeenCalledWith({
      nom:       'Marie Dupont',
      email:     'marie.dupont@example.com',
      telephone: '06 12 34 56 78',
    })
  })

  it('calls createOpportunite linked to the lead ID', async () => {
    await exec()

    expect(createOpportunite).toHaveBeenCalledWith(
      'recLEAD001',
      expect.objectContaining({
        nombre_passagers: 45,
        distance_km:      0,   // placeholder before calculer_devis runs
        prix_total:       0,
      })
    )
  })

  // ── Non-fatal Opportunite failure ─────────────────────────────────────────

  it('still returns success:true when createOpportunite throws (non-fatal)', async () => {
    vi.mocked(createOpportunite).mockRejectedValueOnce(new Error('Airtable rate limit'))

    const result = await exec()

    expect(result.success).toBe(true)
    expect((result as any).demande_id).toBe('recLEAD001')
    // opportunite_id should be null when creation fails
    expect((result as any).opportunite_id).toBeNull()
  })

  // ── Fatal Lead failure ────────────────────────────────────────────────────

  it('returns success:false when createLead throws', async () => {
    vi.mocked(createLead).mockRejectedValueOnce(new Error('Airtable: AUTHENTICATION_REQUIRED'))

    const result = await exec()

    expect(result.success).toBe(false)
    expect((result as any).error).toContain('AUTHENTICATION_REQUIRED')
  })

  // ── Different input variants ──────────────────────────────────────────────

  it('marks urgence as Urgente in the Opportunite when urgence=true', async () => {
    await exec({ urgence: true })

    expect(createOpportunite).toHaveBeenCalledWith(
      'recLEAD001',
      expect.objectContaining({ urgence: 'Urgente' })
    )
  })

  it('passes undefined telephone when prospect_tel is omitted', async () => {
    const { prospect_tel, ...withoutTel } = VALID_PARAMS
    await save_lead.execute!({ ...withoutTel } as any, {} as any)

    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({ telephone: undefined })
    )
  })
})
