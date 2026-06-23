import { tool } from 'ai'
import { z } from 'zod'
import { createDemande } from '@/lib/airtable'

export const save_lead = tool({
  description:
    'Save a new lead to the CRM (Airtable Demandes table) once all required fields are collected. ' +
    'Returns a demande_id to use in subsequent tool calls.',
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

      const demandeId = await createDemande({
        prospect_nom:   params.prospect_nom,
        prospect_email: params.prospect_email,
        prospect_tel:   params.prospect_tel ?? '',
        origine:        params.origine,
        destination:    params.destination,
        date_depart:    params.date_depart,
        date_demande,
        nb_passagers:   params.nb_passagers,
        type_vehicule:  params.type_vehicule,
        options:        params.options,
        urgence:        params.urgence,
      })

      console.log(`[save_lead] Created demande ${demandeId} for ${params.prospect_email}`)
      return { success: true, demande_id: demandeId, date_demande }
    } catch (err) {
      console.error('[save_lead] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
