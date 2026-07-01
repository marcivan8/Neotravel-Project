'use client'

// ─────────────────────────────────────────────
// NeoTravel — Chat Input Bar
// Textarea + send button matching the prototype.
// ─────────────────────────────────────────────

import { useRef, useEffect, type FormEvent, type ChangeEvent, type KeyboardEvent } from 'react'

interface Props {
  input: string
  isLoading: boolean
  suggestions?: string[]
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onSuggestionClick?: (text: string) => void
}

export default function ChatInput({
  input,
  isLoading,
  suggestions = [],
  onInputChange,
  onSubmit,
  onSuggestionClick,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div style={{
      borderTop: '1px solid #eceadf',
      padding: '11px 12px 13px',
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      background: '#fff',
      flexShrink: 0,
    }}>
      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggestionClick?.(s)}
              style={{
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2e3a1f',
                background: '#f1f0e7',
                border: '1px solid rgba(46,58,31,0.16)',
                padding: '6px 11px',
                borderRadius: 999,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <form id="nt-chat-form" ref={formRef} onSubmit={onSubmit} style={{ display: 'flex', gap: 9, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder="Décrivez votre voyage… (ex. Paris → Lyon, 45 passagers, le 12/07)"
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #e2e1d6',
            borderRadius: 13,
            padding: '12px 14px',
            fontFamily: 'inherit',
            fontSize: 15,
            lineHeight: 1.4,
            maxHeight: 120,
            outline: 'none',
            background: isLoading ? '#f9f9f6' : '#fff',
            color: '#1b1f15',
            overflow: 'hidden',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Envoyer"
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 13,
            border: 'none',
            background: input.trim() && !isLoading ? 'var(--nt-lime)' : '#e0e0d6',
            color: input.trim() && !isLoading ? 'var(--nt-lime-fg)' : '#8a8f7d',
            fontSize: 20,
            fontWeight: 800,
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          ↑
        </button>
      </form>
    </div>
  )
}
