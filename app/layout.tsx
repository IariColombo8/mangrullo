import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import ClientProviders from "@/components/client-providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "El Mangrullo | Departamentos en Federación, Entre Ríos",
  description:
    "Departamentos totalmente equipados en Federación, Entre Ríos. Pileta, WiFi, aire acondicionado. Cerca de las Termas. Reserva tu estadía ideal.",
  metadataBase: new URL("https://mangrullo.vercel.app/"),
  keywords: [
    "departamentos federación",
    "alojamiento federación entre ríos",
    "cabañas federación",
    "termas federación",
    "el mangrullo",
    "hospedaje federación",
    "alquiler temporario federación",
  ],
  authors: [{ name: "El Mangrullo" }],
  openGraph: {
    title: "El Mangrullo | Departamentos en Federación, Entre Ríos",
    description:
      "Departamentos totalmente equipados en Federación, Entre Ríos. Pileta, WiFi, aire acondicionado. Reserva tu estadía ideal.",
    url: "https://mangrullo.vercel.app/",
    siteName: "El Mangrullo",
    images: [
      {
        url: "/metadatos.png",
        width: 1600,
        height: 837,
        alt: "El Mangrullo - Departamentos en Federación",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Mangrullo | Departamentos en Federación, Entre Ríos",
    description:
      "Departamentos totalmente equipados en Federación, Entre Ríos. Reserva tu estadía ideal.",
    images: ["/metadatos.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mangrullo.vercel.app/",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "El Mangrullo",
  description:
    "Departamentos totalmente equipados en Federación, Entre Ríos. Pileta, WiFi, aire acondicionado.",
  url: "https://mangrullo.vercel.app/",
  image: "https://mangrullo.vercel.app/metadatos.png",
  telephone: "+54 9 3456 551550",
  email: "elmangrullofederacion@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Coronel J. M. Salas",
    addressLocality: "Federación",
    addressRegion: "Entre Ríos",
    addressCountry: "AR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -30.972914774953384,
    longitude: -57.94400812437604,
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Piscina", value: true },
    { "@type": "LocationFeatureSpecification", name: "Aire acondicionado", value: true },
  ],
  priceRange: "$$",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
