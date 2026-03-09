"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Phone, Mail } from "lucide-react"

export default function Contact() {
  const [mapVisible, setMapVisible] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="contact" className="section-padding bg-beige py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title text-brown">Contacto</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">Estamos aquí para ayudarte</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-brown mb-6">Información de Contacto</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Dirección</h4>
                    <p className="text-gray-600">Av. Coronel J. M. Salas, Federación, Entre Ríos</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4 flex-shrink-0">
                    <Phone className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Teléfono</h4>
                    <p className="text-gray-600">
                      <a href="tel:+5493456551550" className="hover:text-green transition-colors">
                        +54 9 3456 551550
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green/10 p-3 rounded-full mr-4 flex-shrink-0">
                    <Mail className="h-6 w-6 text-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">
                      <a href="mailto:elmangrullofederacion@gmail.com" className="hover:text-green transition-colors">
                        elmangrullofederacion@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div ref={mapRef} className="h-80 lg:h-full min-h-[256px] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
              {mapVisible ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3420.912827110814!2d-57.94400812437604!3d-30.972914774953384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95ada3de5d7ab995%3A0x997f47e1684e06a8!2sEl%20Mangrullo!5e0!3m2!1ses-419!2sar!4v1744424477822!5m2!1ses-419!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de El Mangrullo en Google Maps"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
