import { create } from 'zustand'

interface UserStore {
  currency: string
  setCurrency: (currency: string) => void
  needOnboarding: boolean | null
  setNeedOnboarding: (needOnboarding: boolean | null) => void
}

export const useUserStore = create<UserStore>(set => ({
  currency: 'BDT',
  setCurrency: currency => set({ currency }),
  needOnboarding: null,
  setNeedOnboarding: needOnboarding => set({ needOnboarding }),
}))
