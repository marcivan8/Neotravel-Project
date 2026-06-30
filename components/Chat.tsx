'use client'

// ─────────────────────────────────────────────
// NeoTravel — Chat Widget
// Core chat UI matching the prototype design.
// Used inside ChatModal.
// ─────────────────────────────────────────────

import { useChat } from 'ai/react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'
import type { DevisData } from './DevisCard'

const WELCOME = 'Bonjour ! Je suis l\'assistant NeoTravel 🚌 Décrivez-moi votre voyage de groupe — départ, destination, date et nombre de passagers — et je vous prépare un devis instantané.'

const SUGGESTIONS = [
  'Paris → Lyon, 45 passagers, le 12/07',
  'Voyage scolaire, 60 élèves, départ samedi',
  'Groupe de 90 personnes',
]

interface Props {
  seedMessage?: string
}

export default function Chat({ seedMessage }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const seededRef = useRef(false)
  const [acceptedDevis, setAcceptedDevis] = useState<string | null>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    reload,
    setMessages,
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: 'welcome', role: 'assistant', content: WELCOME },
    ],
  })

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('neo_chat_messages')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          seededRef.current = true // Avoid re-triggering seed
        }
      } catch (err) {
        console.error('Failed to parse saved chat messages:', err)
      }
    }
  }, [setMessages])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('neo_chat_messages', JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Seed message auto-submit
  useEffect(() => {
    if (seedMessage && !seededRef.current) {
      seededRef.current = true
      setTimeout(() => {
        setInput(seedMessage)
        setTimeout(() => {
          const form = document.getElementById('nt-chat-form') as HTMLFormElement | null
          form?.requestSubmit()
        }, 100)
      }, 600)
    }
  }, [seedMessage, setInput])

  const handleReset = () => {
    seededRef.current = false
    setAcceptedDevis(null)
    localStorage.removeItem('neo_chat_messages')
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME }])
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    setTimeout(() => {
      const form = document.getElementById('nt-chat-form') as HTMLFormElement | null
      form?.requestSubmit()
    }, 50)
  }

  const handleDevisAccept = (devis: DevisData) => {
    setAcceptedDevis(devis.ref)
    setMessages(prev => [
      ...prev,
      {
        id: `accept-${Date.now()}`,
        role: 'user',
        content: 'Accepter le devis',
      },
    ])
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `accept-resp-${Date.now()}`,
          role: 'assistant',
          content: `Devis ${devis.ref} accepté ✅ Je le transmets à un agent de réservation : il mobilise un autocariste partenaire et vous recontacte pour finaliser. Vous recevrez la confirmation par email. Merci de votre confiance ! 🚌`,
        },
      ])
    }, 400)
  }

  const handleDevisModify = () => {
    setMessages(prev => [
      ...prev,
      {
        id: `modify-${Date.now()}`,
        role: 'assistant',
        content: 'Bien sûr ! Que souhaitez-vous ajuster — la date, le nombre de passagers, ou une option (guide, nuit chauffeur, aller-retour) ?',
      },
    ])
  }

  const handleDevisConseiller = () => {
    setMessages(prev => [
      ...prev,
      {
        id: `conseiller-${Date.now()}`,
        role: 'assistant',
        content: 'Je vous mets en relation avec un conseiller NeoTravel qui validera les détails avec vous. Votre demande va être traitée par un conseiller humain — il vous recontacte très vite.',
      },
    ])
  }

  // Wrap handleInputChange for textarea
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 480,
      background: '#ffffff',
      border: '1px solid rgba(46,58,31,0.1)',
      borderRadius: 24,
      boxShadow: '0 34px 70px -30px rgba(46,58,31,0.4)',
      overflow: 'hidden',
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      color: '#1b1f15',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '14px 16px',
        background: '#2e3a1f',
        color: '#f3f2ec',
        flexShrink: 0,
      }}>
        <Image src="/logo-assistant-icon.svg" alt="Assistant NeoTravel" width={38} height={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Assistant NeoTravel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c2cbb4' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7ed957', display: 'inline-block' }} />
            En ligne · répond en quelques secondes
          </div>
        </div>
        <button
          onClick={handleReset}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: '#f3f2ec',
            background: 'transparent',
            border: '1px solid rgba(243,242,236,0.25)',
            padding: '6px 10px',
            borderRadius: 9,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ↺ Réinitialiser
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        background: '#f7f6f0',
      }}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onDevisAccept={handleDevisAccept}
            onDevisModify={handleDevisModify}
            onDevisConseiller={handleDevisConseiller}
          />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div style={{
            fontSize: 13,
            color: '#b4471f',
            background: '#fbeae3',
            border: '1px solid #f0c9b8',
            padding: '8px 11px',
            borderRadius: 10,
          }}>
            Une erreur est survenue, réessayez.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ display: 'contents' }}>
        <ChatInput
          input={input}
          isLoading={isLoading}
          suggestions={messages.length <= 1 ? SUGGESTIONS : []}
          onInputChange={handleTextareaChange}
          onSubmit={handleSubmit}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>
    </div>
  )
}
