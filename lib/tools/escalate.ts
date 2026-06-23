import { tool } from 'ai'
import { z } from 'zod'
import { updateDemandeStatus } from '@/lib/airtable'

export const escalate_to_human = tool({
  description:
    'Escalate a lead to a human NeoTravel advisor when the case is too complex for automation. ' +
    'Use this for: >85 passengers, international routes, event requests, price disputes, or anything uncertain. ' +
    'Always call this instead of guessing when in doubt.',
  parameters: z.object({
    demande_id: z
      .string()
      .optional()
      .describe('Airtable record ID if the lead was already saved; omit if not yet saved'),
    prospect_nom: z.string().optional(),
    prospect_email: z.string().email().optional(),
    raison: z
      .enum([
        'PASSAGERS_HORS_CAPACITE',
        'TRAJET_HORS_ZONE',
        'DATE_INCOHÉRENTE',
        'DEMANDE_COMPLEXE',
        'LITIGE_PRIX',
        'AUTRE',
      ])
      .describe('The reason for escalation'),
    details: z
      .string()
      .describe('A brief summary of the conversation context for the human advisor'),
  }),
  execute: async (params) => {
    try {
      // Update lead status in Airtable if we have a record
      if (params.demande_id) {
        await updateDemandeStatus(params.demande_id, 'Cas complexe')
      }

      // Send internal alert to NeoTravel team
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    process.env.EMAIL_FROM ?? 'devis@neotravel.fr',
          to:      process.env.INTERNAL_ALERT_EMAIL ?? 'equipe@neotravel.fr',
          subject: `🚨 Cas complexe à traiter — ${params.raison}`,
          html: `
            <h3>Un lead nécessite une reprise manuelle</h3>
            <p><strong>Raison :</strong> ${params.raison}</p>
            ${params.prospect_nom ? `<p><strong>Prospect :</strong> ${params.prospect_nom}</p>` : ''}
            ${params.prospect_email ? `<p><strong>Email :</strong> ${params.prospect_email}</p>` : ''}
            ${params.demande_id ? `<p><strong>ID Airtable :</strong> ${params.demande_id}</p>` : ''}
            <p><strong>Contexte :</strong> ${params.details}</p>
          `.trim(),
        }),
      })

      console.log(
        `[escalate_to_human] Escalated demande ${params.demande_id ?? 'N/A'} — ${params.raison}`
      )

      return {
        success: true,
        message:
          'Le dossier a été transmis à un conseiller NeoTravel qui vous contactera dans les plus brefs délais.',
      }
    } catch (err) {
      console.error('[escalate_to_human] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})
