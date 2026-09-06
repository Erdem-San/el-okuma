import { useSessionsStore, useActiveSession } from '../../store/readingStore'
import { PhotoSlot } from '../ui/PhotoSlot'
import { MysticCard } from '../ui/MysticCard'
import { MysticButton } from '../ui/MysticButton'

export function StepPhotoUpload() {
  const { setStep } = useSessionsStore()
  const session = useActiveSession()
  const photos = session?.photos ?? []
  const uploadedCount = photos.filter((p) => p.base64).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          El Fotoğraflarınız
        </h2>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
          En doğru okuma için her iki elinizin önü ve arkasını yükleyin.
          <br />
          <span style={{ color: 'var(--gold)', opacity: 0.8 }}>En az 1 fotoğraf gereklidir.</span>
        </p>
      </div>

      <MysticCard>
        <div className="flex items-center gap-3">
          <span className="text-xl">💡</span>
          <ul className="text-xs space-y-1" style={{ color: 'var(--cream-dim)' }}>
            <li>• İyi aydınlatılmış ortamda çekin</li>
            <li>• El çizgileriniz net görünsün</li>
            <li>• Parmaklar hafif açık olsun</li>
          </ul>
        </div>
      </MysticCard>

      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <PhotoSlot key={photo.id} photo={photo} />
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
          {uploadedCount} / {photos.length} fotoğraf yüklendi
        </span>
        <div className="flex gap-1">
          {photos.map((p) => (
            <div key={p.id} className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: p.base64 ? 'var(--gold)' : 'var(--border)' }} />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <MysticButton variant="ghost" onClick={() => setStep('personal')} className="flex-1">← Geri</MysticButton>
        <MysticButton onClick={() => setStep('intro')} disabled={uploadedCount < 1} className="flex-[2]">
          Devam Et →
        </MysticButton>
      </div>

      {uploadedCount < 1 && (
        <p className="text-center text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.6 }}>
          Devam etmek için en az bir fotoğraf yükleyin
        </p>
      )}
    </div>
  )
}
