"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAdmin?: boolean
  createdAt?: string
  lastLogin?: string
} | null

type AuthContextType = {
  user: User
  loading: boolean
  userCount: number | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  makeAdmin: (userId: string) => Promise<boolean>
  revokeAdmin: (userId: string) => Promise<boolean>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function getFirebaseAuth() {
  const { auth, googleProvider } = await import("@/lib/firebase")
  const { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } = await import("firebase/auth")
  return { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged }
}

async function getFirebaseFirestore() {
  const { db } = await import("@/lib/firebase")
  const { doc, setDoc, getDoc, updateDoc, increment } = await import("firebase/firestore")
  return { db, doc, setDoc, getDoc, updateDoc, increment }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)
  const router = useRouter()

  const updateUserCounter = async (operation: 'increment' | 'decrement') => {
    try {
      const { db, doc, updateDoc, increment, getDoc } = await getFirebaseFirestore()
      const counterRef = doc(db, "counters", "users")
      await updateDoc(counterRef, {
        count: operation === 'increment' ? increment(1) : increment(-1)
      })
      const counterSnap = await getDoc(counterRef)
      setUserCount(counterSnap.data()?.count || 0)
    } catch (err) {
      console.error("Error updating user counter:", err)
    }
  }

  const saveUserToFirestore = async (firebaseUser: any) => {
    const { db, doc, setDoc, getDoc } = await getFirebaseFirestore()
    const userRef = doc(db, "users", firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    const isAdmin = userSnap.exists() ? userSnap.data()?.isAdmin || false : false

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      photoURL: firebaseUser.photoURL,
      isAdmin,
      createdAt: userSnap.data()?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    try {
      await setDoc(userRef, userData, { merge: true })
      if (!userSnap.exists()) {
        await updateUserCounter('increment')
      }
    } catch (err) {
      console.error("Error saving user to Firestore:", err)
      throw err
    }
  }

  const makeAdmin = async (userId: string) => {
    if (!user?.isAdmin) {
      throw new Error("No tienes permisos de administrador")
    }
    const { db, doc, setDoc } = await getFirebaseFirestore()
    const userRef = doc(db, "users", userId)
    try {
      await setDoc(userRef, { isAdmin: true }, { merge: true })
      if (user?.uid === userId) {
        setUser(prev => prev ? { ...prev, isAdmin: true } : null)
      }
      return true
    } catch (err) {
      console.error("Error making user admin:", err)
      throw err
    }
  }

  const revokeAdmin = async (userId: string) => {
    if (!user?.isAdmin) {
      throw new Error("No tienes permisos de administrador")
    }
    const { db, doc, setDoc } = await getFirebaseFirestore()
    const userRef = doc(db, "users", userId)
    try {
      await setDoc(userRef, { isAdmin: false }, { merge: true })
      if (user?.uid === userId) {
        setUser(prev => prev ? { ...prev, isAdmin: false } : null)
      }
      return true
    } catch (err) {
      console.error("Error revoking admin privileges:", err)
      throw err
    }
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      try {
        const { auth, onAuthStateChanged } = await getFirebaseAuth()
        const { db, doc, getDoc } = await getFirebaseFirestore()

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              await saveUserToFirestore(firebaseUser)
              const userRef = doc(db, "users", firebaseUser.uid)
              const userSnap = await getDoc(userRef)

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isAdmin: userSnap.data()?.isAdmin || false,
                createdAt: userSnap.data()?.createdAt,
                lastLogin: new Date().toISOString()
              })
            } catch (err) {
              console.error("Error during auth state change:", err)
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        const counterRef = doc(db, "counters", "users")
        const counterSnap = await getDoc(counterRef)
        setUserCount(counterSnap.exists() ? counterSnap.data()?.count : 0)
      } catch (err) {
        console.error("Error initializing auth:", err)
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { auth, signInWithEmailAndPassword } = await getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code))
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      const { auth, googleProvider, signInWithPopup } = await getFirebaseAuth()
      await signInWithPopup(auth, googleProvider)
      router.push("/")
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code))
      console.error("Google login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const { auth, signOut } = await getFirebaseAuth()
      await signOut(auth)
      router.push("/login")
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(getFirebaseErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/operation-not-allowed":
        return "El método de autenticación no está habilitado."
      case "auth/invalid-email":
        return "El correo electrónico no es válido."
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada."
      case "auth/user-not-found":
        return "No se encontró una cuenta con este correo electrónico."
      case "auth/wrong-password":
        return "Contraseña incorrecta."
      default:
        return "Ocurrió un error durante la autenticación."
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      userCount,
      login,
      loginWithGoogle,
      logout,
      makeAdmin,
      revokeAdmin,
      error
    }}>
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
