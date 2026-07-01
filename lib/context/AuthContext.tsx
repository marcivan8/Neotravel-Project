'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import AuthModal from '@/components/AuthModal'

export interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, name: string) => void
  logout: () => void
  openAuth: (mode?: 'login' | 'signup') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    // Load current user from localStorage on mount
    const savedUser = localStorage.getItem('neo_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('neo_user')
      }
    }
  }, [])

  const login = (email: string, name: string) => {
    const newUser = { email, name }
    setUser(newUser)
    localStorage.setItem('neo_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('neo_user')
  }

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, openAuth }}>
      {children}
      {isAuthOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
