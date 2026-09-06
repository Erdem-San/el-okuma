import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  'Ellerinizin çizgileri okunuyor...',
  'Yıldızlarla bağlantı kuruluyor...',
  'Yaşam enerjiniz hissediliyor...',
  'Kaderin sırları çözülüyor...',
  'Ruhunuzun haritası çiziliyor...',
  'Kozmik enerji analiz ediliyor...',
]

export function LoadingCrystal() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-10">
      {/* Crystal animation */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Glow behind */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)' }}
        />

        {/* Outer ring */}
        <div
          className="absolute w-36 h-36 crystal-ring crystal-ring-1 animate-spin-slow"
          style={{ borderWidth: '1.5px' }}
        />

        {/* Middle ring */}
        <div
          className="absolute w-24 h-24 crystal-ring crystal-ring-2 animate-spin-reverse"
          style={{ borderWidth: '1.5px' }}
        />

        {/* Inner ring */}
        <div
          className="absolute w-14 h-14 crystal-ring"
          style={{
            borderWidth: '1px',
            borderTopColor: 'rgba(164,123,181,0.6)',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'rgba(164,123,181,0.3)',
            animation: 'spin-slow 4s linear infinite',
          }}
        />

        {/* Center eye / symbol */}
        <div
          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)' }}
        >
          🔮
        </div>

        {/* Twinkle stars */}
        {[
          { top: '4%', left: '50%', delay: '0s' },
          { top: '50%', left: '96%', delay: '0.6s' },
          { top: '96%', left: '50%', delay: '1.2s' },
          { top: '50%', left: '4%', delay: '1.8s' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
            style={{
              ...pos,
              transform: 'translate(-50%, -50%)',
              background: 'var(--gold)',
              animationDelay: pos.delay,
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <div className="text-center space-y-3">
        <h2
          className="text-2xl sm:text-3xl font-serif text-gradient-mystic"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          El Okuması Yapılıyor
        </h2>
        <p
          key={msgIdx}
          className="text-sm animate-fade-in"
          style={{ color: 'var(--cream-dim)', minHeight: '1.4em' }}
        >
          {LOADING_MESSAGES[msgIdx]}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-full animate-pulse"
              style={{
                width: i === 2 ? 8 : 5,
                height: i === 2 ? 8 : 5,
                background: 'var(--gold)',
                opacity: i === 2 ? 0.9 : 0.3,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
