import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  WizardStep,
  PersonalInfo,
  StoredPhoto,
  ChatMessage,
  ReadingResult,
  ReadingSession,
  SessionType,
  HoroscopeResult,
} from '../types'

const HAND_PHOTO_SLOTS: StoredPhoto[] = [
  { id: 'left-front', label: 'Sol El — Ön Yüz' },
  { id: 'left-back', label: 'Sol El — Arka Yüz' },
  { id: 'right-front', label: 'Sağ El — Ön Yüz' },
  { id: 'right-back', label: 'Sağ El — Arka Yüz' },
]

function makeEmptySession(sessionType: SessionType = 'palm'): ReadingSession {
  return {
    id: crypto.randomUUID(),
    sessionType,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personalInfo: {
      firstName: '',
      lastName: '',
      age: '',
      birthDate: { day: '1', month: '1', year: '1995' },
    },
    photos: HAND_PHOTO_SLOTS.map((p) => ({ ...p })),
    selfIntro: '',
    result: null,
    horoscopeResult: null,
    chatHistory: [],
    step: 'personal',
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface SessionsStore {
  sessions: ReadingSession[]
  activeSessionId: string | null
  isLoading: boolean

  // Session management
  createSession: (sessionType?: SessionType) => string
  setActiveSession: (id: string) => void
  deleteSession: (id: string) => void

  // Active session actions (operate on active session)
  setStep: (step: WizardStep) => void
  setPersonalInfo: (info: Partial<PersonalInfo>) => void
  updatePhoto: (id: string, data: Partial<StoredPhoto>) => void
  removePhoto: (id: string) => void
  setSelfIntro: (text: string) => void
  setResult: (result: ReadingResult) => void
  setHoroscopeResult: (result: HoroscopeResult) => void
  addChatMessage: (msg: ChatMessage) => void
  setIsLoading: (loading: boolean) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updateActive(
  sessions: ReadingSession[],
  activeId: string | null,
  updater: (s: ReadingSession) => ReadingSession,
): ReadingSession[] {
  if (!activeId) return sessions
  return sessions.map((s) => (s.id === activeId ? { ...updater(s), updatedAt: Date.now() } : s))
}

// ─── Store definition ────────────────────────────────────────────────────────

export const useSessionsStore = create<SessionsStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      isLoading: false,

      createSession: (sessionType: SessionType = 'palm') => {
        const newSession = makeEmptySession(sessionType)
        set((s) => ({
          sessions: [newSession, ...s.sessions],
          activeSessionId: newSession.id,
        }))
        return newSession.id
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) =>
        set((s) => {
          const filtered = s.sessions.filter((sess) => sess.id !== id)
          return {
            sessions: filtered,
            activeSessionId: s.activeSessionId === id ? (filtered[0]?.id ?? null) : s.activeSessionId,
          }
        }),

      setStep: (step) =>
        set((s) => ({ sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({ ...sess, step })) })),

      setPersonalInfo: (info) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({
            ...sess,
            personalInfo: { ...sess.personalInfo, ...info },
          })),
        })),

      updatePhoto: (id, data) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({
            ...sess,
            photos: sess.photos.map((p) => (p.id === id ? { ...p, ...data } : p)),
          })),
        })),

      removePhoto: (id) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({
            ...sess,
            photos: sess.photos.map((p) =>
              p.id === id ? { id: p.id, label: p.label } : p
            ),
          })),
        })),

      setSelfIntro: (text) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({ ...sess, selfIntro: text })),
        })),

      setResult: (result) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({ ...sess, result })),
        })),

      setHoroscopeResult: (horoscopeResult) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({ ...sess, horoscopeResult })),
        })),

      addChatMessage: (msg) =>
        set((s) => ({
          sessions: updateActive(s.sessions, s.activeSessionId, (sess) => ({
            ...sess,
            chatHistory: [...sess.chatHistory, msg],
          })),
        })),

      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'elokuma-sessions-v3',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
)

// ─── Selectors ───────────────────────────────────────────────────────────────

export function useActiveSession(): ReadingSession | null {
  const { sessions, activeSessionId } = useSessionsStore()
  return sessions.find((s) => s.id === activeSessionId) ?? null
}
