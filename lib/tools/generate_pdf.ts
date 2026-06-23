import { tool } from 'ai'
import { z } from 'zod'
import { createDevis } from '@/lib/airtable'

// ─────────────────────────────────────────────
// STUB — waiting for P5's generate_pdf()
// ─────────────────────────────────────────────
// On J5, replace the stub below with:
//   import { generateQuotePDF } from '@/lib/pdf/generate_pdf'
// ─────────────────────────────────────────────

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
      // ── STUB: replace with real PDF generation on J5 ──
      // const pdfBuffer = await generateQuotePDF(params)
      // const pdf_url = await uploadToStorage(pdfBuffer, `devis-${params.demande_id}.pdf`)

      const pdf_url = `https://placeholder.neotravel.fr/devis/${params.demande_id}.pdf`
      const lignes_json = JSON.stringify(params.devis.lignes)

      const devisId = await createDevis(params.demande_id, {
        prix_ht:    params.devis.prix_ht,
        tva:        params.devis.tva,
        prix_ttc:   params.devis.prix_ttc,
        lignes_json,
        pdf_url,
        statut:     'Généré',
        nb_relances: 0,
      })

      console.log(`[generate_pdf] Created devis ${devisId}, pdf_url: ${pdf_url}`)
      return { success: true, devis_id: devisId, pdf_url }
    } catch (err) {
      console.error('[generate_pdf] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
