// ─── Image Utils ─────────────────────────────────────────────────────────────

/**
 * Resmi canvas üzerinden sıkıştırır ve base64 döndürür.
 * Max boyut: 1024px, kalite: 0.85
 */
export async function compressImage(file: File, maxPx = 1024, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width)
            width = maxPx
          } else {
            width = Math.round((width * maxPx) / height)
            height = maxPx
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** base64 string'i sadece data kısmına (prefix olmadan) döndürür */
export function stripBase64Prefix(base64: string): string {
  const commaIdx = base64.indexOf(',')
  return commaIdx !== -1 ? base64.slice(commaIdx + 1) : base64
}

/** File'dan önizleme URL'i oluşturur */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}
