import { useState, useId } from 'react'
import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { MysticCard } from '../ui/MysticCard'
import { MysticButton } from '../ui/MysticButton'

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function StepPersonalInfo() {
  const { setPersonalInfo, setStep } = useSessionsStore()
  const session = useActiveSession()
  const personalInfo = session?.personalInfo ?? {
    firstName: '',
    lastName: '',
    age: '',
    birthDate: { day: '15', month: '6', year: '1995' },
  }

  const birthDate = personalInfo.birthDate ?? { day: '15', month: '6', year: '1995' }
  const [errors, setErrors] = useState<Record<string, string>>({})
  const dayId = useId()
  const monthId = useId()
  const yearId = useId()

  const calculateAge = (y: string) => {
    const yr = Number(y)
    if (!yr || yr < 1920 || yr > 2026) return ''
    return String(new Date().getFullYear() - yr)
  }

  const handleDateChange = (field: 'day' | 'month' | 'year', val: string) => {
    const nextDate = { ...birthDate, [field]: val }
    const calculatedAge = calculateAge(nextDate.year)
    setPersonalInfo({
      birthDate: nextDate,
      age: calculatedAge || personalInfo.age,
    })
    setErrors({})
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!personalInfo.firstName.trim()) e.firstName = 'Ad gerekli'
    if (!personalInfo.lastName.trim()) e.lastName = 'Soyad gerekli'
    if (!birthDate.year || Number(birthDate.year) < 1920 || Number(birthDate.year) > 2026) {
      e.year = 'Geçerli bir yıl seçin'
    }
    return e
  }

  const handleNext = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const finalAge = calculateAge(birthDate.year) || personalInfo.age || '30'
    setPersonalInfo({ age: finalAge, birthDate })
    setStep('photos')
  }

  const currentAge = calculateAge(birthDate.year)

  // Yıl seçenekleri: 2026 geriye doğru 1930'a kadar
  const years = Array.from({ length: 95 }, (_, i) => String(2026 - i))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-3 pt-2">
        <div className="text-5xl animate-float">🖐</div>
        <h1 className="text-3xl sm:text-4xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Falınıza Başlayalım
        </h1>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
          Elleriniz, hayatınızın haritasıdır. Çizgilerinizdeki yaş döngülerini tam hesaplamak için doğum tarihinizi girin.
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

        {/* Doğum Tarihi Seçimi (Gün / Ay / Yıl) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>
              Doğum Tarihi
            </label>
            {currentAge && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--gold)', border: '1px solid var(--border-gold)' }}>
                🎂 {currentAge} Yaşında
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Gün */}
            <div>
              <label htmlFor={dayId} className="sr-only">Gün</label>
              <select
                id={dayId}
                className="mystic-input text-xs cursor-pointer py-2.5"
                value={birthDate.day}
                onChange={(e) => handleDateChange('day', e.target.value)}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)} className="bg-neutral-900 text-neutral-200">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Ay */}
            <div>
              <label htmlFor={monthId} className="sr-only">Ay</label>
              <select
                id={monthId}
                className="mystic-input text-xs cursor-pointer py-2.5"
                value={birthDate.month}
                onChange={(e) => handleDateChange('month', e.target.value)}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={String(i + 1)} className="bg-neutral-900 text-neutral-200">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Yıl */}
            <div>
              <label htmlFor={yearId} className="sr-only">Yıl</label>
              <select
                id={yearId}
                className="mystic-input text-xs cursor-pointer py-2.5"
                value={birthDate.year}
                onChange={(e) => handleDateChange('year', e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-neutral-900 text-neutral-200">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.year && <p className="text-xs" style={{ color: '#f87171' }}>{errors.year}</p>}
        </div>
      </MysticCard>

      <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}>
        <span className="text-lg mt-0.5">✨</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
          Doğum tarihiniz, el çizgileriniz üzerindeki 7'li Cheiro yaş döngülerini milimetrik olarak eşleştirmek için kullanılır.
        </p>
      </div>

      <MysticButton fullWidth onClick={handleNext}>
        Devam Et — Fotoğraflar →
      </MysticButton>
    </div>
  )
}
