// ─────────────────────────────────────────────
// NeoTravel — Tool Registry
// ─────────────────────────────────────────────
// All tools are registered here and passed to streamText().
// To add a new tool: create it in this folder, export it here.

import { save_lead }            from './save_lead'
import { update_status }        from './update_status'
import { call_calculer_devis }  from './call_calculer_devis'
import { generate_pdf }         from './generate_pdf'
import { send_email }           from './send_email'
import { escalate_to_human }    from './escalate'

export const tools = {
  save_lead,
  update_status,
  call_calculer_devis,
  generate_pdf,
  send_email,
  escalate_to_human,
}
