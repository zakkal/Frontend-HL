import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from '../lib/api'

interface AuthState {
  token: string | null
  user: { id: string; email: string } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateToken: (newToken: string) => void
}

const AuthContext = createContext<AuthState>({} as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hl_token'))
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('hl_user') || 'null'))

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    localStorage.setItem('hl_token', data.access_token)
    localStorage.setItem('hl_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
  }

  const logout = async () => {
    try { await api.logout() } catch {}
    localStorage.removeItem('hl_token')
    localStorage.removeItem('hl_user')
    setToken(null)
    setUser(null)
  }

  const updateToken = (newToken: string) => {
    localStorage.setItem('hl_token', newToken)
    setToken(newToken)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
