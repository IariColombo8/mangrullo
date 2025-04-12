"use client" // ¡No olvides esto!
import Hero from "@/components/home/hero"

import Gallery from "@/components/home/gallery"
import Cabins from "@/components/home/cabins"
import Activities from "@/components/home/activities"
import Testimonials from "@/components/home/testimonials"
import Contact from "@/components/home/contact"
import { LanguageProvider } from "@/context/language-context"

export default function Home() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-beige">
        <Hero />
        <Gallery />
        <Cabins />
        <Activities />
        <Testimonials />
        <Contact />
      </main>
    </LanguageProvider>
  )
}
