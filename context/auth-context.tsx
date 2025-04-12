"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// This would be replaced with actual Firebase Auth in a real app
type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Simulate checking auth state on mount
  useEffect(() => {
    // Check if user is stored in localStorage (for demo purposes)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, any email/password combination works
      const newUser = {
        uid: "demo-user-id",
        email: email,
        displayName: "Demo User",
        photoURL: null,
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      router.push("/admin")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        uid: "google-user-id",
        email: "demo@gmail.com",
        displayName: "Google User",
        photoURL: null,
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      router.push("/admin")
    } catch (err) {
      setError("Google login failed. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUser(null)
      localStorage.removeItem("user")
      router.push("/login")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, error }}>
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
