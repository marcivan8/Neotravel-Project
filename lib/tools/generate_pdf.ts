import { tool } from 'ai'
import { z } from 'zod'
import { createDevis } from '@/lib/airtable'
import * as fs from 'fs/promises'
import * as path from 'path'

export const generate_pdf = tool({
  description:
    'Generate a PDF quote document from a devis result and save it. ' +
    'Call this after call_calculer_devis succeeds. Returns a pdf_url and devis_id.',
  parameters: z.object({
    demande_id: z.string().describe('The Airtable record ID of the lead'),
    prospect_nom: z.string(),
    prospect_email: z.string().email(),
    origine: z.string(),
    destination: z.string(),
    date_depart: z.string(),
    nb_passagers: z.number().int(),
    distance_km: z.number().describe('Estimated distance in km'),
    urgence: z.boolean().describe('True if departure within 7 days'),
    aller_retour: z.boolean().optional().default(false).describe('True if round trip'),
    type_vehicule: z.string().optional().default('Standard').describe('Standard or Grand tourisme'),
    options: z.array(z.string()).optional().default([]).describe('List of options'),
    devis: z
      .object({
        prix_ht: z.number(),
        tva: z.number(),
        prix_ttc: z.number(),
        lignes: z.array(
          z.object({ libelle: z.string(), montant: z.number() })
        ),
        coefficients: z.array(
          z.object({ nom: z.string(), valeur: z.number() })
        ),
        devise: z.literal('EUR'),
      })
      .describe('The full devis result from call_calculer_devis'),
  }),
  execute: async (params) => {
    try {
      const lignes_json = JSON.stringify(params.devis.lignes)

      const devisId = await createDevis(params.demande_id, {
        prix_ht:      params.devis.prix_ht,
        tva:          params.devis.tva,
        prix_ttc:     params.devis.prix_ttc,
        lignes_json,
        pdf_url:      `http://localhost:3000/devis/placeholder`,
        statut:       'Généré',
        nb_passagers: params.nb_passagers,
        distance_km:  params.distance_km,
        urgence:      params.urgence,
      })

      const pdf_url = `http://localhost:3000/devis/${devisId}`

      // Save parameters locally for dynamic invoice rendering
      const devisData = {
        demande_id: params.demande_id,
        prospect_nom: params.prospect_nom,
        prospect_email: params.prospect_email,
        origine: params.origine,
        destination: params.destination,
        date_depart: params.date_depart,
        nb_passagers: params.nb_passagers,
        distance_km: params.distance_km,
        urgence: params.urgence,
        aller_retour: params.aller_retour ?? false,
        type_vehicule: params.type_vehicule ?? 'Standard',
        options: params.options ?? [],
        devis: params.devis,
      }

      const dirPath = path.join(process.cwd(), 'public', 'devis', 'data')
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(
        path.join(dirPath, `${devisId}.json`),
        JSON.stringify(devisData, null, 2),
        'utf-8'
      )

      console.log(`[generate_pdf] Created devis ${devisId}, pdf_url: ${pdf_url}`)
      return { success: true, devis_id: devisId, pdf_url }
    } catch (err) {
      console.error('[generate_pdf] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
