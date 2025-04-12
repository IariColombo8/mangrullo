"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import translations from "@/translations"

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, options?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("es")

  useEffect(() => {
    // Check if there's a saved language preference
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0]
      if (["es", "en", "pt"].includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [])

  useEffect(() => {
    // Save language preference
    localStorage.setItem("language", language)
    // Update HTML lang attribute
    document.documentElement.lang = language
  }, [language])

  const t = (key: string, options?: Record<string, any>) => {
    // Split the key by dots to access nested properties
    const keys = key.split(".")

    // Get the translation object for the current language
    let translation: any = translations[language as keyof typeof translations]

    // Navigate through the nested properties
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k]
      } else {
        // If translation not found, return the key
        return key
      }
    }

    // If the translation is a string, return it
    if (typeof translation === "string") {
      // Replace placeholders with values from options
      if (options) {
        return Object.entries(options).reduce((acc, [key, value]) => {
          return acc.replace(new RegExp(`{{${key}}}`, "g"), String(value))
        }, translation)
      }
      return translation
    }

    // If translation not found or not a string, return the key
    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
