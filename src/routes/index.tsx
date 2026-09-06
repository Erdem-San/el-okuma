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
  const isAstro = session.sessionType === 'horoscope'
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
            <span style={{ color: 'var(--gold)' }}>{name}</span> için yapılan {isAstro ? 'astroloji' : 'el falı'} okuması ve konuşma geçmişi kalıcı olarak silinecek.
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
  const isAstro = session.sessionType === 'horoscope'
  const name = `${session.personalInfo.firstName} ${session.personalInfo.lastName}`.trim() || 'İsimsiz'
  const age = session.personalInfo.age
  const photoCount = session.photos.filter((p) => p.base64).length
  const hasResult = isAstro ? Boolean(session.horoscopeResult) : Boolean(session.result)
  const chatCount = session.chatHistory.length
  const date = new Date(session.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

  const STEP_LABELS: Record<string, string> = {
    personal: 'Bilgiler girildi',
    photos: 'Fotoğraflar bekleniyor',
    intro: 'Tanıtım bekleniyor',
    loading: 'Analiz sürüyor',
    result: 'Analiz tamamlandı',
    chat: 'Sohbet devam ediyor',
  }

  return (
    <div className="mystic-card p-4 flex items-center gap-4 active:scale-[0.99] transition-transform">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: isAstro
            ? 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(124,77,138,0.1))'
            : 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(124,77,138,0.08))',
          border: `1px solid ${isAstro ? 'rgba(168,85,247,0.35)' : 'var(--border-gold)'}`,
        }}>
        {isAstro ? '♈' : (hasResult ? '🔮' : '🖐')}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--cream)' }}>{name}</p>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
            style={{
              background: isAstro ? 'rgba(168,85,247,0.15)' : 'rgba(201,169,110,0.1)',
              color: isAstro ? '#c084fc' : 'var(--gold)',
              border: `1px solid ${isAstro ? 'rgba(168,85,247,0.3)' : 'var(--border-gold)'}`,
            }}
          >
            {isAstro ? 'Astroloji' : 'El Falı'}
          </span>
          {age && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--gold)', fontSize: 10 }}>{age} yaş</span>}
        </div>
        <p className="text-xs mt-0.5" style={{ color: hasResult ? (isAstro ? '#c084fc' : 'var(--gold)') : 'var(--cream-dim)', opacity: hasResult ? 0.85 : 0.5 }}>
          {STEP_LABELS[session.step] ?? session.step}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--cream-dim)', opacity: 0.35 }}>
          {date} · {isAstro ? 'Kozmik Harita' : `${photoCount} fotoğraf`}{chatCount > 0 ? ` · ${chatCount} mesaj` : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
          aria-label="Sil"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={onContinue}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          style={{
            background: isAstro
              ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(124,77,138,0.3))'
              : 'linear-gradient(135deg, rgba(138,92,42,0.3), rgba(201,169,110,0.2))',
            border: `1px solid ${isAstro ? 'rgba(168,85,247,0.4)' : 'var(--border-gold)'}`,
            color: isAstro ? '#e9d5ff' : 'var(--gold)',
          }}
        >
          {hasResult ? 'Devam Et' : 'Kaldığın Yerden'}
        </button>
      </div>
    </div>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()
  const { sessions, createSession, setActiveSession, deleteSession } = useSessionsStore()
  const [deleteTarget, setDeleteTarget] = useState<ReadingSession | null>(null)

  const handleNewPalmSession = () => {
    const id = createSession('palm')
    navigate({ to: '/reading', search: { sid: id } })
  }

  const handleNewHoroscopeSession = () => {
    const id = createSession('horoscope')
    navigate({ to: '/horoscope', search: { sid: id } })
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

  // Sort by updatedAt desc
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
            elokuma
          </span>
        </div>
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="text-xs px-3 py-1.5 rounded-lg transition"
          style={{ color: 'var(--cream-dim)', border: '1px solid var(--border)', opacity: 0.5 }}
        >
          Admin
        </button>
      </header>

      <main className="flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full">
        <div className="my-auto w-full space-y-8">
          {/* Hero — Orijinal Mistik Tasarım */}
          <div className="text-center space-y-5">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full animate-pulse-glow"
                style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)' }} />
              <div className="text-6xl animate-float relative z-10">🖐</div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-serif text-gradient-mystic leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                El Okuma
              </h1>
              <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
                Yapay zeka ile ellerinizin ve yıldızlarınızın sırlarını keşfedin.
              </p>
            </div>

            {/* Alt Alta Şık Butonlar */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleNewPalmSession}
                className="btn-mystic-primary w-full py-4 text-base flex items-center justify-center gap-2"
              >
                <span>🔮</span>
                <span>Yeni El Falı Başlat</span>
              </button>

              <button
                onClick={handleNewHoroscopeSession}
                className="w-full py-3.5 px-5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,77,138,0.2))',
                  border: '1px solid rgba(168,85,247,0.35)',
                  color: '#e9d5ff',
                }}
              >
                <span>♈</span>
                <span>Astroloji & Doğum Haritası</span>
                <span className="text-xs text-purple-300/60 font-normal">→</span>
              </button>
            </div>
          </div>

          {/* Previous sessions */}
          {sorted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>
                  Önceki Okumalar
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
        Eğlence amaçlıdır · elokuma
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
