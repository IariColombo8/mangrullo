"use client"
import { LanguageProvider } from "@/context/language-context"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}