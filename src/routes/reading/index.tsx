import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { useEffect } from 'react'
import { ProgressStepper } from '../../components/ui/ProgressStepper'
import { StepPersonalInfo } from '../../components/wizard/StepPersonalInfo'
import { StepPhotoUpload } from '../../components/wizard/StepPhotoUpload'
import { StepSelfIntro } from '../../components/wizard/StepSelfIntro'
import { StepLoading } from '../../components/wizard/StepLoading'
import { StepResult } from '../../components/wizard/StepResult'
import { StepChat } from '../../components/wizard/StepChat'

export const Route = createFileRoute('/reading/')({
  validateSearch: (search: Record<string, unknown>) => ({
    sid: typeof search.sid === 'string' ? search.sid : undefined,
  }),
  component: ReadingPage,
})

function ReadingPage() {
  const { sid } = useSearch({ from: '/reading/' })
  const navigate = useNavigate()
  const { setActiveSession } = useSessionsStore()
  const session = useActiveSession()

  // Ensure correct session is active based on URL param
  useEffect(() => {
    if (sid) setActiveSession(sid)
  }, [sid])

  const step = session?.step ?? 'personal'
  const isFullscreen = step === 'loading' || step === 'chat'

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 safe-top"
        style={{ background: 'rgba(8,5,3,0.85)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 transition" style={{ color: 'var(--cream-dim)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="elokuma" className="w-6 h-6 rounded-md object-cover" />
          <span className="font-serif text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
            elokuma
          </span>
        </div>

        <div className="w-7" />
      </header>

      {!isFullscreen && (
        <div className="px-4 py-4">
          <ProgressStepper currentStep={step} />
        </div>
      )}

      <main className="flex-1 flex flex-col px-4 pb-8 max-w-lg mx-auto w-full">
        <div className={`w-full ${step !== 'chat' ? 'my-auto' : 'flex-1 flex flex-col'}`}>
          {step === 'personal' && <StepPersonalInfo />}
          {step === 'photos' && <StepPhotoUpload />}
          {step === 'intro' && <StepSelfIntro />}
          {step === 'loading' && <StepLoading />}
          {step === 'result' && <StepResult />}
          {step === 'chat' && <StepChat />}
        </div>
      </main>
    </div>
  )
}
