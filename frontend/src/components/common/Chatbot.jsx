import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { chatbotService } from '../../services/chatbotService'

const SESSION_KEY = 'chatbot_session'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hi! I am PayVault Assistant. Ask me about your loans, EMIs or credit score.',
  id: 'welcome',
}

const QUICK_PROMPTS = [
  'Show my active loans',
  'When is my next EMI due?',
  'How can I improve my credit score?',
]

const getFallbackResponse = (message) => {
  const msg = message.toLowerCase()
  if (msg.includes('loan'))
    return 'You can check your loans at My Loans section. Navigate to dashboard → My Loans.'
  if (msg.includes('emi') || msg.includes('payment'))
    return 'To pay EMI, go to Pay EMI section from the sidebar.'
  if (msg.includes('credit') || msg.includes('score'))
    return 'Check your credit score at Credit Score section.'
  return 'I can help with loans, EMI payments, and credit score. What would you like to know?'
}

function AssistantMark({ className = '' }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gold-gradient ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%]">
        <path
          d="M12 2.5 19.5 6v6.2c0 4.2-3 7.5-7.5 9.3-4.5-1.8-7.5-5.1-7.5-9.3V6L12 2.5Z"
          stroke="#0a0a0a"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 8.2v7.4M8.6 11.9h6.8"
          stroke="#0a0a0a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

const Chatbot = forwardRef(function Chatbot(_, ref) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY))
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }))

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus()
    }
  }, [isOpen, isLoading])

  const send = async (raw) => {
    const text = (raw ?? inputText).trim()
    if (!text || isLoading) return

    const userMessage = {
      role: 'user',
      content: text,
      id: `user-${Date.now()}`,
    }

    setInputText('')
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const { data } = await chatbotService.chat({ message: text, sessionId })
      if (data.sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem(SESSION_KEY, data.sessionId)
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          id: `assistant-${Date.now()}`,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: getFallbackResponse(text),
          id: `fallback-${Date.now()}`,
          offline: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const showQuickPrompts = messages.length === 1 && !isLoading

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient shadow-cred-gold-strong transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
      >
        <span className="absolute inset-0 rounded-2xl bg-cred-gold/40 opacity-0 transition group-hover:animate-ping group-hover:opacity-100" />
        {isOpen ? (
          <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="#0a0a0a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <AssistantMark className="relative h-9 w-9 bg-transparent" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[540px] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-cred-border bg-cred-card shadow-cred-elevated sm:right-6">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-cred-border bg-cred-elevated/60 px-5 py-4 backdrop-blur">
            <AssistantMark className="h-9 w-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">PayVault Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cred-green" />
                <p className="text-[11px] tracking-wide text-cred-text-muted">
                  Online · secured
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded-lg p-1.5 text-cred-text-muted transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Transcript */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-cred-black px-4 py-4">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-br-md bg-gold-gradient px-4 py-2.5">
                    <p className="text-sm font-medium leading-relaxed text-black">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <AssistantMark className="mt-0.5 h-7 w-7 shrink-0" />
                  <div className="max-w-[82%]">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-cred-text-primary">
                      {msg.content}
                    </p>
                    {msg.offline && (
                      <p className="mt-1.5 text-[11px] text-cred-text-muted">
                        Offline answer — assistant service unreachable
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <AssistantMark className="mt-0.5 h-7 w-7 shrink-0" />
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cred-gold [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cred-gold [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cred-gold" />
                  <span className="ml-1.5 text-xs text-cred-text-muted">Thinking…</span>
                </div>
              </div>
            )}

            {showQuickPrompts && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="rounded-full border border-cred-border bg-cred-elevated px-3 py-1.5 text-xs text-cred-text-secondary transition hover:border-cred-gold/50 hover:text-cred-gold"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-cred-border bg-cred-dark p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-cred-border bg-cred-elevated p-2 transition focus-within:border-cred-gold/60 focus-within:ring-2 focus-within:ring-cred-gold/15">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about loans, EMIs, credit score…"
                className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-cred-text-primary placeholder:text-cred-text-muted outline-none"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={isLoading || !inputText.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-black transition hover:shadow-cred-gold disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path
                    d="M4.5 12h13m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-cred-text-muted">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      )}
    </>
  )
})

export default Chatbot
