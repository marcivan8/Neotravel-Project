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
    // Journey details (require manual column creation in Airtable Opportunites table)
    origine?: string
    destination?: string
    date_depart?: string       // YYYY-MM-DD
    aller_retour?: boolean
    type_vehicule?: string
  }
): Promise<string> {
  const record = await createRecord(TABLES.OPPORTUNITES, {
    Lien_Lead:          [leadRecordId],
    Nombre_Passagers:   fields.nombre_passagers,
    Distance_KM:        fields.distance_km,
    Prix_Total:         fields.prix_total,
    Statut_Devis:       'En attente',
    Urgence:            fields.urgence ?? 'Normale',
    Saison:             fields.saison || undefined,
  })

  // Write journey details in a separate call — these fields need to be created
  // manually in Airtable (Origine, Destination, Date_Depart, Aller_Retour, Type_Vehicule).
  // This call fails silently until the columns exist.
  if (fields.origine || fields.destination || fields.date_depart) {
    const journeyFields: Record<string, unknown> = {}
    if (fields.origine)     journeyFields['Origine']       = fields.origine
    if (fields.destination) journeyFields['Destination']   = fields.destination
    if (fields.date_depart) journeyFields['Date_Depart']   = fields.date_depart
    if (fields.aller_retour !== undefined) journeyFields['Aller_Retour'] = fields.aller_retour
    if (fields.type_vehicule) journeyFields['Type_Vehicule'] = fields.type_vehicule

    try {
      await updateRecord(TABLES.OPPORTUNITES, record.id, journeyFields)
    } catch (err) {
      // Columns not yet created in Airtable — safe to ignore until Marc adds them
      console.warn('[createOpportunite] Journey fields not saved (columns missing?):', err)
    }
  }

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
  // Fetch leads, opportunites, and relances in parallel
  const [leads, opps, relances] = await Promise.all([
    queryRecords(TABLES.LEADS, undefined, 100),
    queryRecords(TABLES.OPPORTUNITES, undefined, 100),
    queryRecords(TABLES.RELANCES, undefined, 200).catch(() => [] as any[]),
  ])

  // Map opportunities by lead ID
  const oppsByLeadId: Record<string, any> = {}
  for (const opp of opps) {
    const linkedLeads = opp.fields.Lien_Lead as any[] | undefined
    if (linkedLeads && linkedLeads.length > 0) {
      for (const link of linkedLeads) {
        // Airtable REST returns linked records as strings (record IDs)
        const leadId = typeof link === 'string' ? link : (link as any).id
        if (leadId) oppsByLeadId[leadId] = opp
      }
    }
  }

  // Map relances by lead ID (most recent first)
  const relancesByLeadId: Record<string, any[]> = {}
  for (const rel of relances) {
    const linkedLeads = rel.fields.Lead_ID as any[] | undefined
    if (linkedLeads && linkedLeads.length > 0) {
      for (const link of linkedLeads) {
        const leadId = typeof link === 'string' ? link : (link as any).id
        if (!leadId) continue
        if (!relancesByLeadId[leadId]) relancesByLeadId[leadId] = []
        relancesByLeadId[leadId].push(rel)
      }
    }
  }

  return leads.map((lead) => {
    const opp = oppsByLeadId[lead.id]
    const leadIdNum = lead.fields.Lead_ID ? Number(lead.fields.Lead_ID) : 0
    const ref = leadIdNum ? `L-${leadIdNum}` : `L-${lead.id.slice(-4).toUpperCase()}`

    const nom   = String(lead.fields.Nom_Client   || 'Sans nom')
    const email = String(lead.fields.Email_Client  || '')
    const telephone = String(lead.fields.Telephone_Client || '')

    // ── Journey fields from Opportunite (real Airtable data when columns exist) ──
    const origine      = opp?.fields.Origine      ? String(opp.fields.Origine)      : ''
    const destination  = opp?.fields.Destination  ? String(opp.fields.Destination)  : ''
    const from         = origine.toLowerCase()      || '—'
    const to           = destination.toLowerCase()  || '—'

    // Date_Depart: stored as YYYY-MM-DD in Airtable
    let dateDepart = '—'
    let month = new Date().getMonth() + 1
    if (opp?.fields.Date_Depart) {
      const d = new Date(String(opp.fields.Date_Depart))
      if (!isNaN(d.getTime())) {
        dateDepart = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
        month = d.getMonth() + 1
      }
    }

    const ar = opp?.fields.Aller_Retour === true
    const typeVehicule = opp?.fields.Type_Vehicule ? String(opp.fields.Type_Vehicule) : 'Standard'

    // ── Statut mapping ──
    let status = mapAirtableStatusToCockpit(String(lead.fields.Statut || 'Nouveau'))
    const statutDevis = opp?.fields.Statut_Devis
      ? String((opp.fields.Statut_Devis as any)?.name || opp.fields.Statut_Devis)
      : ''
    if (status === 'qualifie' && statutDevis === 'En attente') {
      status = 'relance'
    }
    if (statutDevis === 'Devis Envoyé') status = 'devis_envoye'

    const pax      = opp?.fields.Nombre_Passagers ? Number(opp.fields.Nombre_Passagers) : 0
    const prixTotal = opp?.fields.Prix_Total       ? Number(opp.fields.Prix_Total)       : 0
    const urgent   = String((opp?.fields.Urgence as any)?.name || opp?.fields.Urgence || '') === 'Urgente'

    // ── Relances from Airtable Relances table ──
    const leadRelances = relancesByLeadId[lead.id] || []
    const relanceFaites = leadRelances.filter(
      (r) => String((r.fields.Statut_Relance as any)?.name || r.fields.Statut_Relance || '') === 'Fait'
    ).length
    const relanceStep = status === 'relance' || status === 'devis_envoye'
      ? Math.min(relanceFaites, 2)
      : undefined

    const contact = nom
    const options: string[] = []

    const createdDate = lead.fields.Date_Creation
      ? new Date(String(lead.fields.Date_Creation))
      : new Date()

    // Build summary from real data
    const trajetStr = (origine && destination) ? `${origine} → ${destination}` : 'trajet non renseigné'
    const summary = `${nom} — ${trajetStr}. Enregistré le ${createdDate.toLocaleDateString('fr-FR')}. ${email}${telephone ? ` / ${telephone}` : ''}.`

    const diffMs  = Date.now() - createdDate.getTime()
    const diffMin = Math.max(1, Math.floor(diffMs / 60000))
    let lastAgo = `il y a ${diffMin} min`
    if (diffMin >= 60) {
      const h = Math.floor(diffMin / 60)
      lastAgo = `il y a ${h} h`
      if (h >= 24) lastAgo = `il y a ${Math.floor(h / 24)} j`
    }

    return {
      ref,
      client: nom,
      type: '—',           // not stored in Airtable
      from,
      to,
      pax,
      dateDepart,
      month,
      jours: 1,
      source: '—',         // not stored in Airtable
      complexite: 'standard',
      statut: status,
      urgent,
      ar,
      options,
      contact,
      summary,
      lastAgo,
      relanceStep,
      airtableId: lead.id,
      prixTotal,
      typeVehicule,
      email,
      telephone,
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
