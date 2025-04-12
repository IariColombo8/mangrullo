"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/language-context"

// This would come from your Firebase in a real app
const testimonials = [
  {
    id: 1,
    name: "Romina Gonzalez",
    location: "Local Guide · Nivel 3",
    rating: 5,
    text: {
      es: "Hermosísimo el lugar, súper tranquilo, ideal para descansar, cerca de todo. La atención de Claudia y Ángel excelente, son muy atentos a lo que necesitas. Fuimos 9 días y la pasamos genial. Yo fui con mi perrita y ella se sentía como en su casa. ¡Volveremos!",
      en: "The place is beautiful, super quiet, ideal for resting, and close to everything. Claudia and Ángel's attention was excellent, very attentive to everything we needed. We stayed for 9 days and had an amazing time. I went with my little dog and she felt right at home. We’ll be back!",
      pt: "O lugar é lindíssimo, super tranquilo, ideal para descansar e perto de tudo. A atenção de Claudia e Ángel foi excelente, muito atenciosos com o que precisávamos. Ficamos 9 dias e aproveitamos muito. Fui com minha cachorrinha e ela se sentia em casa. Voltaremos!",
    },
    image: "logo r.png",
  },
  {
    id: 2,
    name: "Marcelo Agustin Flores",
    location: "Local Guide · Nivel 3",
    rating: 5,
    text: {
      es: "La verdad es un lugar muy hermoso y agradable, atendido por sus dueños, muy amables y excelentes personas, la calidez humana recibida por parte de Ángel y Claudia, sin palabras. Muy atentos para con sus huéspedes. Las habitaciones son cómodas y con las instalaciones en muy buen estado. Recomendable. Cuenta con servicio de Wifi, piscina y un amplio jardín donde poder sentarte a disfrutar de la naturaleza y la tranquilidad. Volvería las veces que sea necesaria y haya disponibilidad habitacional. La pasamos muy bien con mi ahijado y sus padres.",
      en: "It’s truly a beautiful and pleasant place, run by its very kind and wonderful owners. The warmth from Ángel and Claudia was incredible. They were very attentive to their guests. The rooms are comfortable and the facilities are in excellent condition. Highly recommended. There’s WiFi, a pool, and a large garden to enjoy nature and tranquility. I would return as many times as needed, as long as there is availability. We had a great time with my godson and his parents.",
      pt: "É realmente um lugar muito bonito e agradável, administrado pelos próprios donos, muito amáveis e excelentes pessoas. O carinho humano de Ángel e Claudia foi incrível. Muito atenciosos com os hóspedes. Os quartos são confortáveis e as instalações estão em ótimo estado. Recomendado. Conta com Wi-Fi, piscina e um grande jardim para desfrutar da natureza e tranquilidade. Voltaria quantas vezes fosse necessário, se houver disponibilidade. Nos divertimos muito com meu afilhado e seus pais.",
    },
    image: "logo m 2.png",
  },
  {
    id: 3,
    name: "Yanina Rocio Avalo",
    location: "Local Guide · Nivel 3",
    rating: 4,
    text: {
      es: "¡Hermoso lugar! Ideal para descansar y está cerca de las termas. Los dptos están bien equipados y lo mejor de todo es la atención y buena predisposición. Sin dudas volveríamos.",
      en: "Beautiful place! Ideal for relaxing and it's close to the hot springs. The apartments are well-equipped and the best part is the great attention and kindness. We would definitely come back.",
      pt: "Lugar lindo! Ideal para descansar e fica perto das termas. Os apartamentos são bem equipados e o melhor de tudo é a atenção e boa disposição. Sem dúvida voltaríamos.",
    },
    image: "logo m 3.png",
  },
  {
    id: 4,
    name: "Juan Romero Mereles",
    location: "Local Guide · Nivel 3",
    rating: 5,
    text: {
      es: "Hermoso lugar. Lindo, limpio y cómodo. Ángel fue muy atento!! Volveremos en nuestra próxima visita a Federación.",
      en: "Beautiful place. Nice, clean, and comfortable. Ángel was very attentive! We will come back on our next visit to Federación.",
      pt: "Lugar lindo. Agradável, limpo e confortável. Ángel foi muito atencioso! Voltaremos na nossa próxima visita a Federación.",
    },
    image: "logo m 4.png",
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
