"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/language-context"

// This would come from your CMS in a real app
const slides = [
  {
    id: 1,
    image: "foto 7.jpg",
    title: {
      es: "Bienvenido",
      en: "Welcome",
      pt: "Bem-vindo",
    },
    subtitle: {
      es: "Relajate, conectate con la naturaleza y sentite como en casa.",
      en: "Your home away from home in Federación, Entre Ríos",
      pt: "Sua casa longe de casa em Federación, Entre Ríos",
    },
  },
  {
    id: 2,
    image: "foto 3.jpg",
    title: {
      es: "Tu descanso, nuestra prioridad",
      en: "Luxury Cabins",
      pt: "Cabanas de Luxo",
    },
    subtitle: {
      es: "Elegí con quién venir, nosotros nos encargamos del resto.",
      en: "Comfort and nature in perfect harmony",
      pt: "Conforto e natureza em perfeita harmonia",
    },
  },
  {
    id: 3,
    image: "foto 4.jpg",
    title: {
      es: "Un rincón para desconectar y disfrutar.",
      en: "Unforgettable Experiences",
      pt: "Experiências Inesquecíveis",
    },
    subtitle: {
      es: "Departamentos totalmente equipados, pensados para tu confort.",
      en: "Discover the beauty of Entre Ríos",
      pt: "Descubra a beleza de Entre Ríos",
    },
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { language, t } = useLanguage()

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-screen">
      {/* Carousel */}
      <div className="relative h-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title[language as keyof typeof slide.title]}
              fill
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl">
                {slide.title[language as keyof typeof slide.title]}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl">
                {slide.subtitle[language as keyof typeof slide.subtitle]}
              </p>
              <Button
                size="lg"
                className="bg-green hover:bg-green/90 text-white"
                onClick={() => window.open("https://www.booking.com", "_blank")}
              >
                {t("hero.bookNow")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
