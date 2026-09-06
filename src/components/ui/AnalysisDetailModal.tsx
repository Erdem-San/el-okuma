import { useActiveSession } from '../../store/readingStore'
import type { ReadingSection } from '../../types'

export function AnalysisDetailModal({ onClose }: { onClose: () => void }) {
  const session = useActiveSession()
  const result = session?.result
  const personalInfo = session?.personalInfo

  if (!result || !personalInfo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.8)' }}>
      <div className="mystic-card w-full max-w-lg max-h-[85dvh] flex flex-col overflow-hidden animate-fade-in-up"
        style={{ border: '1px solid var(--border-gold)' }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="font-serif text-lg font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
                {personalInfo.firstName} için El Falı Raporu
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--gold)', opacity: 0.8 }}>
                {personalInfo.age} Yaşında · Detaylı Çizgi Analizleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl space-y-2"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(124,77,138,0.06))', border: '1px solid var(--border-gold)' }}>
            <h4 className="font-serif font-bold text-base" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
              {result.headline}
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--cream)' }}>
              {result.summary}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {result.sections.map((section: ReadingSection, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-black/40 border border-neutral-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{section.icon}</span>
                  <h5 className="font-serif font-semibold text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
                    {section.title}
                  </h5>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {session.selfIntro && (
            <div className="p-3 rounded-xl bg-black/20 border border-neutral-900 text-xs">
              <span className="font-semibold text-neutral-400">Paylaştığın Bilgiler: </span>
              <span className="italic text-neutral-300">{session.selfIntro}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="btn-mystic-primary text-xs py-2 px-6"
          >
            Sohbete Devam Et
          </button>
        </div>
      </div>
    </div>
  )
}
