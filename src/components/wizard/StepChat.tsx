import { useEffect, useRef, useState } from 'react'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { useChat } from '../../hooks/useChat'
import { ChatBubble, TypingIndicator } from '../ui/ChatBubble'
import { AnalysisDetailModal } from '../ui/AnalysisDetailModal'

const SUGGESTED_QUESTIONS = [
  'Kariyerimdeki o kırılma dönemi tam olarak ne zaman?',
  'Sol elim ile sağ elim arasındaki en büyük fark ne?',
  'Aşk hayatımda kader çizgim neye işaret ediyor?',
  'Bastırılmış içsel yeteneğim hakkında ne dersin?',
]

export function StepChat() {
  const { setStep } = useSessionsStore()
  const session = useActiveSession()
  const { chatHistory, sendMessage, isLoading, error } = useChat()
  const [input, setInput] = useState('')
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Yeni mesaj geldiğinde veya yüklenirken akıllı kaydırma
  useEffect(() => {
    if (isLoading) {
      // Soru sorulduğunda veya AI yazarken "yazıyor..." göstergesine kaydır
      typingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else if (chatHistory.length > 0) {
      // AI cevabı geldiğinde: Cevabın EN ALTINA değil, İLK SATIRINA (başlangıcına) odaklan!
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [chatHistory.length, isLoading])

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
    <div className="flex flex-col h-full relative" style={{ minHeight: 'calc(100dvh - 200px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 mb-3 rounded-xl sticky top-14 z-30"
        style={{ background: 'rgba(17,13,9,0.95)', border: '1px solid var(--border-gold)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(124,77,138,0.15))', border: '1px solid var(--border-gold)' }}>
            🔮
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--cream)' }}>
              El Falı Danışmanı
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--gold)', opacity: 0.8 }}>
              {personalInfo.firstName} ({personalInfo.age} yaş)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Analizleri Gör Butonu */}
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(138,92,42,0.25))',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold)',
            }}
          >
            <span>📜</span>
            <span>Raporu Gör</span>
          </button>

          <button onClick={() => setStep('result')} className="text-xs px-2.5 py-1.5 rounded-lg transition"
            style={{ color: 'var(--cream-dim)', border: '1px solid var(--border)', background: 'transparent' }}>
            ← Çık
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-6 pr-1 scroll-smooth">
        {/* Welcome message */}
        <div className="flex justify-start animate-fade-in">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg, var(--bg-card2), var(--bg-card))', border: '1px solid var(--border-gold)' }}>
            🔮
          </div>
          <div className="chat-bubble-ai">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--cream)' }}>
              Merhaba {personalInfo.firstName} ✨ El çizgilerini ve paylaştığın bilgileri Cheiro ekolüyle detaylıca inceledim.{' '}
              <span style={{ color: 'var(--cream-dim)', fontSize: 13 }}>
                "{result.headline}"
              </span>
              <br /><br />
              Yukarıdaki <strong>"📜 Raporu Gör"</strong> butonundan tüm analizlerini istediğin an tekrar okuyabilir, buradaki tespitlerle ilgili bana aklına takılan her şeyi sorabilirsin. 🌙
            </p>
          </div>
        </div>

        {chatHistory.length === 0 && (
          <div className="px-2 space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.5 }}>Örnek derin sorular:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="text-xs px-3 py-2 rounded-xl text-left transition"
                  style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', color: 'var(--cream-dim)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mesaj listesi */}
        {chatHistory.map((msg, index) => {
          const isLastMessage = index === chatHistory.length - 1
          return (
            <div
              key={msg.id}
              ref={isLastMessage ? lastMessageRef : undefined}
              className={isLastMessage ? 'scroll-mt-24' : undefined}
            >
              <ChatBubble message={msg} />
            </div>
          )
        })}

        {isLoading && (
          <div ref={typingRef} className="scroll-mt-20">
            <TypingIndicator />
          </div>
        )}

        {error && (
          <div className="text-sm text-center px-4 py-3 rounded-xl space-y-1"
            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p className="font-semibold text-xs">Bağlantı Hatası</p>
            <p className="text-xs opacity-90 font-mono break-all">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 pt-3 safe-bottom"
        style={{ background: 'linear-gradient(to top, var(--bg-deep) 85%, transparent)' }}>
        <div className="flex items-end gap-3 p-3 rounded-2xl"
          style={{ background: 'rgba(17,13,9,0.95)', border: '1px solid var(--border-gold)', backdropFilter: 'blur(12px)' }}>
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed"
            style={{ color: 'var(--cream)', maxHeight: '8em', minHeight: '1.5em', fontFamily: "'Inter', sans-serif" }}
            placeholder="Bir soru sorun... (Örn: 35 yaşımdaki çizgi ne anlama geliyor?)"
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

      {/* Rapor Detay Modal */}
      {showAnalysisModal && (
        <AnalysisDetailModal onClose={() => setShowAnalysisModal(false)} />
      )}
    </div>
  )
}
