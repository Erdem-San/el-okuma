import { useState, useRef, useEffect, useId } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { analyzeHoroscope, sendHoroscopeChatMessage } from '../../lib/api'
import {
  calculateLifePathNumber,
  calculateZodiacSign,
  calculateNameDestinyNumber,
} from '../../lib/numerology'
import { MysticCard } from '../../components/ui/MysticCard'
import { MysticButton } from '../../components/ui/MysticButton'
import { LoadingCrystal } from '../../components/ui/LoadingCrystal'
import { ChatBubble, TypingIndicator } from '../../components/ui/ChatBubble'
import type { ChatMessage, ReadingSection } from '../../types'

export const Route = createFileRoute('/horoscope/')({
  validateSearch: (search: Record<string, unknown>) => ({
    sid: typeof search.sid === 'string' ? search.sid : undefined,
  }),
  component: HoroscopePage,
})

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

const HOROSCOPE_SUGGESTED_QUESTIONS = [
  'Hayat Yolu Sayımın bana yüklediği en büyük sınav nedir?',
  'Güneş burcum ile ismimin frekansı uyumlu mu?',
  'Önümüzdeki 1-2 yılda kariyer veya para kapım nasıl?',
  'Aşk ve evlilikte hangi elementlerle daha uyumluyum?',
]

