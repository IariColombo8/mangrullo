"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.cabins": "Departamentos",
    "nav.activities": "Actividades",
    "nav.testimonials": "Testimonios",
    "nav.contact": "Contacto",
    "nav.admin": "Admin",

    // Hero
    "hero.bookNow": "Reservar Ahora",

    // Cabins
    "cabins.title": "Nuestros Departamentos",
    "cabins.subtitle": "Espacios cómodos y bien equipados para tu estadía",
    "cabins.bookOnBooking": "Reservar en Booking.com",
    "cabins.viewDetails": "Ver Detalles",
    "cabins.features": "Características",
    "cabins.capacity": "Capacidad",
    "cabins.bedrooms": "Habitaciones",
    "cabins.bathrooms": "Baños",

    // Activities
    "activities.title": "Actividades y Atracciones",
    "activities.subtitle": "Descubre todo lo que puedes hacer en la zona",

    // Contact
    "contact.title": "Contacto",
    "contact.subtitle": "Estamos aquí para ayudarte",
    "contact.name": "Nombre",
    "contact.email": "Email",
    "contact.message": "Mensaje",
    "contact.send": "Enviar Mensaje",

    // Testimonials
    "testimonials.title": "Lo que dicen nuestros huéspedes",
    "testimonials.subtitle": "Experiencias reales de quienes nos visitaron",

    // Footer
    "footer.rights": "Todos los derechos reservados",
    "footer.followUs": "Síguenos",

    // Admin
    "admin.dashboard.welcome": "¡Bienvenido de vuelta!",
    "admin.dashboard.description": "Aquí tienes un resumen de lo que está pasando hoy.",
    "admin.dashboard.cabins": "Departamentos",
    "admin.dashboard.bookings": "Reservas",
    "admin.dashboard.testimonials": "Testimonios",
    "admin.dashboard.activities": "Actividades",
    "admin.tabs.cabins": "Departamentos",
    "admin.tabs.bookings": "Reservas",
    "admin.tabs.testimonials": "Testimonios",
    "admin.tabs.activities": "Actividades",
    "admin.tabs.settings": "Configuración",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.cabins": "Apartments",
    "nav.activities": "Activities",
    "nav.testimonials": "Testimonials",
    "nav.contact": "Contact",
    "nav.admin": "Admin",

    // Hero
    "hero.bookNow": "Book Now",

    // Cabins
    "cabins.title": "Our Apartments",
    "cabins.subtitle": "Comfortable and well-equipped spaces for your stay",
    "cabins.bookOnBooking": "Book on Booking.com",
    "cabins.viewDetails": "View Details",
    "cabins.features": "Features",
    "cabins.capacity": "Capacity",
    "cabins.bedrooms": "Bedrooms",
    "cabins.bathrooms": "Bathrooms",

    // Activities
    "activities.title": "Activities and Attractions",
    "activities.subtitle": "Discover everything you can do in the area",

    // Contact
    "contact.title": "Contact",
    "contact.subtitle": "We're here to help",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",

    // Testimonials
    "testimonials.title": "What our guests say",
    "testimonials.subtitle": "Real experiences from those who visited us",

    // Footer
    "footer.rights": "All rights reserved",
    "footer.followUs": "Follow us",

    // Admin
    "admin.dashboard.welcome": "Welcome back!",
    "admin.dashboard.description": "Here's a summary of what's happening today.",
    "admin.dashboard.cabins": "Apartments",
    "admin.dashboard.bookings": "Bookings",
    "admin.dashboard.testimonials": "Testimonials",
    "admin.dashboard.activities": "Activities",
    "admin.tabs.cabins": "Apartments",
    "admin.tabs.bookings": "Bookings",
    "admin.tabs.testimonials": "Testimonials",
    "admin.tabs.activities": "Activities",
    "admin.tabs.settings": "Settings",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.es] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
