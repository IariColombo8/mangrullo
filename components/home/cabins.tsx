"use client"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/context/language-context"
import { Wifi, Users, MapPin, Check, Snowflake, Droplets, Tv, UtensilsCrossed, Coffee, CookingPot, Bed, Eye, ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Cabin {
  id: string
  name: string | { es?: string; en?: string; pt?: string }
  description: string | { es?: string; en?: string; pt?: string }
  image?: string
  images?: string[]
  capacity?: number
  floor?: string
  amenities?: Record<string, boolean> | string[]
}

export default function CabinsSection() {
  const [cabins, setCabins] = useState<Cabin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useLanguage()

  useEffect(() => {
    fetchCabins()
  }, [])

  const fetchCabins = async () => {
    setIsLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "cabins"))
      const cabinsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cabin[]
      setCabins(cabinsData)
    } catch (error) {
      console.error("Error al cargar los departamentos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMainImage = (cabin: Cabin): string => {
    if (Array.isArray(cabin.images) && cabin.images.length > 0) {
      return cabin.images[0]
    }
    return cabin.image || ""
  }

  const getCabinName = (cabin: Cabin | null): string => {
    if (!cabin) return "Sin nombre"
    if (typeof cabin.name === 'string') {
      return cabin.name
    }
    if (typeof cabin.name === 'object' && cabin.name !== null) {
      return cabin.name.es || cabin.name.en || cabin.name.pt || "Sin nombre"
    }
    return "Sin nombre"
  }

  const getCabinDescription = (cabin: Cabin | null): string => {
    if (!cabin) return "Sin descripción"
    if (typeof cabin.description === 'string') {
      return cabin.description
    }
    if (typeof cabin.description === 'object' && cabin.description !== null) {
      return cabin.description.es || cabin.description.en || cabin.description.pt || "Sin descripción"
    }
    return "Sin descripción"
  }

  const getAmenityInfo = (key: string) => {
    const amenities = {
      balconyView: { icon: <Eye className="w-4 h-4" />, label: "Balcón con vista al parque y la piscina", emoji: "🏞️" },
      ac: { icon: <Snowflake className="w-4 h-4" />, label: "Aire acondicionado", emoji: "❄️" },
      fridge: { icon: <Snowflake className="w-4 h-4" />, label: "Heladera", emoji: "❄️" },
      microwave: { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Microondas", emoji: "🍴" },
      kettle: { icon: <Coffee className="w-4 h-4" />, label: "Pava eléctrica", emoji: "☕" },
      electricPot: { icon: <CookingPot className="w-4 h-4" />, label: "Olla eléctrica", emoji: "🍲" },
      dishes: { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Vajilla completa", emoji: "🍴" },
      waterHeater: { icon: <Droplets className="w-4 h-4" />, label: "Termotanque", emoji: "💦" },
      tv: { icon: <Tv className="w-4 h-4" />, label: "TV", emoji: "📺" },
      wifi: { icon: <Wifi className="w-4 h-4" />, label: "WiFi", emoji: "📶" },
      bedding: { icon: <Bed className="w-4 h-4" />, label: "Sábanas", emoji: "🛏️" },
      blankets: { icon: <Bed className="w-4 h-4" />, label: "Frazadas", emoji: "🧴" },
      towels: { icon: <Bed className="w-4 h-4" />, label: "Toallas", emoji: "🧴" },
    }
    return (amenities as Record<string, { icon: React.ReactNode; label: string; emoji: string }>)[key] || { icon: null, label: key, emoji: "" }
  }

  const getActiveAmenities = (cabin: Cabin): string[] => {
    if (!cabin.amenities) return []
    if (typeof cabin.amenities === 'object' && !Array.isArray(cabin.amenities)) {
      return Object.entries(cabin.amenities)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
    }
    if (Array.isArray(cabin.amenities)) {
      return cabin.amenities
    }
    return []
  }

  const handleViewDetails = (cabin: Cabin) => {
    setSelectedCabin(cabin)
    setCurrentImageIndex(0)
  }

  const handleCloseModal = () => {
    setSelectedCabin(null)
    setCurrentImageIndex(0)
  }

  const handlePrevImage = () => {
    if (selectedCabin?.images) {
      const len = selectedCabin.images.length
      setCurrentImageIndex((prev) => (prev === 0 ? len - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (selectedCabin?.images) {
      const len = selectedCabin.images.length
      setCurrentImageIndex((prev) => (prev === len - 1 ? 0 : prev + 1))
    }
  }

  const selectedCabinAmenities: string[] = useMemo(
    () => (selectedCabin ? getActiveAmenities(selectedCabin) : []),
    [selectedCabin]
  )

  const handleWhatsApp = (cabin: Cabin) => {
    const message = `Hola! Me interesa el departamento "${getCabinName(cabin)}". ¿Podrían darme más información sobre precios y disponibilidad?`
    const whatsappUrl = `https://wa.me/5493456551306?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const CabinCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <section id="departamentos" className="py-12 md:py-20 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Nuestros Departamentos
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros alojamientos únicos diseñados para tu comodidad y tranquilidad
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <CabinCardSkeleton key={i} />
            ))}
          </div>
        ) : cabins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-2">Próximamente</p>
            <p className="text-gray-500">Nuestros departamentos estarán disponibles pronto</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {cabins.map((cabin) => {
              const activeAmenities = getActiveAmenities(cabin)
              const mainImage = getMainImage(cabin)
              return (
                <Card
                  key={cabin.id}
                  role="button"
                  tabIndex={0}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer scale-90 md:scale-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onClick={() => handleViewDetails(cabin)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewDetails(cabin) } }}
                  aria-label={`Ver detalles de ${getCabinName(cabin)}`}
                >
                  <div className="relative h-48 md:h-64 overflow-hidden rounded-lg">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={getCabinName(cabin)}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                        quality={70}
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                        <Bed className="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
                      </div>
                    )}
                    {cabin.floor && (
                      <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] md:text-xs">
                        {cabin.floor === 'upper' ? '🏢 Planta Alta' : '🏬 Planta Baja'}
                      </Badge>
                    )}
                    {Array.isArray(cabin.images) && cabin.images.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white text-[10px] md:text-xs">
                        📸 {cabin.images.length} fotos
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-sm md:text-xl font-bold text-gray-900 line-clamp-1">
                      {getCabinName(cabin)}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm line-clamp-2">
                      {getCabinDescription(cabin)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-3 md:p-6 pt-0">
                    <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4 text-emerald-700">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">Hasta {cabin.capacity} personas</span>
                    </div>

                    {activeAmenities.length > 0 && (
                      <div className="mb-3 md:mb-4">
                        <p className="text-[10px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-2">Incluye:</p>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {activeAmenities.slice(0, 4).map((amenity) => {
                            const info = getAmenityInfo(amenity)
                            return (
                              <div
                                key={amenity}
                                className="flex items-center gap-1 bg-emerald-50 rounded-full px-1.5 md:px-2 py-0.5 md:py-1"
                                title={info.label}
                              >
                                {info.icon}
                              </div>
                            )
                          })}
                        </div>
                        {activeAmenities.length > 4 && (
                          <p className="text-[9px] md:text-xs text-emerald-600 mt-1 md:mt-2 font-medium">
                            + {activeAmenities.length - 4} comodidades más
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 md:gap-2">
                      <Button
                        onClick={() => handleViewDetails(cabin)}
                        variant="outline"
                        className="w-full text-[10px] md:text-sm h-7 md:h-10"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWhatsApp(cabin)
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-[10px] md:text-sm h-7 md:h-10"
                      >
                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Consultar Disponibilidad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal de Detalles */}
        {selectedCabin && (
          <Dialog open={!!selectedCabin} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[77vh] md:max-h-[80vh] overflow-hidden p-0 flex flex-col">
              <DialogHeader className="p-3 md:p-6 pb-2 md:pb-2 flex-shrink-0 border-b">
                <DialogTitle className="text-base md:text-2xl font-bold flex items-center gap-2 md:gap-3 pr-8">
                  {getCabinName(selectedCabin)}
                  {selectedCabin.floor && (
                    <Badge className="bg-emerald-600 text-white text-[10px] md:text-sm">
                      {selectedCabin.floor === 'upper' ? '🏢 Planta Alta' : '🏬 Planta Baja'}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-3 md:px-6 pb-3 md:pb-6">
                  {/* Galería de Imágenes */}
                  {Array.isArray(selectedCabin.images) && selectedCabin.images.length > 0 && (
                    <div className="mb-3 md:mb-6">
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                        <div className="relative w-full" style={{ paddingBottom: '65%' }}>
                          <Image
                            src={selectedCabin.images[currentImageIndex]}
                            alt={`${getCabinName(selectedCabin)} - Imagen ${currentImageIndex + 1}`}
                            fill
                            sizes="(max-width: 768px) 95vw, 896px"
                            className="object-contain"
                          />
                        </div>
                        {selectedCabin.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 md:p-2 transition-all"
                            >
                              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 md:p-2 transition-all"
                            >
                              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                            </button>
                            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-sm">
                              {currentImageIndex + 1} / {selectedCabin.images.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Miniaturas */}
                      {selectedCabin.images.length > 1 && (
                        <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-4 overflow-x-auto pb-2">
                          {selectedCabin.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative h-10 w-10 md:h-16 md:w-16 flex-shrink-0 rounded-md md:rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex
                                  ? 'border-emerald-600 ring-2 ring-emerald-200'
                                  : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-emerald-400'
                              }`}
                            >
                              <Image src={img} alt={`Miniatura ${idx + 1}`} fill sizes="64px" className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="mb-3 md:mb-6">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">Descripción</h3>
                    <p className="text-xs md:text-base text-gray-700">{getCabinDescription(selectedCabin)}</p>
                  </div>

                  {/* Capacidad */}
                  <div className="flex items-center gap-2 mb-3 md:mb-6 text-emerald-700 bg-emerald-50 p-2.5 md:p-4 rounded-lg">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-base font-medium">Capacidad: Hasta {selectedCabin.capacity} personas</span>
                  </div>

                  {/* Amenidades */}
                  {selectedCabinAmenities.length > 0 && (
                    <div className="mb-3 md:mb-6">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">El departamento cuenta con:</h3>

                      {/* Vista y Espacios */}
                      {selectedCabinAmenities.includes('balconyView') && (
                        <div className="mb-2 md:mb-4">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Vista y Espacios</h4>
                          <div className="flex items-center gap-1.5 md:gap-2 bg-blue-50 p-2 md:p-3 rounded-lg">
                            <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Balcón con vista al parque y la piscina 🏞️</span>
                          </div>
                        </div>
                      )}

                      {/* Equipamiento Completo */}
                      {selectedCabinAmenities.filter((a: string) =>
                        ['ac', 'fridge', 'microwave', 'kettle', 'electricPot', 'dishes', 'waterHeater', 'tv', 'wifi'].includes(a)
                      ).length > 0 && (
                        <div className="mb-2 md:mb-4">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Equipamiento Completo</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
                            {['ac', 'fridge', 'microwave', 'kettle', 'electricPot', 'dishes', 'waterHeater', 'tv', 'wifi']
                              .filter(key => selectedCabinAmenities.includes(key))
                              .map((amenity) => {
                                const info = getAmenityInfo(amenity)
                                return (
                                  <div key={amenity} className="flex items-center gap-1.5 md:gap-2 bg-emerald-50 p-2 md:p-3 rounded-lg">
                                    <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-xs md:text-sm">{info.label} {info.emoji}</span>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}

                      {/* Ropa de Cama */}
                      {selectedCabinAmenities.filter((a: string) =>
                        ['bedding', 'blankets', 'towels'].includes(a)
                      ).length > 0 && (
                        <div className="mb-2 md:mb-4">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Ropa de Cama Incluida</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
                            {['bedding', 'blankets', 'towels']
                              .filter(key => selectedCabinAmenities.includes(key))
                              .map((amenity) => {
                                const info = getAmenityInfo(amenity)
                                return (
                                  <div key={amenity} className="flex items-center gap-1.5 md:gap-2 bg-purple-50 p-2 md:p-3 rounded-lg">
                                    <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                                    <span className="text-xs md:text-sm">{info.label} {info.emoji}</span>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botón de WhatsApp */}
                  <div className="pt-2 md:pt-4 sticky bottom-0 bg-white pb-2 md:pb-0">
                    <Button
                      onClick={() => handleWhatsApp(selectedCabin)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs md:text-base h-9 md:h-12"
                    >
                      <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                      Consultar Precio y Disponibilidad
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}