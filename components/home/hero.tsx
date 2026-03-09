"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

const PublicAvailabilitySearch = dynamic(
  () => import("@/components/booking/public-availability-search"),
  {
    ssr: false,
    loading: () => (
      <button className="bg-emerald-600 text-white font-semibold shadow-lg px-6 py-3 rounded-md">
        Consultar Disponibilidad
      </button>
    ),
  }
)

const slides = [
  {
    id: 1,
    image: "/2.jpg",
    title: "Bienvenido",
    subtitle: "Relajate, conectate con la naturaleza y sentite como en casa.",
  },
  {
    id: 2,
    image: "/8.jpg",
    title: "Tu descanso, nuestra prioridad",
    subtitle: "Elegí con quién venir, nosotros nos encargamos del resto.",
  },
  {
    id: 3,
    image: "/pileta 1.jpg",
    title: "Un rincón para desconectar y disfrutar.",
    subtitle: "Departamentos totalmente equipados, pensados para tu confort.",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setImagesLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section className="relative h-[100svh]" aria-label="Imágenes principales">
      <div className="relative h-full overflow-hidden">
        {/* Primera imagen - siempre renderizada, con priority */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            currentSlide === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slides[0].image}
            alt={slides[0].title}
            fill
            sizes="100vw"
            priority
            quality={60}
            className="object-cover"
          />
        </div>

        {/* Imágenes secundarias - carga diferida */}
        {imagesLoaded &&
          slides.slice(1).map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i + 1 === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              aria-hidden={i + 1 !== currentSlide}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                loading="lazy"
                quality={60}
                className="object-cover"
              />
            </div>
          ))}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40 z-20" />

        {/* Contenido de texto */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl">
            {slides[currentSlide].subtitle}
          </p>
          <PublicAvailabilitySearch />
        </div>
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Diapositiva siguiente"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
