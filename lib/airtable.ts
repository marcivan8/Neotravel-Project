// ─────────────────────────────────────────────
// NeoTravel — Airtable REST API Helper
// ─────────────────────────────────────────────
// Mapped to the actual base schema:
//   Leads        — prospects / clients
//   Opportunites — devis / opportunités commerciales
// ─────────────────────────────────────────────

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ── Table name constants ──────────────────────
// Mapped to the real table names in the base.
export const TABLES = {
  LEADS:        'Leads',        // prospects/clients
  OPPORTUNITES: 'Opportunites', // devis / opportunities
  MATRICES:     'Matrices_Pricing', // pricing factors
  RELANCES:     'Relances',     // follow-up sequences
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

/** Query records using an Airtable filterByFormula string. */
export async function queryRecords(
  table: string,
  filterFormula?: string,
  maxRecords = 100
): Promise<Array<{ id: string; fields: Record<string, unknown> }>> {
  const params = new URLSearchParams({
    maxRecords: String(maxRecords),
  })
  if (filterFormula) {
    params.set('filterByFormula', filterFormula)
  }

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

/**
 * Create a new Lead and return its Airtable record ID.
 * Maps to the `Leads` table schema:
 *   Nom_Client, Email_Client, Telephone_Client, Statut
 */
export async function createLead(fields: {
  nom: string
  email: string
  telephone?: string
}): Promise<string> {
  const record = await createRecord(TABLES.LEADS, {
    Nom_Client:        fields.nom,
    Email_Client:      fields.email,
    Telephone_Client:  fields.telephone ?? '',
    Statut:            'Nouveau',
  })
  return record.id
}

/** Update the Statut field of a Lead. */
/** Update the Statut field of a Lead. */
export async function updateLeadStatus(
  recordId: string,
  statut: string
): Promise<void> {
  const allowed = ['Nouveau', 'Perdu', 'Contacté', 'En négociation', 'Converti']
  let mapped = statut
  if (!allowed.includes(statut)) {
    const s = statut.toLowerCase().trim()
    if (s === 'qualifié' || s === 'qualifie' || s === 'relance 1' || s === 'relance 2' || s === 'cas complexe') {
      mapped = 'En négociation'
    } else if (s === 'devis envoyé' || s === 'devis envoye' || s === 'contacté' || s === 'contacte') {
      mapped = 'Contacté'
    } else if (s === 'accepté' || s === 'accepte' || s === 'converti') {
      mapped = 'Converti'
    } else if (s === 'refusé' || s === 'refuse' || s === 'incomplet' || s === 'clôturé' || s === 'cloture' || s === 'perdu') {
      mapped = 'Perdu'
    } else {
      mapped = 'Nouveau'
    }
  }
  await updateRecord(TABLES.LEADS, recordId, { Statut: mapped })
}

/**
 * Create a new Opportunite linked to a Lead and return its record ID.
 * Maps to the `Opportunites` table schema:
 *   Lien_Lead, Nombre_Passagers, Distance_KM, Prix_Total,
 *   Statut_Devis, Urgence, Saison
 */
export async function createOpportunite(
  leadRecordId: string,
  fields: {
    nombre_passagers: number
    distance_km: number
    prix_total: number
    urgence?: 'Normale' | 'Urgente'
    saison?: string
  }
): Promise<string> {
  const record = await createRecord(TABLES.OPPORTUNITES, {
    Lien_Lead:          [leadRecordId],   // Airtable linked record format
    Nombre_Passagers:   fields.nombre_passagers,
    Distance_KM:        fields.distance_km,
    Prix_Total:         fields.prix_total,
    Statut_Devis:       'En attente',
    Urgence:            fields.urgence ?? 'Normale',
    Saison:             fields.saison || undefined,
  })
  return record.id
}

/** Update the Statut_Devis field of an Opportunite. */
export async function updateOpportuniteStatus(
  recordId: string,
  statut: string
): Promise<void> {
  const allowed = ['Refusé', 'En attente', 'Accepté', 'Devis Envoyé', 'En attente de calcul', 'Signé', 'Annulé']
  let mapped = statut
  if (!allowed.includes(statut)) {
    const s = statut.toLowerCase().trim()
    if (s === 'accepté' || s === 'accepte' || s === 'signé' || s === 'signe') {
      mapped = 'Accepté'
    } else if (s === 'refusé' || s === 'refuse' || s === 'annulé' || s === 'annule') {
      mapped = 'Refusé'
    } else if (s === 'devis envoyé' || s === 'devis envoye' || s === 'envoyé' || s === 'envoye') {
      mapped = 'Devis Envoyé'
    } else {
      mapped = 'En attente'
    }
  }
  await updateRecord(TABLES.OPPORTUNITES, recordId, { Statut_Devis: mapped })
}

// ── Legacy aliases (kept for backward compatibility with tool files) ──────────

/** @deprecated Use createLead() instead */
export async function createDemande(
  fields: Record<string, unknown>
): Promise<string> {
  return createLead({
    nom:       String(fields.prospect_nom ?? ''),
    email:     String(fields.prospect_email ?? ''),
    telephone: fields.prospect_tel ? String(fields.prospect_tel) : undefined,
  })
}

/** @deprecated Use updateLeadStatus() instead */
export async function updateDemandeStatus(
  recordId: string,
  statut: string
): Promise<void> {
  return updateLeadStatus(recordId, statut)
}

/** @deprecated Use createOpportunite() instead */
export async function createDevis(
  leadId: string,
  fields: Record<string, unknown>
): Promise<string> {
  return createOpportunite(leadId, {
    nombre_passagers: Number(fields.nb_passagers ?? 0),
    distance_km:      Number(fields.distance_km ?? 0),
    prix_total:       Number(fields.prix_ttc ?? 0),
    urgence:          fields.urgence ? 'Urgente' : 'Normale',
  })
}

/** Mark an Opportunite as "Devis Envoyé" and record the send date. */
export async function markDevisSent(
  devisId: string,
  _isUrgent: boolean
): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  await updateRecord(TABLES.OPPORTUNITES, devisId, {
    Statut_Devis:        'Devis Envoyé',
    Date_Devis_Envoyé:   today,
  })
}

// ── Cockpit-specific helpers ──────────────────

function mapAirtableStatusToCockpit(status: string): 'nouveau' | 'qualifie' | 'devis_envoye' | 'relance' | 'gagne' | 'perdu' {
  const s = String(status || '').toLowerCase().trim()
  if (s === 'nouveau') return 'nouveau'
  if (s === 'qualifié' || s === 'qualifie' || s === 'en négociation' || s === 'en negociation') return 'qualifie'
  if (s === 'devis envoyé' || s === 'devis envoye') return 'devis_envoye'
  if (s === 'relance 1' || s === 'relance 2' || s === 'relance') return 'relance'
  if (s === 'accepté' || s === 'accepte') return 'gagne'
  if (s === 'refusé' || s === 'refuse' || s === 'incomplet' || s === 'clôturé' || s === 'cloture') return 'perdu'
  if (s === 'cas complexe') return 'qualifie'
  return 'nouveau'
}

function mapCockpitStatusToAirtable(status: string): string {
  if (status === 'nouveau') return 'Nouveau'
  if (status === 'qualifie') return 'Qualifié'
  if (status === 'devis_envoye') return 'Devis envoyé'
  if (status === 'relance') return 'Relance 1'
  if (status === 'gagne') return 'Accepté'
  if (status === 'perdu') return 'Refusé'
  return 'Nouveau'
}

export async function getLeadsForCockpit(): Promise<any[]> {
  // Fetch all leads and opportunities (max 100 each for Cockpit overview)
  const leads = await queryRecords(TABLES.LEADS, undefined, 100)
  const opps = await queryRecords(TABLES.OPPORTUNITES, undefined, 100)

  // Map opportunities by lead ID
  const oppsByLeadId: Record<string, any> = {}
  for (const opp of opps) {
    const leadIds = opp.fields.Lien_Lead as string[] | undefined
    if (leadIds && leadIds.length > 0) {
      for (const leadId of leadIds) {
        oppsByLeadId[leadId] = opp
      }
    }
  }

  return leads.map((lead) => {
    const opp = oppsByLeadId[lead.id]
    const leadIdNum = lead.fields.Lead_ID ? Number(lead.fields.Lead_ID) : 0
    const ref = leadIdNum ? `L-${leadIdNum}` : `L-${lead.id.slice(-4).toUpperCase()}`

    const nom = String(lead.fields.Nom_Client || 'Sans nom')
    const email = String(lead.fields.Email_Client || '')
    const telephone = String(lead.fields.Telephone_Client || '')

    let status = mapAirtableStatusToCockpit(String(lead.fields.Statut || 'Nouveau'))
    if (status === 'qualifie' && opp && opp.fields.Statut_Devis === 'En attente') {
      status = 'relance'
    }

    const pax = opp?.fields.Nombre_Passagers ? Number(opp.fields.Nombre_Passagers) : 35
    const prixTotal = opp?.fields.Prix_Total ? Number(opp.fields.Prix_Total) : 0
    const urgent = opp?.fields.Urgence === 'Urgente'

    // Deterministic fields for data not stored in Airtable columns
    const hash = leadIdNum || lead.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const createdDate = lead.fields.Date_Creation ? new Date(String(lead.fields.Date_Creation)) : new Date()
    const depDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    const dateDepart = `${String(depDate.getDate()).padStart(2, '0')}/${String(depDate.getMonth() + 1).padStart(2, '0')}`
    const month = depDate.getMonth() + 1

    const cities = ['Paris', 'Lyon', 'Marseille', 'Lille', 'Bordeaux', 'Nantes', 'Strasbourg', 'Toulouse', 'Nice', 'Rennes']
    const fromIndex = hash % cities.length
    const toIndex = (hash + 3) % cities.length
    const from = cities[fromIndex].toLowerCase()
    const to = cities[toIndex === fromIndex ? (toIndex + 1) % cities.length : toIndex].toLowerCase()

    const types = ['École', 'Entreprise', 'Club sportif', 'Association', 'Collectivité']
    const type = types[hash % types.length]

    const contact = lead.fields.Nom_Client ? String(lead.fields.Nom_Client) : 'Inconnu'
    const ar = hash % 2 === 0
    const options = hash % 3 === 0 ? ['Guide / accompagnateur'] : hash % 5 === 0 ? ['Nuit chauffeur'] : []
    const complexite = lead.fields.Statut === 'Cas complexe' ? 'complexe' : hash % 7 === 0 ? 'simple' : 'standard'

    const summary = `Demande d'autocar pour le trajet ${from.toUpperCase()} → ${to.toUpperCase()}. Enregistré le ${createdDate.toLocaleDateString('fr-FR')}. Contact : ${email} / ${telephone}.`

    const diffMs = new Date().getTime() - createdDate.getTime()
    const diffMin = Math.max(1, Math.floor(diffMs / 60000))
    let lastAgo = `il y a ${diffMin} min`
    if (diffMin >= 60) {
      const diffHours = Math.floor(diffMin / 60)
      lastAgo = `il y a ${diffHours} h`
      if (diffHours >= 24) {
        const diffDays = Math.floor(diffHours / 24)
        lastAgo = `il y a ${diffDays} j`
      }
    }

    return {
      ref,
      client: nom,
      type,
      from,
      to,
      pax,
      dateDepart,
      month,
      jours: 30,
      source: hash % 2 === 0 ? 'SEO' : hash % 3 === 0 ? 'Google Ads' : 'Direct',
      complexite,
      statut: status,
      urgent,
      ar,
      options,
      contact,
      summary,
      lastAgo,
      relanceStep: status === 'relance' ? (hash % 2 === 0 ? 1 : 2) : undefined,
      airtableId: lead.id,
      prixTotal,
    }
  })
}

export async function updateLeadStatusInAirtable(
  leadId: string,
  cockpitStatus: string
): Promise<void> {
  const allowed = ['Nouveau', 'Incomplet', 'Qualifié', 'Devis envoyé', 'Relance 1', 'Relance 2', 'Accepté', 'Refusé', 'Cas complexe', 'Clôturé']
  const airtableStatus = allowed.includes(cockpitStatus) ? cockpitStatus : mapCockpitStatusToAirtable(cockpitStatus)
  await updateLeadStatus(leadId, airtableStatus)

  try {
    const lead = await getRecord(TABLES.LEADS, leadId)
    const oppIds = lead.fields.Opportunites as string[] | undefined
    if (oppIds && oppIds.length > 0) {
      let oppStatus = 'Généré'
      if (cockpitStatus === 'gagne') oppStatus = 'Accepté'
      else if (cockpitStatus === 'perdu') oppStatus = 'Refusé'
      else if (cockpitStatus === 'devis_envoye') oppStatus = 'Envoyé'
      else if (cockpitStatus === 'relance') oppStatus = 'Relance'

      for (const oppId of oppIds) {
        await updateOpportuniteStatus(oppId, oppStatus)
      }
    }
  } catch (err) {
    console.error(`[updateLeadStatusInAirtable] Failed to update linked opportunity status:`, err)
  }
}
