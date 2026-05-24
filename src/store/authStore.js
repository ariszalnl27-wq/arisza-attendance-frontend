import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      needsProfileCompletion: false,

      setAuth: (user, accessToken, refreshToken, needsProfileCompletion = false) =>
        set({ user, accessToken, refreshToken, needsProfileCompletion }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((s) => ({ user: { ...s.user, ...partial } })),

      clearProfileCompletion: () =>
        set({ needsProfileCompletion: false }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null, needsProfileCompletion: false }),
    }),
    {
      name: 'library-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        needsProfileCompletion: s.needsProfileCompletion,
      }),
    }
  )
)
