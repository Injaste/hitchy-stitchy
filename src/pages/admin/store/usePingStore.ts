import { create } from 'zustand'

interface PingState {
  isOpen: boolean
  targetRoleId: string | null
  open: (roleId?: string) => void
  close: () => void
}

export const usePingStore = create<PingState>((set) => ({
  isOpen: false,
  targetRoleId: null,
  open: (roleId) => set({ isOpen: true, targetRoleId: roleId ?? null }),
  close: () => set({ isOpen: false, targetRoleId: null }),
}))
