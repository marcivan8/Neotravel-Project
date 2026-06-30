'use client'

// ─────────────────────────────────────────────
// NeoTravel — Message Bubble
// Supports 4 message types:
//   1. User bubble (right-aligned)
//   2. Agent bubble (left, with bot icon)
//   3. Devis card (parsed from ```devis blocks)
//   4. Escalation bubble (amber-tinted)
// ─────────────────────────────────────────────

import type { Message } from 'ai'
import Image from 'next/image'
import DevisCard, { type DevisData } from './DevisCard'

interface Props {
  message: Message
  onDevisAccept?: (devis: DevisData) => void
  onDevisModify?: () => void
  onDevisConseiller?: () => void
}

// ── Parse ```devis JSON blocks from agent text ──
function parseDevisBlock(content: string): { devis: DevisData; rest: string } | null {
  const match = content.match(/```devis\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const devis = JSON.parse(match[1].trim()) as DevisData
    const rest = content.replace(match[0], '').trim()
    return { devis, rest }
  } catch {
    return null
  }
}

// ── Detect escalation messages ──
function isEscalationMsg(content: string): boolean {
  return /conseiller humain|cas complexe|escalad|transmis à un conseiller/i.test(content)
}

// ── Tool call labels ──
const TOOL_LABELS: Record<string, string> = {
  save_lead:           '💾 Enregistrement de votre demande…',
  call_calculer_devis: '🧮 Calcul du devis en cours…',
  generate_pdf:        '📄 Génération du PDF…',
  send_email:          '📧 Envoi du devis par email…',
  update_status:       '🔄 Mise à jour du dossier…',
  escalate_to_human:   '🤝 Transfert à un conseiller…',
}

export default function MessageBubble({ message, onDevisAccept, onDevisModify, onDevisConseiller }: Props) {
  const isUser  = message.role === 'user'
  const isAgent = message.role === 'assistant'
  const toolCalls = message.toolInvocations ?? []

  // ── User bubble ──
  if (isUser && message.content) {
    return (
      <div className="nt-message-appear" style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
        <div style={{
          background: '#2e3a1f',
          color: '#f3f2ec',
          padding: '11px 15px',
          borderRadius: '14px 14px 4px 14px',
          fontSize: 15,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          boxShadow: '0 1px 2px rgba(46,58,31,0.18)',
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  // ── Agent bubble ──
  if (isAgent) {
    const parsed = parseDevisBlock(message.content ?? '')
    const escalation = isEscalationMsg(message.content ?? '')

    return (
      <div className="nt-message-appear" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'flex-start', maxWidth: '88%' }}>
        {/* Tool call pills */}
        {toolCalls.map((tc) => (
          <div
            key={tc.toolCallId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#e8f0fb',
              color: '#1a4fa0',
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 20,
              width: 'fit-content',
            }}
          >
            {TOOL_LABELS[tc.toolName] ?? `⚙️ ${tc.toolName}…`}
          </div>
        ))}

        {/* Text content (before/after a devis block) */}
        {message.content && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end' }}>
            {escalation ? (
              // Escalation bubble — amber style
              <span style={{
                width: 27, height: 27, borderRadius: '50%',
                background: '#e8a13a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>🤝</span>
            ) : (
              <Image src="/logo-assistant-icon.svg" alt="" width={27} height={27} style={{ borderRadius: '50%', flexShrink: 0 }} />
            )}

            <div style={{
              background: escalation ? '#fff6e9' : '#ffffff',
              border: escalation ? '1px solid #f0d6a4' : '1px solid #e7e6dd',
              color: escalation ? '#6b4e1f' : '#1b1f15',
              padding: '11px 15px',
              borderRadius: '14px 14px 14px 4px',
              fontSize: 15,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              boxShadow: '0 1px 2px rgba(46,58,31,0.06)',
            }}>
              {escalation && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#a9762a',
                  marginBottom: 5,
                }}>
                  Conseiller NeoTravel
                </div>
              )}
              {parsed ? parsed.rest : message.content}
            </div>
          </div>
        )}

        {/* Devis card */}
        {parsed && (
          <DevisCard
            devis={parsed.devis}
            onAccept={() => onDevisAccept?.(parsed.devis)}
            onModify={() => onDevisModify?.()}
            onConseiller={() => onDevisConseiller?.()}
          />
        )}
      </div>
    )
  }

  return null
}
