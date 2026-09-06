import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { MysticCard } from '../ui/MysticCard'
import { MysticButton } from '../ui/MysticButton'
import { MAX_INTRO_CHARS } from '../../lib/constants'

const PROMPT_QUESTIONS = [
  'Şu an hayatımda en çok merak ettiğim şey...',
  'Kendimi şöyle biri olarak tanımlarım:',
  'Son zamanlarda hissettiklerim:',
]

export function StepSelfIntro() {
  const { setSelfIntro, setStep } = useSessionsStore()
  const session = useActiveSession()
  const selfIntro = session?.selfIntro ?? ''
  const remaining = MAX_INTRO_CHARS - selfIntro.length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2">
        <div className="text-4xl animate-float">🌙</div>
        <h2 className="text-2xl sm:text-3xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Kendinizden Bahsedin
        </h2>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
          Bu bilgiler okumanızı daha derin ve kişisel hale getirir.
        </p>
      </div>

      <MysticCard>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--gold)', opacity: 0.8 }}>İlham alın:</p>
        <div className="space-y-2">
          {PROMPT_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => setSelfIntro(selfIntro ? selfIntro + '\n' + q : q)}
              className="w-full text-left text-xs px-3 py-2 rounded-lg transition"
              style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid var(--border)', color: 'var(--cream-dim)' }}
            >
              <span style={{ color: 'var(--gold)', marginRight: 6 }}>✦</span>{q}
            </button>
          ))}
        </div>
      </MysticCard>

      <div className="space-y-2">
        <textarea
          className="mystic-textarea"
          rows={5}
          placeholder="Hayatınız, hisleriniz, merak ettikleriniz... İstediğiniz kadar paylaşın."
          value={selfIntro}
          onChange={(e) => { if (e.target.value.length <= MAX_INTRO_CHARS) setSelfIntro(e.target.value) }}
        />
        <div className="flex justify-between px-1">
          <span className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>İsteğe bağlı</span>
          <span className="text-xs" style={{ color: remaining < 50 ? '#f87171' : 'var(--cream-dim)', opacity: 0.5 }}>
            {remaining} karakter kaldı
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <MysticButton variant="ghost" onClick={() => setStep('photos')} className="flex-1">← Geri</MysticButton>
        <MysticButton onClick={() => setStep('loading')} className="flex-[2]">🔮 El Falına Başla</MysticButton>
      </div>
    </div>
  )
}
