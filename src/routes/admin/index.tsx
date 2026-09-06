import { useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAdminStore } from '../../store/adminStore'
import type { AdminDoc } from '../../types'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

// Proje içindeki pdfler klasöründe bulunan varsayılan hazır kitaplar
const PRESET_PDFS = [
  {
    name: "Cheiro's Language of the Hand (1897 - B/W)",
    path: '/pdfler/cheiroslanguageo00hamo_bw.pdf',
    fileName: 'cheiroslanguageo00hamo_bw.pdf',
  },
  {
    name: 'Palmistry For All - Cheiro (Text)',
    path: '/pdfler/2015.219079.Palmistry-For_text.pdf',
    fileName: '2015.219079.Palmistry-For_text.pdf',
  },
  {
    name: 'The Laws of Scientific Hand Reading - Benham',
    path: '/pdfler/2015.200302.The-Laws_text.pdf',
    fileName: '2015.200302.The-Laws_text.pdf',
  },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function DeleteDocModal({
  doc,
  onConfirm,
  onCancel,
}: {
  doc: AdminDoc
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
      <div className="mystic-card p-6 w-full max-w-xs space-y-4 animate-fade-in-up" style={{ border: '1px solid var(--border-gold)' }}>
        <div className="text-center space-y-2">
          <div className="text-3xl">📄</div>
          <h3 className="font-serif text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>
            Emin misiniz?
          </h3>
          <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
            <span className="font-medium" style={{ color: 'var(--gold)' }}>{doc.name}</span> dosyası referans listesinden kaldırılacak.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-mystic-ghost flex-1">İptal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl py-3 font-semibold text-sm transition active:scale-95"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminPage() {
  const navigate = useNavigate()
  const { docs, addDoc, removeDoc } = useAdminStore()
  const [deleteTarget, setDeleteTarget] = useState<AdminDoc | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Otomatik senkron: pdfler klasöründeki dosyaları kontrol et
  const loadPresetDoc = async (preset: typeof PRESET_PDFS[0]) => {
    if (docs.some(d => d.name === preset.fileName || d.name === preset.name)) {
      return // Zaten yüklü
    }
    setLoadingPreset(preset.fileName)
    try {
      const res = await fetch(preset.path)
      if (!res.ok) throw new Error('Dosya sunucudan çekilemedi')
      const blob = await res.blob()
      const base64 = await blobToBase64(blob)
      const doc: AdminDoc = {
        id: crypto.randomUUID(),
        name: preset.fileName,
        size: blob.size,
        uploadedAt: Date.now(),
        base64,
        mimeType: 'application/pdf',
      }
      addDoc(doc)
    } catch (err) {
      console.error('Preset yükleme hatası:', err)
      setError(`${preset.name} yüklenirken hata oluştu.`)
    } finally {
      setLoadingPreset(null)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
          setError('Sadece PDF dosyaları yüklenebilir.')
          continue
        }
        if (file.size > 100 * 1024 * 1024) {
          setError(`"${file.name}" çok büyük (max 100MB).`)
          continue
        }
        const base64 = await readAsBase64(file)
        const doc: AdminDoc = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          uploadedAt: Date.now(),
          base64,
          mimeType: file.type || 'application/pdf',
        }
        addDoc(doc)
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const sorted = [...docs].sort((a, b) => b.uploadedAt - a.uploadedAt)

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-40 safe-top"
        style={{ background: 'rgba(8,5,3,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 transition" style={{ color: 'var(--cream-dim)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Ana Sayfa</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <span className="font-serif text-base font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)' }}>
            Admin & Kütüphane
          </span>
        </div>

        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col px-5 py-8 max-w-xl mx-auto w-full">
        <div className="my-auto w-full space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-serif text-gradient-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              El Falı Rehber Kütüphanesi
            </h1>
            <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
              Yapay zekanın el analizinde baz alacağı PDF kitapları ve kaynakları buradan yönetin.
            </p>
          </div>

          {/* pdfler klasöründeki hazır kitaplar */}
          <div className="mystic-card p-5 space-y-3" style={{ border: '1px solid var(--border-gold)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                📁 Projedeki Hazır Kitaplar (pdfler Klasörü)
              </p>
              <span className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.6 }}>3 Kitap Mevcut</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--cream-dim)' }}>
              Aşağıdaki kitaplar klasörünüzde hazır bekliyor. Tek tıkla yapay zekanın aktif hafızasına ekleyebilirsiniz:
            </p>

            <div className="space-y-2 pt-1">
              {PRESET_PDFS.map((preset) => {
                const isLoaded = docs.some(d => d.name === preset.fileName)
                const isLoading = loadingPreset === preset.fileName

                return (
                  <div key={preset.fileName} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-amber-900/20">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--cream)' }}>
                        {preset.name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>
                        {preset.fileName}
                      </p>
                    </div>

                    {isLoaded ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                        ✓ Hafızada
                      </span>
                    ) : (
                      <button
                        onClick={() => loadPresetDoc(preset)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-lg transition active:scale-95 font-medium flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(135deg, rgba(138,92,42,0.4), rgba(201,169,110,0.3))',
                          border: '1px solid var(--border-gold)',
                          color: 'var(--gold)',
                        }}
                      >
                        {isLoading ? 'Ekleniyor...' : '+ Hafızaya Al'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upload Zone */}
          <div
            className="rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer"
            style={{ borderColor: 'var(--border-gold)', background: 'rgba(201,169,110,0.03)' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="space-y-2">
                <div className="text-3xl animate-pulse">📄</div>
                <p className="text-sm" style={{ color: 'var(--gold)' }}>PDF okunuyor ve kaydediliyor...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📥</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>
                    Farklı bir PDF dosyası sürükleyin veya tıklayın
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--cream-dim)', opacity: 0.5 }}>
                    Maksimum 100MB · PDF formatı
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: 'var(--gold)', fontSize: 13 }}>
                  + Yeni Dosya Seç
                </div>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)} />

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Docs list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>
                Yapay Zekanın Aktif Rehberleri ({sorted.length})
              </p>
              {sorted.length > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--gold)', opacity: 0.8 }}>
                  ● Fal bakarken bu kitaplar taranıyor
                </span>
              )}
            </div>

            {sorted.length === 0 ? (
              <div className="text-center py-6 space-y-2 rounded-xl border border-dashed border-neutral-800">
                <div className="text-3xl opacity-30">📂</div>
                <p className="text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.5 }}>
                  Aktif kitap seçilmedi. Yukarıdaki hazır kitaplardan "+ Hafızaya Al" butonuna basarak hemen ekleyin.
                </p>
              </div>
            ) : (
              sorted.map((doc) => (
                <div key={doc.id} className="mystic-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid var(--border-gold)' }}>
                    📖
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--cream)' }}>{doc.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--cream-dim)', opacity: 0.4 }}>
                      {formatBytes(doc.size)} · Aktif Kullanımda
                    </p>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(doc)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
                    aria-label="Dosyayı kaldır"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {deleteTarget && (
        <DeleteDocModal
          doc={deleteTarget}
          onConfirm={() => { removeDoc(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
