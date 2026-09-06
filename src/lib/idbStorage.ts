import type { StateStorage } from 'zustand/middleware'

const DB_NAME = 'elokuma_idb'
const STORE_NAME = 'keyval'

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await getDB()
      const val = await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(name)
        req.onsuccess = () => resolve(req.result ?? null)
        req.onerror = () => reject(req.error)
      })

      // If not found in IndexedDB, migrate from localStorage if present
      if (!val && typeof window !== 'undefined') {
        const localVal = localStorage.getItem(name)
        if (localVal) {
          await idbStorage.setItem(name, localVal)
          localStorage.removeItem(name)
          return localVal
        }
      }

      return val
    } catch (e) {
      console.warn('idbStorage.getItem error, falling back to localStorage:', e)
      return typeof window !== 'undefined' ? localStorage.getItem(name) : null
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.put(value, name)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch (e) {
      console.error('idbStorage.setItem error:', e)
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.delete(name)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch (e) {
      console.error('idbStorage.removeItem error:', e)
    }
  },
}
