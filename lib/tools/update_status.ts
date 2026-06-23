import { tool } from 'ai'
import { z } from 'zod'
import { updateDemandeStatus } from '@/lib/airtable'

export const update_status = tool({
  description:
    'Update the pipeline status of a lead in Airtable. ' +
    'Call this after every meaningful state change (quote sent, accepted, refused, incomplete, etc.).',
  parameters: z.object({
    demande_id: z.string().describe('The Airtable record ID returned by save_lead'),
    statut: z
      .enum([
        'Nouveau',
        'Incomplet',
        'Qualifié',
        'Devis envoyé',
        'Relance 1',
        'Relance 2',
        'Accepté',
        'Refusé',
        'Cas complexe',
        'Clôturé',
      ])
      .describe('The new status to set'),
  }),
  execute: async ({ demande_id, statut }) => {
    try {
      await updateDemandeStatus(demande_id, statut)
      console.log(`[update_status] demande ${demande_id} → ${statut}`)
      return { success: true, demande_id, statut }
    } catch (err) {
      console.error('[update_status] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
