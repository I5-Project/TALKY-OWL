import { create } from 'zustand'

type HeaderState =
  | { variant: 'logo'; transparent?: boolean }
  | { variant: 'title'; title: string; subtitle?: string; onBack?: () => void; transparent?: boolean }
  | null

interface HeaderStore {
  header: HeaderState
  setHeader: (header: HeaderState) => void
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  header: null,
  setHeader: (header) => set({ header }),
}))