function HoroscopePage() {
  const { sid } = useSearch({ from: '/horoscope/' })
  const navigate = useNavigate()
  const {
    createSession,
    setActiveSession,
    setPersonalInfo,
    setSelfIntro,
    setHoroscopeResult,
    setStep,
    addChatMessage,
  } = useSessionsStore()

  const session = useActiveSession()

  // sid senkronizasyonu
  useEffect(() => {
    if (sid) {
      setActiveSession(sid)
    } else if (!session || session.sessionType !== 'horoscope') {
      const newId = createSession('horoscope')
      navigate({ to: '/horoscope', search: { sid: newId } })
    }
  }, [sid])

  const step = session?.step ?? 'personal'
  const personalInfo = session?.personalInfo ?? {
    firstName: '',
    lastName: '',
    age: '',
    birthDate: { day: '15', month: '6', year: '1995' },
    birthTime: '',
  }
  const birthDate = personalInfo.birthDate ?? { day: '15', month: '6', year: '1995' }
  const selfIntro = session?.selfIntro ?? ''
  const result = session?.horoscopeResult
  const chatHistory = session?.chatHistory ?? []

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const dayId = useId()
  const monthId = useId()
  const yearId = useId()

  const lastMessageRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // Canlı Önizleme Hesaplamaları
  const dayNum = Number(birthDate.day) || 1
  const monthNum = Number(birthDate.month) || 1
  const yearNum = Number(birthDate.year) || 1995
  const liveZodiac = calculateZodiacSign(dayNum, monthNum)
  const liveLifePath = calculateLifePathNumber(dayNum, monthNum, yearNum)
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
  const liveName = fullName ? calculateNameDestinyNumber(fullName) : null

  // Sohbet akıllı kaydırma
  useEffect(() => {
    if (isChatLoading) {
      typingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else if (chatHistory.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [chatHistory.length, isChatLoading])

  const handleDateChange = (field: 'day' | 'month' | 'year', val: string) => {
    const next = { ...birthDate, [field]: val }
    setPersonalInfo({ birthDate: next })
    setErrors({})
  }

  const handleStartAnalysis = async () => {
    const e: Record<string, string> = {}
    if (!personalInfo.firstName.trim()) e.firstName = 'Ad gerekli'
    if (!personalInfo.lastName.trim()) e.lastName = 'Soyad gerekli'
    if (Object.keys(e).length) { setErrors(e); return }

    setAnalyzing(true)
    setAnalysisError(null)
    setStep('loading')

    try {
      const data = await analyzeHoroscope(personalInfo, selfIntro)
      setHoroscopeResult(data)
      setStep('result')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setAnalysisError(msg)
      setStep('personal')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSendChatMessage = async () => {
    const text = chatInput.trim()
    if (!text || isChatLoading || !result) return
    setChatInput('')

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    addChatMessage(userMsg)
    setIsChatLoading(true)

    try {
      const reply = await sendHoroscopeChatMessage(
        text,
        [...chatHistory, userMsg],
        result,
        personalInfo
      )
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
    } catch (err) {
      console.error('Chat hatası:', err)
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Yıldızlar arasındaki bağlantı anlık olarak zayıfladı. Lütfen sorunuzu tekrar iletin.',
        timestamp: Date.now(),
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  const years = Array.from({ length: 95 }, (_, i) => String(2026 - i))

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 safe-top"
        style={{ background: 'rgba(8,5,3,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 transition text-sm" style={{ color: 'var(--cream-dim)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Ana Sayfa</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg">♈</span>
          <span className="font-serif text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
            Burç & Numeroloji
          </span>
        </div>

        <button onClick={() => navigate({ to: '/admin' })} className="text-xs px-2.5 py-1 rounded-lg transition"
          style={{ color: 'var(--cream-dim)', border: '1px solid var(--border)', opacity: 0.5 }}>
          Admin
        </button>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-8 max-w-lg mx-auto w-full">
        {/* ADIM 1: GİRİŞ FORMU */}
        {step === 'personal' && (
          <div className="my-auto w-full space-y-6 animate-fade-in-up py-4">
            <div className="text-center space-y-2">
              <div className="text-5xl animate-float">✨</div>
              <h1 className="text-3xl sm:text-4xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kozmik Portreniz
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--cream-dim)' }}>
                Doğum tarihinizden Hayat Yolu Sayınızı (Kader Sayısı) ve isminizin harf titreşimlerini keşfedin.
              </p>
            </div>

            {/* Canlı Hesaplanan Rozetler */}
            <div className={`grid ${liveName ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5`}>
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 text-center space-y-1">
                <span className="text-[10px] text-purple-300/70 uppercase tracking-widest font-mono">Güneş Burcu</span>
                <p className="font-serif text-base sm:text-lg font-bold text-purple-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {liveZodiac.symbol} {liveZodiac.sign}
                </p>
                <span className="text-[10px] text-neutral-400">{liveZodiac.element} Elementi</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 text-center space-y-1">
                <span className="text-[10px] text-amber-300/70 uppercase tracking-widest font-mono">Hayat Yolu</span>
                <p className="font-serif text-base sm:text-lg font-bold text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Sayı {liveLifePath.number} {liveLifePath.isMaster && '★'}
                </p>
                <span className="text-[10px] text-neutral-400 truncate block">{liveLifePath.title}</span>
              </div>

              {liveName && (
                <div className="p-3 rounded-2xl bg-black/40 border border-blue-500/20 text-center space-y-1">
                  <span className="text-[10px] text-blue-300/70 uppercase tracking-widest font-mono">İsim Titreşimi</span>
                  <p className="font-serif text-base sm:text-lg font-bold text-blue-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Frekans {liveName.number} {liveName.isMaster && '★'}
                  </p>
                  <span className="text-[10px] text-neutral-400 truncate block">İsim Gücü</span>
                </div>
              )}
            </div>

            <MysticCard className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Ad</label>
                  <input
                    className="mystic-input text-sm"
                    placeholder="Adınız"
                    value={personalInfo.firstName}
                    onChange={(e) => { setPersonalInfo({ firstName: e.target.value }); setErrors({}) }}
                  />
                  {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Soyad</label>
                  <input
                    className="mystic-input text-sm"
                    placeholder="Soyadınız"
                    value={personalInfo.lastName}
                    onChange={(e) => { setPersonalInfo({ lastName: e.target.value }); setErrors({}) }}
                  />
                  {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              {/* Doğum Tarihi */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Doğum Tarihi</label>
                <div className="grid grid-cols-3 gap-2">
                  <label htmlFor={dayId} className="sr-only">Gün</label>
                  <select
                    id={dayId}
                    className="mystic-input text-xs cursor-pointer py-2.5"
                    value={birthDate.day}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)} className="bg-neutral-900 text-neutral-200">{d}</option>
                    ))}
                  </select>

                  <label htmlFor={monthId} className="sr-only">Ay</label>
                  <select
                    id={monthId}
                    className="mystic-input text-xs cursor-pointer py-2.5"
                    value={birthDate.month}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)} className="bg-neutral-900 text-neutral-200">{m}</option>
                    ))}
                  </select>

                  <label htmlFor={yearId} className="sr-only">Yıl</label>
                  <select
                    id={yearId}
                    className="mystic-input text-xs cursor-pointer py-2.5"
                    value={birthDate.year}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-neutral-900 text-neutral-200">{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doğum Saati (İsteğe bağlı) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>
                    Doğum Saati
                  </label>
                  <span className="text-[11px] text-neutral-500">İsteğe bağlı</span>
                </div>
                <input
                  type="time"
                  className="mystic-input text-xs py-2"
                  value={personalInfo.birthTime || ''}
                  onChange={(e) => setPersonalInfo({ birthTime: e.target.value })}
                />
                <p className="text-[11px] text-neutral-500">
                  Saatinizi tam bilmiyorsanız boş bırakabilirsiniz; Güneş burcunuz ve numerolojiniz eksiksiz hesaplanır.
                </p>
              </div>

              {/* Ekstra Merak Edilen Konu / Not */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>
                  Özel Merak Ettiğiniz Bir Alan (İsteğe bağlı)
                </label>
                <textarea
                  className="mystic-input text-xs h-18 resize-none py-2"
                  placeholder="Örn: Kariyer yolunda kararsızım, aşk hayatımda neden hep aynı döngüleri yaşıyorum? vb."
                  value={selfIntro}
                  onChange={(e) => setSelfIntro(e.target.value)}
                />
              </div>
            </MysticCard>

            {analysisError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300">
                ⚠️ {analysisError}
              </div>
            )}

            <MysticButton fullWidth onClick={handleStartAnalysis} disabled={analyzing}>
              🔮 Kozmik Analizi Başlat
            </MysticButton>
          </div>
        )}

        {/* ADIM 2: HESAPLAMA VE YÜKLEME */}
        {step === 'loading' && (
          <div className="my-auto w-full text-center space-y-6 py-12 animate-fade-in">
            <LoadingCrystal mode="horoscope" title="Astroloji & Sayı Analizi Yapılıyor" icon="♈" />
            <div className="space-y-1">
              <p className="font-serif text-xl text-purple-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Gezegenler ve Sayılar İnceleniyor...
              </p>
              <p className="text-xs text-neutral-400">
                {liveZodiac.sign} burcu ve Hayat Yolu Sayısı {liveLifePath.number} harmanlanıyor.
              </p>
            </div>
          </div>
        )}

        {/* ADIM 3: SONUÇ RAPORU */}
        {step === 'result' && result && (
          <div className="my-auto w-full space-y-5 animate-fade-in-up py-4">
            {/* Headline Card */}
            <div className="p-5 rounded-2xl space-y-3"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(201,169,110,0.12))',
                border: '1px solid var(--border-gold)',
              }}>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-200 font-semibold">
                  {result.zodiacSign} · {result.zodiacElement}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-900/40 border border-amber-500/30 text-amber-200 font-semibold">
                  Hayat Yolu: {result.lifePathNumber}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900/60 border border-neutral-700 text-neutral-300 font-mono">
                  İsim Frekansı: {result.nameDestinyNumber}
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
                {result.headline}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--cream)' }}>
                {result.summary}
              </p>
            </div>

            {/* Bölümler */}
            <div className="space-y-3">
              {result.sections.map((section: ReadingSection, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-neutral-800/80 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{section.icon}</span>
                    <h3 className="font-serif font-semibold text-base" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('personal')}
                className="btn-mystic-ghost flex-1 py-3.5 text-xs"
              >
                ← Bilgileri Değiştir
              </button>
              <MysticButton
                className="flex-1 py-3.5 text-xs"
                onClick={() => setStep('chat')}
              >
                💬 Danışmanla Konuş
              </MysticButton>
            </div>
          </div>
        )}

        {/* ADIM 4: SOHBET EKRANI */}
        {step === 'chat' && result && (
          <div className="flex flex-col h-full relative" style={{ minHeight: 'calc(100dvh - 160px)' }}>
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 mb-3 rounded-xl sticky top-14 z-30"
              style={{ background: 'rgba(17,13,9,0.95)', border: '1px solid rgba(168,85,247,0.4)', backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(201,169,110,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
                  🌌
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-purple-200">
                    Kozmik Danışman
                  </p>
                  <p className="text-[11px] truncate text-neutral-400">
                    {result.zodiacSign} & Sayı {result.lifePathNumber} ({personalInfo.firstName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(124,77,138,0.3))',
                    border: '1px solid rgba(168,85,247,0.4)',
                    color: '#c084fc',
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

            {/* Mesaj Akışı */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-6 pr-1 scroll-smooth">
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  🌌
                </div>
                <div className="chat-bubble-ai">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cream)' }}>
                    Merhaba {personalInfo.firstName} ✨ {result.zodiacSign} burcunun dinamikleri ve Hayat Yolu Sayın ({result.lifePathNumber}) üzerine raporunu tamamladım.{' '}
                    <span className="italic text-purple-300/80">"{result.headline}"</span>
                    <br /><br />
                    Burcun, sayın veya hayatınla ilgili aklına takılan her şeyi sorabilirsin; kozmik haritanı birlikte açalım. 🪐
                  </p>
                </div>
              </div>

              {chatHistory.length === 0 && (
                <div className="px-2 space-y-2 animate-fade-in">
                  <p className="text-xs text-neutral-400">Soru önerileri:</p>
                  <div className="flex flex-wrap gap-2">
                    {HOROSCOPE_SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); chatInputRef.current?.focus() }}
                        className="text-xs px-3 py-2 rounded-xl text-left transition bg-purple-950/20 border border-purple-500/20 text-neutral-300 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg, index) => {
                const isLast = index === chatHistory.length - 1
                return (
                  <div key={msg.id} ref={isLast ? lastMessageRef : undefined} className={isLast ? 'scroll-mt-24' : undefined}>
                    <ChatBubble message={msg} />
                  </div>
                )
              })}

              {isChatLoading && (
                <div ref={typingRef} className="scroll-mt-20">
                  <TypingIndicator />
                </div>
              )}
            </div>

            {/* Input alanı */}
            <div className="sticky bottom-0 pt-3 safe-bottom"
              style={{ background: 'linear-gradient(to top, var(--bg-deep) 85%, transparent)' }}>
              <div className="flex items-end gap-3 p-3 rounded-2xl bg-neutral-950/90 border border-purple-500/30 backdrop-blur-md">
                <textarea
                  ref={chatInputRef}
                  className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed text-neutral-100"
                  placeholder="Burcunuz veya Hayat Yolu Sayınız hakkında bir soru sorun..."
                  rows={1}
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage() }
                  }}
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition active:scale-95 bg-gradient-to-r from-purple-700 to-amber-600 text-white disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rapor Detay Modalı */}
            {showDetailModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.8)' }}>
                <div className="mystic-card w-full max-w-lg max-h-[85dvh] flex flex-col overflow-hidden animate-fade-in-up border border-purple-500/40">
                  <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🪐</span>
                      <h3 className="font-serif text-lg font-semibold text-purple-200">
                        {personalInfo.firstName} için Kozmik Rapor
                      </h3>
                    </div>
                    <button onClick={() => setShowDetailModal(false)} className="text-neutral-400 hover:text-white">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                      <h4 className="font-serif font-bold text-base text-amber-200">{result.headline}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="space-y-3">
                      {result.sections.map((s: ReadingSection, i: number) => (
                        <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-neutral-800/80 space-y-1.5">
                          <p className="text-xs font-semibold text-purple-200 flex items-center gap-2">
                            <span>{s.icon}</span>
                            <span>{s.title}</span>
                          </p>
                          <p className="text-xs text-neutral-400 leading-relaxed">{s.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 border-t border-neutral-800 flex justify-end">
                    <button onClick={() => setShowDetailModal(false)} className="btn-mystic-primary text-xs py-2 px-5">
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
