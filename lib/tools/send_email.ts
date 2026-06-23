import { tool } from 'ai'
import { z } from 'zod'
import { markDevisSent } from '@/lib/airtable'

export const send_email = tool({
  description:
    'Send the quote PDF to the prospect by email via Resend. ' +
    'Call this after generate_pdf succeeds. Updates the Devis status to "Envoyé".',
  parameters: z.object({
    devis_id: z.string().describe('The Airtable Devis record ID from generate_pdf'),
    demande_id: z.string().describe('The Airtable Demandes record ID'),
    prospect_nom: z.string(),
    prospect_email: z.string().email(),
    pdf_url: z.string().url().describe('The PDF URL returned by generate_pdf'),
    prix_ttc: z.number().describe('Total price TTC to display in the email body'),
    origine: z.string(),
    destination: z.string(),
    date_depart: z.string(),
    urgence: z.boolean().default(false).describe('Affects the follow-up schedule (J+2 vs J+3)'),
  }),
  execute: async (params) => {
    try {
      const emailBody = buildEmailBody(params)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    process.env.EMAIL_FROM ?? 'devis@neotravel.fr',
          to:      params.prospect_email,
          subject: `Votre devis NeoTravel — ${params.origine} → ${params.destination}`,
          html:    emailBody,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Resend API error: ${error}`)
      }

      const { id: email_id } = await res.json()

      // Update Devis status and set next follow-up date
      await markDevisSent(params.devis_id, params.urgence)

      console.log(
        `[send_email] Sent to ${params.prospect_email}, email_id: ${email_id}`
      )

      return { success: true, email_id }
    } catch (err) {
      console.error('[send_email] Error:', err)
      return { success: false, error: String(err) }
    }
  },
})

function buildEmailBody(params: {
  prospect_nom: string
  origine: string
  destination: string
  date_depart: string
  prix_ttc: number
  pdf_url: string
}): string {
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 7)
  const validStr = validUntil.toLocaleDateString('fr-FR')

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #1a1a1a;">
      <h2 style="color: #0f5c3a;">Votre devis NeoTravel</h2>
      <p>Bonjour ${params.prospect_nom},</p>
      <p>
        Suite à votre demande, veuillez trouver ci-dessous votre devis pour le trajet
        <strong>${params.origine} → ${params.destination}</strong> le <strong>${params.date_depart}</strong>.
      </p>
      <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
        <tr style="background:#f0f0f0;">
          <td style="padding:10px;"><strong>Total TTC</strong></td>
          <td style="padding:10px; text-align:right; font-size:1.3em; color:#0f5c3a;">
            <strong>${params.prix_ttc.toFixed(2)} €</strong>
          </td>
        </tr>
      </table>
      <p>
        <a href="${params.pdf_url}"
           style="background:#0f5c3a; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block;">
          📄 Télécharger le devis complet (PDF)
        </a>
      </p>
      <p style="color:#666; font-size:0.9em;">Ce devis est valable jusqu'au ${validStr}.</p>
      <p>
        Pour toute question ou pour confirmer votre réservation, répondez simplement à cet email
        ou rappellez-nous directement.
      </p>
      <p>Cordialement,<br/>L'équipe NeoTravel</p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;"/>
      <p style="color:#aaa; font-size:0.75em;">
        NeoTravel — Votre partenaire transport autocar depuis 2010.<br/>
        Vous recevez cet email car vous avez effectué une demande de devis sur notre site.
      </p>
    </div>
  `.trim()
}
