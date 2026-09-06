import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AdminDoc, DocCategory } from '../types'
import { idbStorage } from '../lib/idbStorage'

interface AdminStore {
  docs: AdminDoc[]
  activeCategory: DocCategory
  setActiveCategory: (category: DocCategory) => void
  addDoc: (doc: AdminDoc) => void
  removeDoc: (id: string) => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      docs: [],
      activeCategory: 'palm',
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      addDoc: (doc) => set((s) => ({
        // Varsa aynı isimliyi güncelle, yoksa ekle
        docs: [...s.docs.filter((d) => d.id !== doc.id && d.name !== doc.name), doc],
      })),
      removeDoc: (id) => set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),
    }),
    {
      name: 'elokuma-admin-docs-v2',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
