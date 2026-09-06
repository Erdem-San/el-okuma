import { useState } from 'react'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { MysticCard } from '../ui/MysticCard'
import { MysticButton } from '../ui/MysticButton'

export function StepPersonalInfo() {
  const { setPersonalInfo, setStep } = useSessionsStore()
  const session = useActiveSession()
  const personalInfo = session?.personalInfo ?? { firstName: '', lastName: '', age: '' }
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!personalInfo.firstName.trim()) e.firstName = 'Ad gerekli'
    if (!personalInfo.lastName.trim()) e.lastName = 'Soyad gerekli'
    if (!personalInfo.age || Number(personalInfo.age) < 1 || Number(personalInfo.age) > 120)
      e.age = 'Geçerli bir yaş girin'
    return e
  }

  const handleNext = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setStep('photos')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-3 pt-2">
        <div className="text-5xl animate-float">🖐</div>
        <h1 className="text-3xl sm:text-4xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Falınıza Başlayalım
        </h1>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
          Elleriniz, hayatınızın haritasıdır. Sizi tanımak için birkaç bilgiye ihtiyacımız var.
        </p>
      </div>

      <MysticCard className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Ad</label>
            <input
              className="mystic-input"
              placeholder="Adınız"
              value={personalInfo.firstName}
              onChange={(e) => { setPersonalInfo({ firstName: e.target.value }); setErrors({}) }}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="text-xs" style={{ color: '#f87171' }}>{errors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Soyad</label>
            <input
              className="mystic-input"
              placeholder="Soyadınız"
              value={personalInfo.lastName}
              onChange={(e) => { setPersonalInfo({ lastName: e.target.value }); setErrors({}) }}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="text-xs" style={{ color: '#f87171' }}>{errors.lastName}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>Yaş</label>
          <input
            className="mystic-input"
            placeholder="Yaşınız"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={personalInfo.age}
            onChange={(e) => { setPersonalInfo({ age: e.target.value }); setErrors({}) }}
          />
          {errors.age && <p className="text-xs" style={{ color: '#f87171' }}>{errors.age}</p>}
        </div>
      </MysticCard>

      <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}>
        <span className="text-lg mt-0.5">✨</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
          Bilgileriniz yalnızca el falı okuması için kullanılır ve cihazınızda saklanır. Hiçbir veriye kalıcı olarak erişilmez.
        </p>
      </div>

      <MysticButton fullWidth onClick={handleNext}>
        Devam Et — Fotoğraflar →
      </MysticButton>
    </div>
  )
}
