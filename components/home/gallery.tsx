"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLanguage } from "@/context/language-context"

// This would come from your Firebase in a real app
const images = [
  {
    id: 1,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Cabin exterior",
    category: "cabins",
  },
  {
    id: 2,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Cabin interior",
    category: "cabins",
  },
  {
    id: 3,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Swimming pool",
    category: "pool",
  },
  {
    id: 4,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Surrounding nature",
    category: "surroundings",
  },
  {
    id: 5,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Cabin bedroom",
    category: "cabins",
  },
  {
    id: 6,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Cabin bathroom",
    category: "cabins",
  },
  {
    id: 7,
    src: "/placeholder.svg?height=600&width=800",
    alt: "Pool area",
    category: "pool",
  },
  {
    id: 8,
    src: "/placeholder.svg?height=600&width=800",
    alt: "River view",
    category: "surroundings",
  },
]

export default function Gallery() {
  const [filter, setFilter] = useState("all")
  const [selectedImage, setSelectedImage] = useState<null | (typeof images)[0]>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { t } = useLanguage()

  const filteredImages = filter === "all" ? images : images.filter((image) => image.category === filter)

  const handleImageClick = (image: (typeof images)[0]) => {
    setSelectedImage(image)
    setCurrentIndex(filteredImages.findIndex((img) => img.id === image.id))
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? filteredImages.length - 1 : prev - 1
      setSelectedImage(filteredImages[newIndex])
      return newIndex
    })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev === filteredImages.length - 1 ? 0 : prev + 1
      setSelectedImage(filteredImages[newIndex])
      return newIndex
    })
  }

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("gallery.title")}</h2>
        <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">{t("gallery.subtitle")}</p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className={
              filter === "all"
                ? "bg-green hover:bg-green/90"
                : "border-green text-green hover:bg-green hover:text-white"
            }
            onClick={() => setFilter("all")}
          >
            {t("gallery.filters.all")}
          </Button>
          <Button
            variant={filter === "cabins" ? "default" : "outline"}
            className={
              filter === "cabins"
                ? "bg-green hover:bg-green/90"
                : "border-green text-green hover:bg-green hover:text-white"
            }
            onClick={() => setFilter("cabins")}
          >
            {t("gallery.filters.cabins")}
          </Button>
          <Button
            variant={filter === "pool" ? "default" : "outline"}
            className={
              filter === "pool"
                ? "bg-green hover:bg-green/90"
                : "border-green text-green hover:bg-green hover:text-white"
            }
            onClick={() => setFilter("pool")}
          >
            {t("gallery.filters.pool")}
          </Button>
          <Button
            variant={filter === "surroundings" ? "default" : "outline"}
            className={
              filter === "surroundings"
                ? "bg-green hover:bg-green/90"
                : "border-green text-green hover:bg-green hover:text-white"
            }
            onClick={() => setFilter("surroundings")}
          >
            {t("gallery.filters.surroundings")}
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
          {selectedImage && (
            <div className="relative">
              <div className="relative h-[80vh] bg-black rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(null)
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
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
