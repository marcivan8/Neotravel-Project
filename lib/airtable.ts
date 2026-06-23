// ─────────────────────────────────────────────
// NeoTravel — Airtable REST API Helper
// ─────────────────────────────────────────────
// All Airtable interactions go through this file.
// Table names must match exactly what P4 set up.
// ─────────────────────────────────────────────

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ── Table name constants ──────────────────────
// Keep these in sync with P4's Airtable base.
export const TABLES = {
  DEMANDES: 'Demandes',
  MATRICES: 'Matrices',
  DEVIS:    'Devis',
  RELANCES: 'Relances',
  CLIENTS:  'Clients',
} as const

// ── Generic helpers ───────────────────────────

/** Create a new record in a table. Returns the created record. */
export async function createRecord(
  table: string,
  fields: Record<string, unknown>
): Promise<{ id: string; fields: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Airtable createRecord failed [${table}]: ${error}`)
  }

  return res.json()
}

/** Update fields on an existing record by its Airtable record ID. */
export async function updateRecord(
  table: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<{ id: string; fields: Record<string, unknown> }> {
  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(table)}/${recordId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ fields }),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Airtable updateRecord failed [${table}/${recordId}]: ${error}`)
  }

  return res.json()
}

/** Fetch a single record by its Airtable record ID. */
export async function getRecord(
  table: string,
  recordId: string
): Promise<{ id: string; fields: Record<string, unknown> }> {
  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(table)}/${recordId}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Airtable getRecord failed [${table}/${recordId}]: ${error}`)
  }

  return res.json()
}

/** Query records using an Airtable filterByFormula string.
 *
 * Example:
 *   queryRecords(TABLES.DEMANDES, `{statut} = "Nouveau"`)
 */
export async function queryRecords(
  table: string,
  filterFormula: string,
  maxRecords = 100
): Promise<Array<{ id: string; fields: Record<string, unknown> }>> {
  const params = new URLSearchParams({
    filterByFormula: filterFormula,
    maxRecords: String(maxRecords),
  })

  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(table)}?${params}`,
    { headers: getHeaders() }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Airtable queryRecords failed [${table}]: ${error}`)
  }

  const data = await res.json()
  return data.records ?? []
}

// ── Domain-specific helpers ───────────────────

/** Create a new lead (Demande) and return its Airtable record ID. */
export async function createDemande(
  fields: Record<string, unknown>
): Promise<string> {
  const record = await createRecord(TABLES.DEMANDES, {
    ...fields,
    statut: 'Nouveau',
    score_completude: 100,
    created_at: new Date().toISOString(),
  })
  return record.id
}

/** Update the statut field of a Demande. */
export async function updateDemandeStatus(
  recordId: string,
  statut: string
): Promise<void> {
  await updateRecord(TABLES.DEMANDES, recordId, { statut })
}

/** Create a Devis record linked to a Demande. */
export async function createDevis(
  demandeId: string,
  fields: Record<string, unknown>
): Promise<string> {
  const record = await createRecord(TABLES.DEVIS, {
    ...fields,
    demande_id: [demandeId], // Airtable linked record format
    statut: 'Généré',
    nb_relances: 0,
  })
  return record.id
}

/** Mark a Devis as sent and set the next follow-up date. */
export async function markDevisSent(
  devisId: string,
  isUrgent: boolean
): Promise<void> {
  const today = new Date()
  const daysUntilRelance = isUrgent ? 2 : 3
  const prochaine = new Date(today)
  prochaine.setDate(today.getDate() + daysUntilRelance)

  await updateRecord(TABLES.DEVIS, devisId, {
    statut: 'Envoyé',
    date_envoi: today.toISOString().split('T')[0],
    prochaine_relance: prochaine.toISOString().split('T')[0],
  })
}
