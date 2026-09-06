import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSessionsStore } from '../store/readingStore'
import type { ReadingSession } from '../types'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

// ─── Silme onay popup'ı ───────────────────────────────────────────────────────
function DeleteConfirmModal({
  session,
  onConfirm,
  onCancel,
}: {
  session: ReadingSession
  onConfirm: () => void
  onCancel: () => void
}) {
  const isHoroscope = session.sessionType === 'horoscope'
  const name = `${session.personalInfo.firstName} ${session.personalInfo.lastName}`.trim() || 'Bu okuma'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
      <div className="mystic-card p-6 w-full max-w-xs space-y-4 animate-fade-in-up" style={{ border: '1px solid var(--border-gold)' }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">🗑️</div>
          <h3 className="font-serif text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
            Emin misiniz?
          </h3>
          <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
            <span style={{ color: 'var(--gold)' }}>{name}</span> için yapılan {isHoroscope ? 'burç ve numeroloji' : 'el falı'} okuması ve tüm konuşma geçmişi kalıcı olarak silinecek.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-mystic-ghost flex-1">İptal</button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-3 font-semibold text-sm transition active:scale-95"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Oturum kartı ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  onContinue,
  onDelete,
}: {
  session: ReadingSession
  onContinue: () => void
  onDelete: () => void
}) {
  const isHoroscope = session.sessionType === 'horoscope'
  const name = `${session.personalInfo.firstName} ${session.personalInfo.lastName}`.trim() || 'İsimsiz'
  const age = session.personalInfo.age
  const hasResult = isHoroscope ? Boolean(session.horoscopeResult) : Boolean(session.result)
  const chatCount = session.chatHistory.length
  const date = new Date(session.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mystic-card p-4 flex items-center gap-4 active:scale-[0.99] transition-transform">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{
          background: isHoroscope
            ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,77,138,0.15))'
            : 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(124,77,138,0.12))',
          border: `1px solid ${isHoroscope ? 'rgba(168,85,247,0.3)' : 'var(--border-gold)'}`,
        }}
      >
        {isHoroscope ? '♈' : '🖐'}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onContinue}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--cream)' }}>
            {name}
          </p>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isHoroscope ? 'rgba(168,85,247,0.15)' : 'rgba(201,169,110,0.1)',
              color: isHoroscope ? '#c084fc' : 'var(--gold)',
              border: `1px solid ${isHoroscope ? 'rgba(168,85,247,0.3)' : 'var(--border-gold)'}`,
            }}
          >
            {isHoroscope ? 'Burç & Numeroloji' : 'El Falı'}
          </span>
          {age && (
            <span className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.6 }}>
              · {age} yaş
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.7 }}>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hasResult ? 'bg-green-400' : 'bg-amber-400'}`} />
            {hasResult ? 'Analiz tamamlandı' : 'Devam ediyor'}
          </span>
          {chatCount > 0 && <span>💬 {chatCount} soru</span>}
        </div>

        <p className="text-[11px] mt-0.5" style={{ color: 'var(--cream-dim)', opacity: 0.35 }}>
          {date}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onContinue}
          className="text-xs px-3 py-1.5 rounded-xl transition active:scale-95 font-medium"
          style={{
            background: isHoroscope
              ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(124,77,138,0.25))'
              : 'linear-gradient(135deg, rgba(138,92,42,0.4), rgba(201,169,110,0.3))',
            border: `1px solid ${isHoroscope ? 'rgba(168,85,247,0.4)' : 'var(--border-gold)'}`,
            color: isHoroscope ? '#c084fc' : 'var(--gold)',
          }}
        >
          {hasResult ? 'İncele →' : 'Devam Et →'}
        </button>

        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
          aria-label="Sil"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const { sessions, createSession, deleteSession, setActiveSession } = useSessionsStore()
  const [deleteTarget, setDeleteTarget] = useState<ReadingSession | null>(null)

  const handleNewPalmSession = () => {
    const newId = createSession('palm')
    navigate({ to: '/reading', search: { sid: newId } })
  }

  const handleNewHoroscopeSession = () => {
    const newId = createSession('horoscope')
    navigate({ to: '/horoscope', search: { sid: newId } })
  }

  const handleContinue = (session: ReadingSession) => {
    setActiveSession(session.id)
    if (session.sessionType === 'horoscope') {
      navigate({ to: '/horoscope', search: { sid: session.id } })
    } else {
      navigate({ to: '/reading', search: { sid: session.id } })
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) { deleteSession(deleteTarget.id); setDeleteTarget(null) }
  }

  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,77,138,0.05) 0%, transparent 70%)' }} />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 safe-top">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="elokuma" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-serif font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
            elokuma & kozmik
          </span>
        </div>
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="text-xs px-3 py-1.5 rounded-lg transition"
          style={{ color: 'var(--cream-dim)', border: '1px solid var(--border)', opacity: 0.5 }}
        >
          ⚙️ Kütüphane Admin
        </button>
      </header>

      <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
        <div className="my-auto w-full space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full animate-pulse-glow"
                style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)' }} />
              <div className="text-6xl animate-float relative z-10">🔮</div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-serif text-gradient-mystic leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kozmik Rehber
              </h1>
              <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
                Kadim el falı, astroloji ve numeroloji ilmini yapay zeka ile keşfedin.
              </p>
            </div>
          </div>

          {/* İki Ana Seçenek Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* El Falı Kartı */}
            <div
              onClick={handleNewPalmSession}
              className="mystic-card p-5 cursor-pointer hover:border-amber-400/60 transition active:scale-95 space-y-3 flex flex-col justify-between"
              style={{ border: '1px solid var(--border-gold)', background: 'linear-gradient(145deg, rgba(20,15,10,0.9), rgba(10,7,4,0.9))' }}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid var(--border-gold)' }}>
                  🖐
                </div>
                <h3 className="font-serif text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
                  El Falı Analizi
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
                  Avuç içi ve parmak fotoğraflarınızla Cheiro ekolü kapsamlı çizgi ve kader okuması.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl block text-center"
                  style={{ background: 'linear-gradient(135deg, #8a5c2a, #c9a96e)', color: '#0a0603' }}>
                  El Falı Başlat →
                </span>
              </div>
            </div>

            {/* Burç & Numeroloji Kartı */}
            <div
              onClick={handleNewHoroscopeSession}
              className="mystic-card p-5 cursor-pointer hover:border-purple-400/60 transition active:scale-95 space-y-3 flex flex-col justify-between"
              style={{ border: '1px solid rgba(168,85,247,0.3)', background: 'linear-gradient(145deg, rgba(25,15,35,0.9), rgba(12,7,18,0.9))' }}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  ♈
                </div>
                <h3 className="font-serif text-xl font-bold text-purple-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Burç & Numeroloji
                </h3>
                <p className="text-xs leading-relaxed text-neutral-300">
                  Doğum tarihi, Hayat Yolu Sayısı (Kader Sayısı) ve isminizin harf frekans analizi.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl block text-center bg-gradient-to-r from-purple-700 to-amber-600 text-white">
                  Burç & Sayı Analizi →
                </span>
              </div>
            </div>
          </div>

          {/* Previous sessions */}
          {sorted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>
                  Önceki Okumalar ({sorted.length})
                </p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <div className="space-y-2">
                {sorted.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onContinue={() => handleContinue(s)}
                    onDelete={() => setDeleteTarget(s)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <p className="text-center text-xs pb-6" style={{ color: 'var(--cream-dim)', opacity: 0.25 }}>
        Eğlence amaçlıdır · elokuma & kozmik
      </p>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          session={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
