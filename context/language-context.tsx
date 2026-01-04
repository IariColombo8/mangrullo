"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface LanguageContextType {
  t: (key: string) => string
}

const translations: Record<string, string> = {
  // Navigation
  "nav.home": "Inicio",
  "nav.cabins": "Departamentos",
  "nav.activities": "Actividades",
  "nav.testimonials": "Testimonios",
  "nav.contact": "Contacto",
  "nav.admin": "Admin",
  "nav.login": "Iniciar Sesión",
  "nav.gallery": "Galería",

  // Hero
  "hero.bookNow": "Reservar Ahora",

  // Cabins
  "cabins.title": "Nuestros Departamentos",
  "cabins.subtitle": "Espacios cómodos y bien equipados para tu estadía",
  "cabins.bookOnBooking": "Reservar en Booking",
  "cabins.viewDetails": "Ver Detalles",
  "cabins.details": "Detalles",
  "cabins.perNight": "por noche",
  "cabins.features": "Características",
  "cabins.capacity": "Capacidad",
  "cabins.bedrooms": "Habitaciones",
  "cabins.bathrooms": "Baños",
  "cabins.bookNow": "Reservar Ahora",
  "cabins.modal.details": "Detalles",
  "cabins.modal.amenities": "Amenidades",
  "cabins.modal.availability": "Disponibilidad",
  "cabins.modal.description": "Descripción",
  "cabins.modal.checkAvailability": "Consultar Disponibilidad",
  "cabins.modal.booked": "Reservado",
  "cabins.modal.available": "Disponible",
  "cabins.amenities.wifi": "WiFi",
  "cabins.amenities.ac": "Aire Acondicionado",
  "cabins.amenities.pets": "Se Admiten Mascotas",
  "cabins.amenities.kitchen": "Cocina",

  // Activities
  "activities.title": "Actividades y Atracciones",
  "activities.subtitle": "Descubre todo lo que puedes hacer en la zona",
  "activities.distance": "Distancia",
  "activities.close": "Cerrar",

  // Contact
  "contact.title": "Contacto",
  "contact.subtitle": "Estamos aquí para ayudarte",
  "contact.infoTitle": "Información de Contacto",
  "contact.info.address": "Dirección",
  "contact.info.phone": "Teléfono",
  "contact.info.email": "Email",
  "contact.name": "Nombre",
  "contact.email": "Email",
  "contact.message": "Mensaje",
  "contact.send": "Enviar Mensaje",
  "contact.successTitle": "Mensaje Enviado",
  "contact.successMessage": "Gracias por contactarnos. Te responderemos pronto.",
  "contact.errorTitle": "Error",
  "contact.errorMessage": "Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.",

  // Testimonials
  "testimonials.title": "Lo que dicen nuestros huéspedes",
  "testimonials.subtitle": "Experiencias reales de quienes nos visitaron",

  // Gallery
  "gallery.title": "Galería",
  "gallery.subtitle": "Explora nuestras instalaciones y alrededores",
  "gallery.filters.all": "Todos",
  "gallery.filters.cabins": "Cabañas",
  "gallery.filters.pool": "Piscina",
  "gallery.filters.surroundings": "Alrededores",

  // Footer
  "footer.rights": "Todos los derechos reservados",
  "footer.followUs": "Síguenos",
  "footer.about":
    "Descubre la tranquilidad y el confort en El Mangrullo, tu hogar lejos de casa en Federación, Entre Ríos.",
  "footer.quickLinks": "Enlaces Rápidos",
  "footer.contactUs": "Contáctanos",

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

  // Common
  Galeria: "Galería",
  Cabañas: "Cabañas",
  Actividades: "Actividades",
  Contacto: "Contacto",
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const t = (key: string): string => {
    return translations[key] || key
  }

  return <LanguageContext.Provider value={{ t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
