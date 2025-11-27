import { create } from 'zustand'

export const useToastStore = create((set) => ({
  message: null,
  type: 'info',
  show(message, type = 'info') {
    set({ message, type })
    setTimeout(() => set({ message: null }), 2500)
  },
}))