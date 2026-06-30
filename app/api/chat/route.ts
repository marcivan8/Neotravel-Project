import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { SYSTEM_PROMPT } from '@/lib/system_prompt'
import { tools }         from '@/lib/tools'
import { createLead, createDevis } from '@/lib/airtable'
import * as fs from 'fs/promises'
import * as path from 'path'
import { parseTravelRequest } from '@/lib/fallback_parser'
import { calculer_devis_stub } from '@/lib/pricing'

export const runtime     = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages)) {
      return new Response('Invalid request: messages must be an array', { status: 400 })
    }

    const coreMessages = convertToCoreMessages(messages)

    // ── Priority 1: OpenAI (if OPENAI_API_KEY is set and valid) ──────────
    const openaiKey = process.env.OPENAI_API_KEY ?? ''
    const openaiValid = openaiKey.length > 20 && openaiKey !== 'sk-...' && openaiKey.startsWith('sk-')

    if (openaiValid) {
      const result = await streamText({
        model: openai('gpt-4o'),
        system: SYSTEM_PROMPT,
        messages: coreMessages,
        tools,
        maxSteps: 8,
        temperature: 0.2,
      })
      return result.toDataStreamResponse()
    }

    // ── Priority 2: Google Gemini (if GOOGLE_GENERATIVE_AI_API_KEY is set) ─
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || ''
    const geminiValid = geminiKey.trim() !== '' && geminiKey !== 'your-gemini-key-here'

    if (geminiValid) {
      const result = await streamText({
        // @ts-ignore - @ai-sdk/google@1.x needed; run `npm install` after updating package.json
        model: google('gemini-1.5-flash'),
        system: SYSTEM_PROMPT,
        messages: coreMessages,
        tools,
        maxSteps: 8,
        temperature: 0.2,
        onStepFinish({ stepType, toolCalls, finishReason, usage }) {
          if (stepType === 'tool-result') {
            console.log('[agent step]', {
              tools: toolCalls?.map(tc => tc.toolName),
              finishReason,
              tokens: usage,
            })
          }
        },
      })
      return result.toDataStreamResponse()
    }

    // ── Priority 3: Local mock fallback (no LLM key configured) ──────────
    const lastMsg = messages[messages.length - 1]?.content
    const lastUserMessage = typeof lastMsg === 'string' ? lastMsg : JSON.stringify(lastMsg ?? '')
    const parsed = parseTravelRequest(lastUserMessage)
    const { origine, destination, nb_passagers, date_depart, aller_retour } = parsed

    const distMap: Record<string, number> = {
      'paris-versailles': 25,   'paris-annecy': 560,    'paris-la baule': 450,
      'paris-avignon': 690,     'paris-bruxelles': 310,  'paris-saint-émilion': 580,
      'paris-lyon': 465,        'lyon-annecy': 140,      'paris-nantes': 385,
      'marseille-toulouse': 410,'lyon-marseille': 315,   'paris-marseille': 775,
      'paris-lille': 225,       'bordeaux-toulouse': 245,
    }
    const key1 = `${origine.toLowerCase()}-${destination.toLowerCase()}`
    const key2 = `${destination.toLowerCase()}-${origine.toLowerCase()}`
    let estDist = distMap[key1] || distMap[key2] || 350
    if (aller_retour) {
      estDist *= 2
    }

    const tollMap: Record<string, number> = {
      'paris-versailles': 0,     'paris-annecy': 70,       'paris-la baule': 55,
      'paris-avignon': 95,       'paris-bruxelles': 25,     'paris-saint-émilion': 75,
      'paris-lyon': 65,          'lyon-annecy': 20,         'paris-nantes': 50,
      'marseille-toulouse': 45,  'lyon-marseille': 35,      'paris-marseille': 90,
      'paris-lille': 20,         'bordeaux-toulouse': 25,
    }
    let peages_cost = tollMap[key1] || tollMap[key2] || 0
    if (aller_retour) {
      peages_cost *= 2
    }

    const devisResult = calculer_devis_stub({
      nb_passagers,
      date_depart,
      date_demande: new Date().toISOString().split('T')[0],
      distance_km: estDist,
      type_vehicule: 'Standard',
      options: [],
      peages_cost,
    })
    const { prix_ht, tva, prix_ttc } = devisResult

    // Try to persist to Airtable — non-fatal if credentials are missing
    let leadId = `demo_${Date.now()}`
    let devisId = `devis_${Date.now()}`
    try {
      leadId = await createLead({
        nom: 'Prospect Web',
        email: 'prospect-demo@neotravel.fr',
        telephone: '06 00 00 00 00',
      })
      devisId = await createDevis(leadId, {
        nb_passagers,
        distance_km: estDist,
        prix_ttc,
        urgence: false,
      })
      console.log(`[mock] Lead ${leadId} + Devis ${devisId} saved to Airtable.`)
    } catch (airtableErr) {
      console.warn('[mock] Airtable unavailable, using local IDs:', airtableErr)
    }

    // Try to write devis JSON for the /devis/[id] page — non-fatal
    try {
      const devisData = {
        demande_id: leadId,
        prospect_nom: 'Prospect Web',
        prospect_email: 'prospect-demo@neotravel.fr',
        origine, destination, date_depart, nb_passagers,
        distance_km: estDist, urgence: false,
        aller_retour,
        type_vehicule: 'Standard',
        options: [] as string[],
        devis: {
          prix_ht, tva, prix_ttc,
          lignes: [
            { libelle: `Distance ${estDist} km × 2,50 €/km${aller_retour ? ' (aller-retour)' : ''}`, montant: prix_ht },
            { libelle: 'TVA 10%', montant: tva },
          ],
          coefficients: [{ nom: 'Mode Fallback Démo Local', valeur: 1.0 }],
          devise: 'EUR',
        },
      }
      const dirPath = path.join(process.cwd(), 'public', 'devis', 'data')
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(
        path.join(dirPath, `${devisId}.json`),
        JSON.stringify(devisData, null, 2),
        'utf-8'
      )
    } catch (fsErr) {
      console.warn('[mock] Could not write devis file:', fsErr)
    }

    const textResponse = `Bonjour ! J'ai qualifié votre demande de transport.

Voici le devis calculé pour votre voyage de groupe :

\`\`\`devis
{
  "ref": "${devisId}",
  "trajetLabel": "${origine} → ${destination}${aller_retour ? ' (aller-retour)' : ''}",
  "subLabel": "${date_depart.split('-').reverse().join('/')} · ${nb_passagers} passagers · ${aller_retour ? 'Aller-retour' : 'Aller simple'}",
  "rows": [
    { "label": "Transport de base (${estDist} km)", "value": "${(estDist * 2.5).toFixed(2)} € HT" },
    ${peages_cost > 0 ? `{ "label": "Frais de péages d'autoroute", "value": "${peages_cost.toFixed(2)} € HT" },` : ''}
    { "label": "TVA 10%", "value": "${tva.toFixed(2)} €" }
  ],
  "total": "${prix_ttc.toFixed(2)} € TTC",
  "urgent": false
}
\`\`\`

Vous pouvez cliquer sur "Accepter le devis" ci-dessous ou me demander des ajustements.`

    const textChunks = textResponse.match(/.{1,30}/g) ?? [textResponse]

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for (const chunk of textChunks) {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`))
          await new Promise(r => setTimeout(r, 20))
        }
        // AI SDK v4 data stream: step finish (e:) then message finish (d:)
        controller.enqueue(encoder.encode(
          `e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0},"isContinued":false}\n`
        ))
        controller.enqueue(encoder.encode(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        ))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/chat] Error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
