"use client"

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLanguage } from "@/context/language-context"

const images = [
  { id: 1, src: "/pileta 1.jpg", alt: "Pileta del complejo", category: "pool" },
  { id: 2, src: "/pileta 2.jpg", alt: "Pileta vista lateral", category: "pool" },
  { id: 3, src: "/pileta 3.jpg", alt: "Pileta al atardecer", category: "pool" },
  { id: 4, src: "/pileta 4.jpg", alt: "Pileta panorámica", category: "pool" },
  { id: 5, src: "/1.jpg", alt: "Vista de los alrededores", category: "surroundings" },
  { id: 6, src: "/2.jpg", alt: "Entorno natural", category: "surroundings" },
  { id: 7, src: "/3.jpg", alt: "Paisaje del complejo", category: "surroundings" },
  { id: 8, src: "/4.jpg", alt: "Naturaleza circundante", category: "surroundings" },
  { id: 9, src: "/5.jpg", alt: "Áreas verdes", category: "surroundings" },
  { id: 10, src: "/6.jpg", alt: "Vista panorámica", category: "surroundings" },
  { id: 11, src: "/7.jpg", alt: "Jardines del complejo", category: "surroundings" },
  { id: 12, src: "/8.jpg", alt: "Entorno del complejo", category: "surroundings" },
  { id: 13, src: "/9.jpg", alt: "Alrededores", category: "surroundings" },
  { id: 14, src: "/10.jpg", alt: "Vista desde el complejo", category: "surroundings" },
  { id: 15, src: "/11.jpg", alt: "Paisaje natural", category: "surroundings" },
  { id: 16, src: "/12.jpg", alt: "Naturaleza", category: "surroundings" },
]

export default function Gallery() {
  const [filter, setFilter] = useState("all")
  const [selectedImage, setSelectedImage] = useState<(typeof images)[0] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { t } = useLanguage()

  const filteredImages = useMemo(
    () => (filter === "all" ? images : images.filter((image) => image.category === filter)),
    [filter]
  )

  const handleImageClick = useCallback(
    (image: (typeof images)[0]) => {
      setSelectedImage(image)
      setCurrentIndex(filteredImages.findIndex((img) => img.id === image.id))
    },
    [filteredImages]
  )

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? filteredImages.length - 1 : prev - 1
      setSelectedImage(filteredImages[newIndex])
      return newIndex
    })
  }, [filteredImages])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === filteredImages.length - 1 ? 0 : prev + 1
      setSelectedImage(filteredImages[newIndex])
      return newIndex
    })
  }, [filteredImages])

  const filterButtons = [
    { key: "all", label: t("gallery.filters.all") },
    { key: "pool", label: t("gallery.filters.pool") },
    { key: "surroundings", label: t("gallery.filters.surroundings") },
  ]

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("gallery.title")}</h2>
        <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          {t("gallery.subtitle")}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist">
          {filterButtons.map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              className={
                filter === key
                  ? "bg-green hover:bg-green/90"
                  : "border-green text-green hover:bg-green hover:text-white"
              }
              onClick={() => setFilter(key)}
              role="tab"
              aria-selected={filter === key}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              role="button"
              tabIndex={0}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => handleImageClick(image)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageClick(image) } }}
              aria-label={`Ver ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                quality={70}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">
            Galería de imágenes - {selectedImage?.alt || "Imagen"}
          </DialogTitle>

          {selectedImage && (
            <div className="relative">
              <div className="relative h-[80vh] bg-black rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  quality={85}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(null)
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
