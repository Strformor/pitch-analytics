'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Who should I sign as a striker?',
  'Which of my players should I sell?',
  'Compare my best forward vs Haaland',
  'Who is the most efficient midfielder available?',
  'What position am I weakest in?',
]

export default function AIChat({ scoutedPlayers }: { scoutedPlayers?: any[] }) {
  const { players: myPlayers } = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'I\'m your AI scout. Ask me who to sign, who to sell, or to compare any players.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          myPlayers,
          scoutedPlayers: scoutedPlayers || [],
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.'
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? 'var(--bg2)' : 'var(--accent)',
          border: open ? '1px solid var(--border-strong)' : 'none',
          color: open ? 'var(--accent)' : '#070707',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open ? 'none' : '0 0 20px var(--accent-glow)',
          transition: 'all 0.2s',
        }}
        title="AI Scout"
      >
        {open ? '✕' : '⚡'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          width: 360,
          maxHeight: 520,
          background: 'var(--bg2)',
          border: '1px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          animation: 'fadeUp 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ color: 'var(--accent)', fontSize: 12 }}>⚡</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text)' }}>
              AI SCOUT
            </span>
            {myPlayers.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'var(--mono)',
                fontSize: 9,
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                padding: '2px 6px',
                letterSpacing: '0.1em',
              }}>
                {myPlayers.length} PLAYERS LOADED
              </span>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 12px',
                  background: m.role === 'user' ? 'var(--accent-dim)' : 'var(--bg3)',
                  border: `1px solid ${m.role === 'user' ? 'var(--border-strong)' : 'var(--border)'}`,
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: m.role === 'user' ? 'var(--accent)' : 'var(--text)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                ANALYSING...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 2 && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    letterSpacing: '0.05em',
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--accent)'
                    ;(e.target as HTMLElement).style.color = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.target as HTMLElement).style.color = 'var(--text-dim)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask the scout..."
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                padding: '10px 14px',
                background: 'var(--accent)',
                color: '#070707',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                opacity: !input.trim() || loading ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
