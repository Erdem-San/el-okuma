interface ProgressStepperProps {
  currentStep: 'personal' | 'photos' | 'intro' | 'result' | 'chat'
}

const STEPS = [
  { key: 'personal', label: 'Bilgiler' },
  { key: 'photos', label: 'Fotoğraflar' },
  { key: 'intro', label: 'Hakkında' },
  { key: 'result', label: 'Okuma' },
] as const

const STEP_ORDER = ['personal', 'photos', 'intro', 'loading', 'result', 'chat']

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep)

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-sm mx-auto px-2">
      {STEPS.map((step, i) => {
        const stepIdx = STEP_ORDER.indexOf(step.key)
        const isDone = currentIdx > stepIdx
        const isActive = currentIdx === stepIdx || (step.key === 'result' && (currentStep === 'result' || currentStep === 'chat'))

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: isDone
                    ? 'linear-gradient(135deg, #8a5c2a, #c9a96e)'
                    : isActive
                    ? 'linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.1))'
                    : 'rgba(30,20,12,0.8)',
                  border: isDone
                    ? 'none'
                    : isActive
                    ? '1.5px solid var(--gold)'
                    : '1.5px solid var(--border)',
                  color: isDone ? '#0a0603' : isActive ? 'var(--gold)' : 'var(--cream-dim)',
                  boxShadow: isActive ? '0 0 12px rgba(201,169,110,0.3)' : 'none',
                }}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className="text-[10px] mt-1 font-medium transition-colors duration-300"
                style={{ color: isActive || isDone ? 'var(--gold)' : 'var(--cream-dim)', opacity: isActive || isDone ? 1 : 0.5 }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-px flex-1 mx-1 mb-4 transition-all duration-500"
                style={{ background: isDone ? 'var(--gold-dim)' : 'var(--border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
