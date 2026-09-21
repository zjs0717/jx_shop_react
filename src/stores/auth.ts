import { create } from 'zustand'
import { clearToken as clearStoredToken, getToken, setToken as persistToken } from '@/api/request'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  setToken: (token) => {
    persistToken(token)
    set({ token })
  },
  logout: () => {
    clearStoredToken()
    set({ token: null })
  },
}))
