// ─── Types ──────────────────────────────────────────────────────────────────

export interface PersonalInfo {
  firstName: string
  lastName: string
  age: string
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

// Serileştirilebilir fotoğraf (File nesnesi hariç)
export interface StoredPhoto {
  id: string
  label: string
  base64?: string
  preview?: string
}

export interface ReadingSession {
  id: string
  createdAt: number
  updatedAt: number
  personalInfo: PersonalInfo
  photos: StoredPhoto[]
  selfIntro: string
  result: ReadingResult | null
  chatHistory: ChatMessage[]
  step: WizardStep
}

// Admin
export interface AdminDoc {
  id: string
  name: string
  size: number
  uploadedAt: number
  base64: string
  mimeType: string
}
