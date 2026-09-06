import { useEffect, useRef, useState } from 'react'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { useChat } from '../../hooks/useChat'
import { ChatBubble, TypingIndicator } from '../ui/ChatBubble'

const SUGGESTED_QUESTIONS = [
  'Aşk hayatım hakkında ne söyleyebilirsin?',
  'Kariyer değişikliği yapmalı mıyım?',
  'Yakın gelecekte ne bekliyor beni?',
  'Güçlü ve zayıf yönlerim neler?',
]

export function StepChat() {
  const { setStep } = useSessionsStore()
  const session = useActiveSession()
  const { chatHistory, sendMessage, isLoading, error } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  if (!session?.result) return null
  const { result, personalInfo } = session

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100dvh - 200px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl"
        style={{ background: 'rgba(17,13,9,0.8)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(124,77,138,0.1))', border: '1px solid var(--border-gold)' }}>
          🔮
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--cream)' }}>El Falı Danışmanı</p>
          <p className="text-xs" style={{ color: 'var(--gold)', opacity: 0.7 }}>
            {personalInfo.firstName} için analiz hazır
          </p>
        </div>
        <button onClick={() => setStep('result')} className="text-xs px-3 py-1.5 rounded-lg transition"
          style={{ color: 'var(--cream-dim)', border: '1px solid var(--border)', background: 'transparent' }}>
          ← Geri
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {/* Welcome message */}
        <div className="flex justify-start animate-fade-in">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg, var(--bg-card2), var(--bg-card))', border: '1px solid var(--border-gold)' }}>
            🔮
          </div>
          <div className="chat-bubble-ai">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--cream)' }}>
              Merhaba {personalInfo.firstName} ✨ El okuman tamamlandı.{' '}
              <span style={{ color: 'var(--cream-dim)', fontSize: 13 }}>
                {result.summary.substring(0, 100)}...
              </span>
              <br /><br />
              Merak ettiklerinizi sormaktan çekinmeyin. Sizi dinliyorum 🌙
            </p>
          </div>
        </div>

        {chatHistory.length === 0 && (
          <div className="px-2 space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.5 }}>Önerilen sorular:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="text-xs px-3 py-2 rounded-xl transition"
                  style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', color: 'var(--cream-dim)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
        {isLoading && <TypingIndicator />}
        {error && (
          <div className="text-sm text-center px-4 py-2 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 pt-3 safe-bottom"
        style={{ background: 'linear-gradient(to top, var(--bg-deep) 80%, transparent)' }}>
        <div className="flex items-end gap-3 p-3 rounded-2xl"
          style={{ background: 'rgba(17,13,9,0.95)', border: '1px solid var(--border-gold)', backdropFilter: 'blur(12px)' }}>
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
            style={{ color: 'var(--cream)', maxHeight: '8em', minHeight: '1.5em', fontFamily: "'Inter', sans-serif" }}
            placeholder="Bir soru sorun... (Enter ile gönderin)"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition active:scale-95"
            style={{
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, #8a5c2a, #c9a96e)' : 'rgba(201,169,110,0.1)',
              color: input.trim() && !isLoading ? '#0a0603' : 'var(--cream-dim)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
