import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AdminDoc } from '../types'
import { idbStorage } from '../lib/idbStorage'

interface AdminStore {
  docs: AdminDoc[]
  addDoc: (doc: AdminDoc) => void
  removeDoc: (id: string) => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      docs: [],
      addDoc: (doc) => set((s) => ({ docs: [...s.docs, doc] })),
      removeDoc: (id) => set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),
    }),
    {
      name: 'elokuma-admin-docs',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
