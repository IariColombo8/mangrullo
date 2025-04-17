"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase" // Asegúrate de tener este archivo con la configuración de Firebase

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleTestimonials, setVisibleTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  // Determine how many testimonials to show based on screen size
  const [itemsPerPage, setItemsPerPage] = useState(3)

  // Fetch testimonials from Firebase
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        const testimonialsCollection = collection(db, "testimonials")
        const testimonialsSnapshot = await getDocs(testimonialsCollection)
        
        const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setTestimonials(testimonialsData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching testimonials:", error)
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

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
    if (testimonials.length > 0) {
      const endIndex = currentIndex + itemsPerPage
      setVisibleTestimonials(testimonials.slice(currentIndex, endIndex))
    }
  }, [currentIndex, itemsPerPage, testimonials])

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

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("testimonials.title")}</h2>
          <p className="text-center text-gray-600 mb-12">Cargando testimonios...</p>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("testimonials.title")}</h2>
          <p className="text-center text-gray-600 mb-12">No hay testimonios disponibles.</p>
        </div>
      </section>
    )
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
                <p className="text-gray-600">{testimonial.text[language] || testimonial.text.es}</p>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > itemsPerPage && (
            <>
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
            </>
          )}
        </div>

        {/* Indicators */}
        {testimonials.length > itemsPerPage && (
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
        )}
      </div>
    </section>
  )
}