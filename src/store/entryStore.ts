'use client'

import { create } from 'zustand'
import { nanoid } from 'nanoid'

// エントリーの型
interface Entry {
  id: string
  date: string
  name: string
  price: string
  projectId: string
}

// Zustand ストアの型
interface EntryState {
  entries: Entry[]
  addEntry: (entry: Omit<Entry, 'id' | 'date'>) => void
  loadEntries: () => void
}

// Zustand ストアの定義
const useEntryStore = create<EntryState>((set) => ({
  // 初期状態は空配列とし、window チェックは loadEntries で行う
  entries: [],

  // ✅ エントリーを追加して localStorage に保存
  addEntry: (entry: Omit<Entry, 'id' | 'date'>) =>
    set((state) => {
      const newEntry: Entry = {
        ...entry,
        id: nanoid(),
        date: new Date().toISOString()
      }
      const updatedEntries = [...state.entries, newEntry]
      if (typeof window !== 'undefined') {
        localStorage.setItem('entries', JSON.stringify(updatedEntries))
      }
      return { entries: updatedEntries }
    }),

  // ✅ 初期化時に自動的にデータを読み込む
  loadEntries: () => {
    if (typeof window !== 'undefined') {
      try {
        const savedEntries = JSON.parse(localStorage.getItem('entries') || '[]')
        set({ entries: savedEntries })
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error)
        set({ entries: [] })
      }
    }
  }
}))

// ✅ ストアの初期化時に自動的にデータを読み込む
if (typeof window !== 'undefined') {
  useEntryStore.getState().loadEntries()
}

export default useEntryStore
