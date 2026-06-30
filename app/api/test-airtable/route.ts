import { NextResponse } from 'next/server'
import { queryRecords, createRecord, TABLES } from '@/lib/airtable'

export const dynamic = 'force-dynamic'

/**
 * GET /api/test-airtable
 * Connectivity check — run this once to confirm your credentials work.
 * Checks env vars, reads the Leads table, writes a dummy record then deletes it.
 */
export async function GET() {
  const results: Record<string, unknown> = {}

  // ── 1. Env vars ──────────────────────────────
  const apiKey  = process.env.AIRTABLE_API_KEY  ?? ''
  const baseId  = process.env.AIRTABLE_BASE_ID  ?? ''

  results.env = {
    AIRTABLE_API_KEY: apiKey  ? `✓ set (${apiKey.slice(0, 12)}...)` : '✗ MISSING',
    AIRTABLE_BASE_ID: baseId  ? `✓ set (${baseId})` : '✗ MISSING',
  }

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { success: false, message: 'Missing env vars — fill in .env.local', ...results },
      { status: 500 }
    )
  }

  // ── 2. Read test ─────────────────────────────
  try {
    const leads = await queryRecords(TABLES.LEADS, undefined, 3)
    results.read_test = {
      ok: true,
      table: TABLES.LEADS,
      records_found: leads.length,
      sample: leads[0]
        ? { id: leads[0].id, fields: leads[0].fields }
        : null,
    }
  } catch (err) {
    results.read_test = { ok: false, error: String(err) }
  }

  // ── 3. Write test (create + delete) ──────────
  let testId: string | null = null
  try {
    const testRecord = await createRecord(TABLES.LEADS, {
      Nom_Client:    '[TEST] Connexion Airtable — à supprimer',
      Email_Client:  'test-connexion@neotravel-internal.fr',
      Statut:        'Nouveau',
      Date_Creation: new Date().toISOString(),
    })
    testId = testRecord.id
    results.write_test = { ok: true, created_id: testId }
  } catch (err) {
    results.write_test = { ok: false, error: String(err) }
  }

  // ── 4. Delete the test record ─────────────────
  if (testId) {
    try {
      const delRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.LEADS)}/${testId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      )
      results.cleanup = delRes.ok
        ? { ok: true, deleted_id: testId }
        : { ok: false, status: delRes.status }
    } catch (err) {
      results.cleanup = { ok: false, error: String(err) }
    }
  }

  // ── 5. Also read Opportunites to verify second table ──
  try {
    const opps = await queryRecords(TABLES.OPPORTUNITES, undefined, 1)
    results.opportunites_table = { ok: true, records_found: opps.length }
  } catch (err) {
    results.opportunites_table = { ok: false, error: String(err) }
  }

  const readOk  = (results.read_test  as { ok: boolean }).ok
  const writeOk = (results.write_test as { ok: boolean }).ok
  const allOk   = readOk && writeOk

  return NextResponse.json(
    {
      success: allOk,
      message: allOk
        ? '✅ Airtable connecté — lecture et écriture OK'
        : '❌ Au moins un test a échoué — voir détails',
      ...results,
    },
    { status: allOk ? 200 : 500 }
  )
}
