import { useEffect, useState } from 'react'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { analyzePalmReading } from '../../lib/api'
import { LoadingCrystal } from '../ui/LoadingCrystal'
import { MysticButton } from '../ui/MysticButton'

export function StepLoading() {
  const { setResult, setStep } = useSessionsStore()
  const session = useActiveSession()
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    setError(null)

    const run = async () => {
      try {
        const result = await analyzePalmReading(session.personalInfo, session.photos, session.selfIntro)
        if (!cancelled) {
          setResult(result)
          setStep('result')
        }
      } catch (err) {
        console.error('Analiz hatası:', err)
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu'
          setError(msg)
        }
      }
    }

    const minDelay = new Promise((res) => setTimeout(res, 2500))
    Promise.all([run(), minDelay])
    return () => { cancelled = true }
  }, [isRetrying])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6 animate-fade-in">
        <div className="text-4xl">⚠️</div>
        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-2xl text-red-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Analiz Sırasında Hata Oluştu
          </h3>
          <p className="text-xs text-red-300/80 bg-red-950/40 p-4 rounded-xl border border-red-800/40 leading-relaxed font-mono break-words text-left">
            {error}
          </p>
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <MysticButton variant="ghost" className="flex-1" onClick={() => setStep('intro')}>
            ← Geri Dön
          </MysticButton>
          <MysticButton className="flex-1" onClick={() => setIsRetrying((v) => v + 1)}>
            Tekrar Dene
          </MysticButton>
        </div>
      </div>
    )
  }

  return <LoadingCrystal />
}
