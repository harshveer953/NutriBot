import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/authApi'

// Backend response shape:
// { success, message, user: { _id, name, email, token } }
// Token is INSIDE user object — extract and store separately

const useAuthStore = create(
  persist(
    (set) => ({
      user:      null,
      token:     null,
      loading:   false,
      error:     null,
      _hydrated: false,

      register: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const { data } = await authApi.register(credentials)
          // data.user.token is the JWT
          const { token, ...userWithoutToken } = data.user
          localStorage.setItem('nf_token', token)
          set({ user: userWithoutToken, token, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed'
          set({ error: msg, loading: false })
          return { success: false, error: msg }
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const { data } = await authApi.login(credentials)
          const { token, ...userWithoutToken } = data.user
          localStorage.setItem('nf_token', token)
          set({ user: userWithoutToken, token, loading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Invalid email or password'
          set({ error: msg, loading: false })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        localStorage.removeItem('nf_token')
        set({ user: null, token: null })
      },

      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nf_auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true
      },
    }
  )
)

export default useAuthStore
