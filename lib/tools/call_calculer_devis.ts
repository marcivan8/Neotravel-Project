import { tool } from 'ai'
import { z } from 'zod'
import { calculer_devis_stub } from '@/lib/pricing'

export const call_calculer_devis = tool({
  description:
    'Calculate the exact quote price using the deterministic pricing engine. ' +
    'ALWAYS call this tool to get a price — never calculate or estimate a price yourself. ' +
    'Requires distance_km which you should estimate from the origin and destination cities if not provided.',
  parameters: z.object({
    demande_id: z.string().describe('The Airtable record ID of the lead'),
    nb_passagers: z.number().int().min(1).describe('Number of passengers'),
    date_depart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Departure date YYYY-MM-DD'),
    date_demande: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe('Request date YYYY-MM-DD (today)'),
    distance_km: z
      .number()
      .positive()
      .describe('Estimated one-way distance in km between origin and destination'),
    type_vehicule: z
      .enum(['Standard', 'Grand tourisme'])
      .default('Standard'),
    options: z.array(z.enum(['Guide', 'Nuit chauffeur', 'Péages'])).default([]),
  }),
  execute: async (params) => {
    try {
      // ── Validation guards (same rules as P5's function) ──
      if (params.nb_passagers < 1) {
        return { success: false, error: 'Nombre de passagers invalide (minimum 1)' }
      }
      if (params.nb_passagers > 85) {
        return {
          success: false,
          error: 'Capacité maximale dépassée (85 passagers). Escalader vers un conseiller.',
          escalate: true,
        }
      }

      const depart = new Date(params.date_depart)
      const demande = new Date(params.date_demande)
      if (depart < demande) {
        return {
          success: false,
          error: 'La date de départ est antérieure à la date de demande. Vérifier avec le prospect.',
        }
      }

      // ── Call pricing engine ──
      const result = calculer_devis_stub({
        nb_passagers:   params.nb_passagers,
        date_depart:    params.date_depart,
        date_demande:   params.date_demande,
        distance_km:    params.distance_km,
        type_vehicule:  params.type_vehicule,
        options:        params.options,
      })

      console.log(
        `[call_calculer_devis] demande ${params.demande_id} → ${result.prix_ttc} € TTC`
      )

      return { success: true, demande_id: params.demande_id, devis: result }
    } catch (err) {
      console.error('[call_calculer_devis] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
