// ─────────────────────────────────────────────
// NeoTravel — Main Chat API Route
// POST /api/chat
// ─────────────────────────────────────────────
// Receives a messages array from the frontend (useChat hook),
// streams back the agent's response with tool calls.
// ─────────────────────────────────────────────

import { streamText } from 'ai'
import { openai }     from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from '@/lib/system_prompt'
import { tools }         from '@/lib/tools'

export const runtime     = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages)) {
      return new Response('Invalid request: messages must be an array', { status: 400 })
    }

    const result = await streamText({
      // @ts-ignore - mismatching provider versions due to AI SDK version requirements
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages,
      tools,

      // Allow the agent to chain multiple tool calls in one response
      // e.g. save_lead → call_calculer_devis → generate_pdf → send_email
      maxSteps: 8,

      // Low temperature for reliable data extraction and tool calling
      temperature: 0.2,

      // Log every tool call for observability during the demo
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

  } catch (err) {
    console.error('[/api/chat] Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Une erreur interne est survenue. Veuillez réessayer.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
