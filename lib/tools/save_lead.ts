import { tool } from 'ai'
import { z } from 'zod'
import { createLead, createOpportunite } from '@/lib/airtable'

export const save_lead = tool({
  description:
    'Save a new lead to the CRM (Airtable) once all required fields are collected. ' +
    'Creates a Lead record (contact info) and an initial Opportunite record (journey details). ' +
    'Returns a demande_id (= Lead record ID) and opportunite_id to use in subsequent tool calls.',
  parameters: z.object({
    prospect_nom: z.string().describe('Full name or organisation name of the prospect'),
    prospect_email: z.string().email().describe('Email address to send the quote to'),
    prospect_tel: z.string().optional().describe('Phone number (optional)'),
    origine: z.string().describe('Departure city or address'),
    destination: z.string().describe('Arrival city or address'),
    date_depart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .describe('Departure date in YYYY-MM-DD format'),
    nb_passagers: z
      .number()
      .int()
      .min(1)
      .max(85)
      .describe('Number of passengers (1–85)'),
    type_vehicule: z
      .enum(['Standard', 'Grand tourisme'])
      .default('Standard')
      .describe('Vehicle type'),
    options: z
      .array(z.enum(['Guide', 'Nuit chauffeur', 'Péages']))
      .default([])
      .describe('Optional services requested by the prospect'),
    urgence: z
      .boolean()
      .default(false)
      .describe('True if departure is within 7 days of the request'),
  }),
  execute: async (params) => {
    try {
      const date_demande = new Date().toISOString().split('T')[0]

      // ── 1. Create Lead (contact info) ────────────────────────────────
      const leadId = await createLead({
        nom:       params.prospect_nom,
        email:     params.prospect_email,
        telephone: params.prospect_tel,
      })

      // ── 2. Create initial Opportunite (journey details, no price yet) ─
      // Distance and price are unknown until call_calculer_devis runs.
      // The Opportunite record will be updated by generate_pdf once pricing
      // is available (generate_pdf calls createDevis which creates a new
      // Opportunite — if needed, delete this stub one later).
      let opportuniteId: string | null = null
      try {
        opportuniteId = await createOpportunite(leadId, {
          nombre_passagers: params.nb_passagers,
          distance_km:      0,   // placeholder — updated after calculer_devis
          prix_total:       0,   // placeholder — updated after calculer_devis
          urgence:          params.urgence ? 'Urgente' : 'Normale',
          // Journey details — stored once columns are created in Airtable
          origine:          params.origine,
          destination:      params.destination,
          date_depart:      params.date_depart,
          aller_retour:     false,
          type_vehicule:    params.type_vehicule,
        })
      } catch (oppErr) {
        // Non-fatal: log and continue. The quote pipeline can still proceed
        // but journey details won't appear in the Opportunites table yet.
        console.warn('[save_lead] Could not create Opportunite:', oppErr)
      }

      console.log(
        `[save_lead] Lead ${leadId} + Opportunite ${opportuniteId ?? 'n/a'} ` +
        `for ${params.prospect_email} (${params.origine} → ${params.destination})`
      )

      return {
        success:        true,
        demande_id:     leadId,      // kept for backward-compat with downstream tools
        opportunite_id: opportuniteId,
        date_demande,
        trajet:         `${params.origine} → ${params.destination}`,
      }
    } catch (err) {
      console.error('[save_lead] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
