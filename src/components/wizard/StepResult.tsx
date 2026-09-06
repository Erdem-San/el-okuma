import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { MysticButton } from '../ui/MysticButton'

export function StepResult() {
  const { setStep } = useSessionsStore()
  const session = useActiveSession()
  const result = session?.result
  const personalInfo = session?.personalInfo

  if (!result || !personalInfo) return null

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'El Falım — elokuma',
        text: `${personalInfo.firstName} için el falı: ${result.summary}`,
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl p-6 text-center space-y-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(20,14,8,0.98) 0%, rgba(30,20,10,0.95) 100%)', border: '1px solid var(--border-gold)' }}>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)' }} />
        <div className="text-4xl animate-float relative z-10">🔮</div>
        <p className="text-xs font-medium tracking-widest uppercase relative z-10" style={{ color: 'var(--gold)', opacity: 0.7 }}>
          El Okuması Tamamlandı
        </p>
        <h2 className="text-xl sm:text-2xl font-serif relative z-10"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
          {result.headline}
        </h2>
        <p className="text-sm leading-relaxed relative z-10 mx-auto max-w-sm" style={{ color: 'var(--cream-dim)' }}>
          {result.summary}
        </p>
        <div className="flex justify-center gap-1.5 pt-1 relative z-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="animate-twinkle" style={{ color: 'var(--gold)', fontSize: 12, animationDelay: `${i * 0.3}s` }}>✦</span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {result.sections.map((section, i) => (
          <div key={i} className="reveal mystic-card p-5" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)' }}>
                {section.icon}
              </span>
              <h3 className="font-serif font-semibold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
                {section.title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-dim)' }}>{section.content}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--gold)', opacity: 0.5 }}>✦</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="space-y-3">
        <MysticButton fullWidth onClick={() => setStep('chat')}>
          💬 Soru Sor — Sohbete Devam Et
        </MysticButton>
        {'share' in navigator && (
          <MysticButton variant="ghost" fullWidth onClick={handleShare}>Paylaş ↗</MysticButton>
        )}
      </div>
    </div>
  )
}
