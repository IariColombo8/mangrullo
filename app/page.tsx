"use client"

import dynamic from "next/dynamic"
import Hero from "@/components/home/hero"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import WhatsAppButton from "@/components/ui/whatsapp-button"
import { LanguageProvider } from "@/context/language-context"

const Gallery = dynamic(() => import("@/components/home/gallery"), {
  ssr: false,
  loading: () => <SectionPlaceholder />,
})

const Cabins = dynamic(() => import("@/components/home/cabins"), {
  ssr: false,
  loading: () => <SectionPlaceholder />,
})

const Activities = dynamic(() => import("@/components/home/activities"), {
  ssr: false,
  loading: () => <SectionPlaceholder />,
})

const Testimonials = dynamic(() => import("@/components/home/testimonials"), {
  ssr: false,
  loading: () => <SectionPlaceholder />,
})

const Contact = dynamic(() => import("@/components/home/contact"), {
  ssr: false,
  loading: () => <SectionPlaceholder />,
})

function SectionPlaceholder() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <Header />
      <main className="min-h-screen bg-beige flex-grow">
        <Hero />
        <Gallery />
        <Cabins />
        <Activities />
        <Testimonials />
        <Contact />
      </main>
      <WhatsAppButton />
      <Footer />
    </LanguageProvider>
  )
}
