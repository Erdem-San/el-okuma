import { useSessionsStore, useActiveSession } from '../store/readingStore'
import { compressImage, createPreviewUrl } from '../lib/imageUtils'

export function useImageUpload() {
  const { updatePhoto, removePhoto } = useSessionsStore()
  const session = useActiveSession()

  const handleFileSelect = async (photoId: string, file: File) => {
    if (!file.type.startsWith('image/')) return
    const preview = createPreviewUrl(file)
    const base64 = await compressImage(file)
    updatePhoto(photoId, { base64, preview })
  }

  const handleRemove = (photoId: string) => {
    removePhoto(photoId)
  }

  return { handleFileSelect, handleRemove, session }
}
