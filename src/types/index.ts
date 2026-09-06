// ─── Types ──────────────────────────────────────────────────────────────────

export interface BirthDate {
  day: string
  month: string
  year: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  age: string
  birthDate?: BirthDate
  birthTime?: string // Burç için isteğe bağlı saat
}

export interface HandPhoto {
  id: string
  label: string
  file?: File
  base64?: string
  preview?: string
}

export type WizardStep =
  | 'personal'
  | 'photos'
  | 'intro'
  | 'loading'
  | 'result'
  | 'chat'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ReadingResult {
  headline: string
  sections: ReadingSection[]
  summary: string
}

export interface ReadingSection {
  title: string
  icon: string
  content: string
}

// Numeroloji ve Burç Sonucu
export interface HoroscopeResult {
  zodiacSign: string
  zodiacElement: string
  lifePathNumber: number
  isMasterNumber: boolean
  lifePathTitle: string
  nameDestinyNumber: number
  headline: string
  summary: string
  sections: ReadingSection[]
}

// Serileştirilebilir fotoğraf (File nesnesi hariç)
export interface StoredPhoto {
  id: string
  label: string
  base64?: string
  preview?: string
}

export type SessionType = 'palm' | 'horoscope'

export interface ReadingSession {
  id: string
  sessionType?: SessionType
  createdAt: number
  updatedAt: number
  personalInfo: PersonalInfo
  photos: StoredPhoto[]
  selfIntro: string
  result: ReadingResult | null
  horoscopeResult?: HoroscopeResult | null
  chatHistory: ChatMessage[]
  step: WizardStep
}

// Admin Dosyaları & Kategori İzolasyonu
export type DocCategory = 'palm' | 'horoscope'

export interface AdminDoc {
  id: string
  name: string
  size: number
  uploadedAt: number
  base64: string
  mimeType: string
  category: DocCategory
}
