import { describe, it, expect } from 'vitest'
import { parseTravelRequest } from '@/lib/fallback_parser'

// ─────────────────────────────────────────────────────────────────────────────
// NeoTravel — fallback_parser tests
//
// The parser is the NL fallback when no LLM key is configured.
// Key rules:
//   • Cities are detected by text-position order (first = origine, second = destination)
//   • nb_passagers is capped at 45 (default) when value > 85 or no number found
//   • Date is YYYY-MM-DD; defaults to today+30 days when absent
// ─────────────────────────────────────────────────────────────────────────────

describe('parseTravelRequest — routes, passengers, dates', () => {

  // ── Route & date parsing ────────────────────────────────────────────────

  it('parses a standard route, passenger count, and explicit date', () => {
    const result = parseTravelRequest('Paris to Lyon, 45 passagers, le 12/07')

    expect(result.origine).toBe('Paris')
    expect(result.destination).toBe('Lyon')
    expect(result.nb_passagers).toBe(45)
    // Date "12/07" → day 12, month 07 of the current year
    expect(result.date_depart).toBe(`${new Date().getFullYear()}-07-12`)
  })

  it('detects cities in text-position order (first city = origine)', () => {
    // "Versailles" appears before "Annecy" → Versailles is origine
    const result = parseTravelRequest('Voyage scolaire à Versailles depuis Annecy')

    expect(result.origine).toBe('Versailles')
    expect(result.destination).toBe('Annecy')
    expect(result.nb_passagers).toBe(45) // no number → default
  })

  it('extracts passenger counts with various French keywords', () => {
    // élèves
    const r1 = parseTravelRequest('Trajet de Lille à Bruxelles avec 60 élèves le 25/08')
    expect(r1.origine).toBe('Lille')
    expect(r1.destination).toBe('Bruxelles')
    expect(r1.nb_passagers).toBe(60)

    // voyageurs
    const r2 = parseTravelRequest('Marseille à Toulouse, 12 voyageurs')
    expect(r2.nb_passagers).toBe(12)

    // personnes
    const r3 = parseTravelRequest('Lyon à Nantes, 35 personnes')
    expect(r3.nb_passagers).toBe(35)

    // pax (industry shorthand)
    const r4 = parseTravelRequest('Paris Lyon 50 pax')
    expect(r4.nb_passagers).toBe(50)

    // membres
    const r5 = parseTravelRequest('Bordeaux Toulouse 22 membres')
    expect(r5.nb_passagers).toBe(22)
  })

  it('defaults to 30 days from today when no date is given', () => {
    const result = parseTravelRequest('Marseille à Toulouse, 12 voyageurs')

    const expected = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    expect(result.date_depart).toBe(expected)
  })

  // ── Passenger-count edge cases ──────────────────────────────────────────

  it('caps passengers at default 45 when count exceeds 85', () => {
    // A coach seats at most 85; >85 requires escalation → keep default
    const result = parseTravelRequest('Paris à Lyon, 90 passagers, le 15/09')

    expect(result.nb_passagers).toBe(45)
    expect(result.origine).toBe('Paris')
    expect(result.destination).toBe('Lyon')
  })

  it('uses exactly 85 passengers when given (boundary value)', () => {
    const result = parseTravelRequest('Paris Lyon 85 passagers le 10/10')
    expect(result.nb_passagers).toBe(85)
  })

  it('keeps default 45 when no passenger number appears in the text', () => {
    const result = parseTravelRequest('Avignon à Bordeaux pour notre groupe')
    expect(result.nb_passagers).toBe(45)
  })

  // ── City detection edge cases ───────────────────────────────────────────

  it('falls back to Paris → Lyon when no known city is mentioned', () => {
    const result = parseTravelRequest('Un voyage pour 30 personnes le 01/08')

    expect(result.origine).toBe('Paris')
    expect(result.destination).toBe('Lyon')
    expect(result.nb_passagers).toBe(30)
  })

  it('uses found city as origine and Paris as default destination when only one city appears', () => {
    const result = parseTravelRequest('Départ depuis Marseille, 40 passagers')

    expect(result.origine).toBe('Marseille')
    expect(result.destination).toBe('Paris')
  })

  // ── Date parsing edge cases ─────────────────────────────────────────────

  it('parses a date with a 2-digit year', () => {
    const result = parseTravelRequest('Paris Lyon le 05/06/26')
    expect(result.date_depart).toBe('2026-06-05')
  })

  it('parses a date with a 4-digit year', () => {
    const result = parseTravelRequest('Lyon Bordeaux 20 pax le 10/09/2027')
    expect(result.date_depart).toBe('2027-09-10')
  })

  // ── Round-Trip detection ────────────────────────────────────────────────

  it('detects round-trip queries correctly', () => {
    const r1 = parseTravelRequest('Paris Lyon, 45 passagers, aller-retour')
    expect(r1.aller_retour).toBe(true)

    const r2 = parseTravelRequest('Aller retour Versailles depuis Paris le 12/07')
    expect(r2.aller_retour).toBe(true)

    const r3 = parseTravelRequest('Voyage scolaire à Versailles A/R pour 30 élèves')
    expect(r3.aller_retour).toBe(true)

    const r4 = parseTravelRequest('Paris Lyon simple')
    expect(r4.aller_retour).toBe(false)
  })
})
