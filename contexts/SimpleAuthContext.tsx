"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedUser = localStorage.getItem('user')
    console.log('localStorage user:', savedUser)
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('Parsed user:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.log('Erro ao parsear user:', error)
        localStorage.removeItem('user')
      }
    } else {
      console.log('Nenhum usuário no localStorage')
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer login')
      }

      const { user } = await response.json()
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, login, logout, isLoading: true, setUser }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}