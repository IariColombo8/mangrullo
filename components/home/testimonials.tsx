"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/language-context"

// This would come from your Firebase in a real app
const testimonials = [
  {
    id: 1,
    name: "María Rodríguez",
    location: "Buenos Aires, Argentina",
    rating: 5,
    text: {
      es: "Pasamos unas vacaciones increíbles en El Mangrullo. Las cabañas son hermosas y el entorno natural es espectacular. Volveremos pronto!",
      en: "We had an amazing vacation at El Mangrullo. The cabins are beautiful and the natural environment is spectacular. We will be back soon!",
      pt: "Passamos férias incríveis em El Mangrullo. As cabanas são lindas e o ambiente natural é espetacular. Voltaremos em breve!",
    },
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "John Smith",
    location: "New York, USA",
    rating: 5,
    text: {
      es: "Una experiencia única en contacto con la naturaleza. Las cabañas son muy cómodas y el personal es muy amable. Recomendado!",
      en: "A unique experience in contact with nature. The cabins are very comfortable and the staff is very friendly. Recommended!",
      pt: "Uma experiência única em contato com a natureza. As cabanas são muito confortáveis e a equipe é muito simpática. Recomendado!",
    },
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    location: "Porto Alegre, Brasil",
    rating: 4,
    text: {
      es: "Excelente lugar para descansar y disfrutar de la naturaleza. Las termas cercanas son un plus. Muy recomendable.",
      en: "Excellent place to rest and enjoy nature. The nearby hot springs are a plus. Highly recommended.",
      pt: "Excelente lugar para descansar e desfrutar da natureza. As termas próximas são um diferencial. Muito recomendável.",
    },
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Ana García",
    location: "Córdoba, Argentina",
    rating: 5,
    text: {
      es: "Lugar hermoso y tranquilo. Las cabañas son muy cómodas y limpias. El personal es muy atento. Volveremos!",
      en: "Beautiful and quiet place. The cabins are very comfortable and clean. The staff is very attentive. We will be back!",
      pt: "Lugar lindo e tranquilo. As cabanas são muito confortáveis e limpas. A equipe é muito atenciosa. Voltaremos!",
    },
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState<typeof testimonials>([])
  const { language, t } = useLanguage()

  // Determine how many testimonials to show based on screen size
  const [itemsPerPage, setItemsPerPage] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const endIndex = currentIndex + itemsPerPage
    setVisibleTestimonials(testimonials.slice(currentIndex, endIndex))
  }, [currentIndex, itemsPerPage])

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1
      return next >= testimonials.length - (itemsPerPage - 1) ? 0 : next
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev - 1
      return next < 0 ? testimonials.length - itemsPerPage : next
    })
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("testimonials.title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("testimonials.subtitle")}</p>

        <div className="relative">
          <div className="flex flex-wrap justify-center gap-6">
            {visibleTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-beige rounded-lg p-6 shadow-md flex-1 min-w-[280px] max-w-md">
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-brown">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.text[language as keyof typeof testimonial.text]}</p>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-md transition-colors"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-md transition-colors"
            aria-label="Next testimonials"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(Math.ceil(testimonials.length / itemsPerPage))].map((_, i) => {
            const isActive = i === Math.floor(currentIndex / itemsPerPage)
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * itemsPerPage)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${isActive ? "bg-green" : "bg-gray-300"}`}
                aria-label={`Go to testimonial group ${i + 1}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
