"use client"

import { AuthProvider } from "@/context/auth-context"
import { LanguageProvider } from "@/context/language-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  )
}
