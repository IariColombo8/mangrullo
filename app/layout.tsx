import type React from "react"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import WhatsAppButton from "@/components/ui/whatsapp-button"
import { AuthProvider } from "@/context/auth-context"
import ClientProviders from "@/components/client-providers" // Crearemos este componente

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata = {
  title: "El Mangrullo - Cabañas",
  description: "El Mangrullo - Su hogar lejos de casa",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          <AuthProvider>
            <Header />
            <div className="flex-grow">{children}</div>
            <WhatsAppButton />
            <Footer />
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  )
}