import { useEffect, useRef, useState } from 'react'
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { chatbotService } from '../../services/chatbotService'

const SESSION_KEY = 'payvault_chat_session'

export default function ChatbotModal({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! How can I help?" },
  ])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY))
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, sending])

  if (!open) return null

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)

    try {
      const { data } = await chatbotService.chat({ message: text, sessionId })
      if (data.sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem(SESSION_KEY, data.sessionId)
      }
      setMessages((prev) => [...prev, { role: 'bot', text: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I couldn't process that. Please try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close chat overlay"
      />
      <div className="relative z-10 flex h-[520px] w-full max-w-[384px] flex-col overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-elevated">
        <div className="flex items-center justify-between bg-gold-gradient px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cred-green/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cred-green" />
            </span>
            <p className="font-bold text-black">PayVault Assistant</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-black/70 transition hover:bg-black/10 hover:text-black"
            aria-label="Close chat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-cred-black px-4 py-4">
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-gold-gradient font-medium text-black'
                    : 'rounded-2xl rounded-bl-md border border-cred-border bg-cred-elevated text-cred-text-primary'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-cred-border bg-cred-elevated px-3.5 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-cred-gold [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-cred-gold [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-cred-gold" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-cred-border bg-cred-dark p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-cred-border bg-cred-elevated px-4 py-2 text-sm text-cred-text-primary placeholder:text-cred-text-muted outline-none transition focus:border-cred-gold/60 focus:ring-2 focus:ring-cred-gold/20"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-black transition hover:shadow-cred-gold disabled:opacity-40"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
