"use client"

import { AuthProvider } from "@/context/auth-context"
import { LanguageProvider } from "@/context/language-context"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  )
}
