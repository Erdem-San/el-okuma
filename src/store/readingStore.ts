import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  WizardStep,
  PersonalInfo,
  StoredPhoto,
  ChatMessage,
  ReadingResult,
  ReadingSession,
} from '../types'

const HAND_PHOTO_SLOTS: StoredPhoto[] = [
  { id: 'left-front', label: 'Sol El — Ön Yüz' },
  { id: 'left-back', label: 'Sol El — Arka Yüz' },
  { id: 'right-front', label: 'Sağ El — Ön Yüz' },
  { id: 'right-back', label: 'Sağ El — Arka Yüz' },
]

function makeEmptySession(): ReadingSession {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    personalInfo: { firstName: '', lastName: '', age: '' },
    photos: HAND_PHOTO_SLOTS.map((p) => ({ ...p })),
    selfIntro: '',
    result: null,
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
  createSession: () => string
  setActiveSession: (id: string) => void
  deleteSession: (id: string) => void

  // Active session actions (operate on active session)
  setStep: (step: WizardStep) => void
  setPersonalInfo: (info: Partial<PersonalInfo>) => void
  updatePhoto: (id: string, data: Partial<StoredPhoto>) => void
  removePhoto: (id: string) => void
  setSelfIntro: (text: string) => void
  setResult: (result: ReadingResult) => void
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

      // ── Session management ──────────────────────────────────────────────

      createSession: () => {
        const s = makeEmptySession()
        set((state) => ({ sessions: [...state.sessions, s], activeSessionId: s.id }))
        return s.id
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) => {
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== id)
          const activeSessionId =
            state.activeSessionId === id
              ? sessions.length > 0
                ? sessions[sessions.length - 1].id
                : null
              : state.activeSessionId
          return { sessions, activeSessionId }
        })
      },

      // ── Active session actions ──────────────────────────────────────────

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
      name: 'elokuma-sessions-v2',
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
