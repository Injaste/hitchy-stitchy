import { create } from 'zustand'

export interface ActiveCue {
  id: string
  title: string
  timeStart: string
  dayId: string
}

interface CueState {
  activeCue: ActiveCue | null
  isCueModalOpen: boolean
  setActiveCue: (cue: ActiveCue | null) => void
  openCueModal: () => void
  closeCueModal: () => void
}

export const useCueStore = create<CueState>((set) => ({
  activeCue: null,
  isCueModalOpen: false,
  setActiveCue: (cue) => set({ activeCue: cue }),
  openCueModal: () => set({ isCueModalOpen: true }),
  closeCueModal: () => set({ isCueModalOpen: false }),
}))
