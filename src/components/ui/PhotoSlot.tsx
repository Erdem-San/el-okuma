import { useRef } from 'react'
import { useImageUpload } from '../../hooks/useImageUpload'
import type { StoredPhoto } from '../../types'

interface PhotoSlotProps {
  photo: StoredPhoto
}

export function PhotoSlot({ photo }: PhotoSlotProps) {
  const { handleFileSelect, handleRemove } = useImageUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  const hasPhoto = Boolean(photo.preview || photo.base64)

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`photo-slot ${hasPhoto ? 'has-photo' : ''}`}
        onClick={() => !hasPhoto && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !hasPhoto && inputRef.current?.click()}
        aria-label={`${photo.label} yükle`}
      >
        {hasPhoto ? (
          <>
            <img src={photo.preview ?? photo.base64} alt={photo.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(photo.id) }}
                className="bg-red-900/80 hover:bg-red-800 text-white rounded-full p-2 transition"
                aria-label="Fotoğrafı kaldır"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="text-3xl opacity-30">🖐</div>
            <svg className="w-7 h-7 opacity-25" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>Yükle</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs leading-tight" style={{ color: hasPhoto ? 'var(--gold)' : 'var(--cream-dim)' }}>
        {hasPhoto && <span className="mr-1">✓</span>}
        {photo.label}
      </p>

      {!hasPhoto ? (
        <button onClick={() => inputRef.current?.click()} className="btn-mystic-ghost text-xs py-1.5 px-3" style={{ fontSize: 12 }}>
          Fotoğraf Seç
        </button>
      ) : (
        <button onClick={() => handleRemove(photo.id)} className="text-xs py-1 text-center transition" style={{ color: 'var(--cream-dim)', fontSize: 12 }}>
          Kaldır
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(photo.id, file)
          e.target.value = ''
        }}
        aria-hidden
      />
    </div>
  )
}
