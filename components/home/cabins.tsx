"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/context/language-context"
import { 
  Wifi, 
  Users, 
  MapPin, 
  Check, 
  Snowflake, 
  Droplets, 
  Tv, 
  UtensilsCrossed, 
  Coffee, 
  CookingPot, 
  Bed, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X
} from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function CabinsSection() {
  const [cabins, setCabins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCabin, setSelectedCabin] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { language, t } = useLanguage()

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
      }))
      setCabins(cabinsData)
    } catch (error) {
      console.error("Error al cargar los departamentos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMainImage = (cabin) => {
    if (Array.isArray(cabin.images) && cabin.images.length > 0) {
      return cabin.images[0]
    }
    return cabin.image || ""
  }

  const getCabinName = (cabin) => {
    if (!cabin) return "Sin nombre"
    if (typeof cabin.name === 'string') {
      return cabin.name
    }
    if (typeof cabin.name === 'object' && cabin.name !== null) {
      return cabin.name.es || cabin.name.en || cabin.name.pt || "Sin nombre"
    }
    return "Sin nombre"
  }

  const getCabinDescription = (cabin) => {
    if (!cabin) return "Sin descripción"
    if (typeof cabin.description === 'string') {
      return cabin.description
    }
    if (typeof cabin.description === 'object' && cabin.description !== null) {
      return cabin.description.es || cabin.description.en || cabin.description.pt || "Sin descripción"
    }
    return "Sin descripción"
  }

  const getAmenityInfo = (key) => {
    const amenities = {
      balconyView: { icon: <Eye className="h-5 w-5" />, label: "Balcón con vista al parque y la piscina", emoji: "🏞️" },
      ac: { icon: <Snowflake className="h-5 w-5" />, label: "Aire acondicionado", emoji: "❄️" },
      fridge: { icon: <Snowflake className="h-5 w-5" />, label: "Heladera", emoji: "❄️" },
      microwave: { icon: <UtensilsCrossed className="h-5 w-5" />, label: "Microondas", emoji: "🍴" },
      kettle: { icon: <Coffee className="h-5 w-5" />, label: "Pava eléctrica", emoji: "☕" },
      electricPot: { icon: <CookingPot className="h-5 w-5" />, label: "Olla eléctrica", emoji: "🍲" },
      dishes: { icon: <UtensilsCrossed className="h-5 w-5" />, label: "Vajilla completa", emoji: "🍴" },
      waterHeater: { icon: <Droplets className="h-5 w-5" />, label: "Termotanque", emoji: "💦" },
      tv: { icon: <Tv className="h-5 w-5" />, label: "TV", emoji: "📺" },
      wifi: { icon: <Wifi className="h-5 w-5" />, label: "WiFi", emoji: "📶" },
      bedding: { icon: <Bed className="h-5 w-5" />, label: "Sábanas", emoji: "🛏️" },
      blankets: { icon: <Bed className="h-5 w-5" />, label: "Frazadas", emoji: "🧴" },
      towels: { icon: <Bed className="h-5 w-5" />, label: "Toallas", emoji: "🧴" },
    }
    return amenities[key] || { icon: null, label: key, emoji: "" }
  }

  const getActiveAmenities = (cabin) => {
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

  const handleViewDetails = (cabin) => {
    setSelectedCabin(cabin)
    setCurrentImageIndex(0)
  }

  const handleCloseModal = () => {
    setSelectedCabin(null)
    setCurrentImageIndex(0)
  }

  const handlePrevImage = () => {
    if (selectedCabin && selectedCabin.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedCabin.images.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (selectedCabin && selectedCabin.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedCabin.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handleWhatsApp = (cabin) => {
    const message = `Hola! Me interesa el departamento "${getCabinName(cabin)}". ¿Podrían darme más información sobre precios y disponibilidad?`
    const whatsappUrl = `https://wa.me/5493456551306?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const CabinCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <section id="cabins" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nuestros Departamentos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros alojamientos únicos diseñados para tu comodidad y tranquilidad
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <CabinCardSkeleton key={i} />
            ))}
          </div>
        ) : cabins.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600">Nuestros departamentos estarán disponibles pronto</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {cabins.map((cabin) => {
              const activeAmenities = getActiveAmenities(cabin)
              
              return (
                <Card
                  key={cabin.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-emerald-200"
                >
                  <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => handleViewDetails(cabin)}>
                    {getMainImage(cabin) ? (
                      <Image
                        src={getMainImage(cabin) || "/placeholder.svg"}
                        alt={getCabinName(cabin)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-emerald-300" />
                      </div>
                    )}
                    
                    {cabin.floor && (
                      <Badge className="absolute top-4 left-4 bg-blue-600 text-white border-0 text-sm px-3 py-1">
                        {cabin.floor === 'upper' ? '🏢 Planta Alta' : '🏬 Planta Baja'}
                      </Badge>
                    )}

                    {Array.isArray(cabin.images) && cabin.images.length > 1 && (
                      <Badge className="absolute top-4 right-4 bg-black/70 text-white border-0">
                        📸 {cabin.images.length} fotos
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl line-clamp-1 text-gray-900">
                      {getCabinName(cabin)}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-base">
                      {getCabinDescription(cabin)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center py-3 border-t border-b border-gray-200">
                      <Users className="h-5 w-5 mr-2 text-emerald-600" />
                      <span className="font-medium text-gray-700">Hasta {cabin.capacity} personas</span>
                    </div>

                    {activeAmenities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Incluye:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {activeAmenities.slice(0, 4).map((amenity) => {
                            const info = getAmenityInfo(amenity)
                            return (
                              <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{info.label}</span>
                              </div>
                            )
                          })}
                        </div>
                        {activeAmenities.length > 4 && (
                          <p className="text-xs text-emerald-600 font-medium">
                            + {activeAmenities.length - 4} comodidades más
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg"
                        onClick={() => handleViewDetails(cabin)}
                      >
                        Ver Detalles
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-6 text-lg"
                        onClick={() => handleWhatsApp(cabin)}
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Consultar Disponibilidad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      <Dialog open={!!selectedCabin} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
          {selectedCabin && (
            <>
              <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white z-10">
                <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                  {getCabinName(selectedCabin)}
                </DialogTitle>
                {selectedCabin.floor && (
                  <Badge className="w-fit bg-blue-600 text-white border-0 mt-2">
                    {selectedCabin.floor === 'upper' ? '🏢 Planta Alta' : '🏬 Planta Baja'}
                  </Badge>
                )}
              </DialogHeader>

              <ScrollArea className="h-[calc(95vh-200px)]">
                <div className="p-6 space-y-6">
                  {/* Galería de Imágenes */}
                  {Array.isArray(selectedCabin.images) && selectedCabin.images.length > 0 && (
                    <div className="relative">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={selectedCabin.images[currentImageIndex] || "/placeholder.svg"}
                          alt={`${getCabinName(selectedCabin)} - Imagen ${currentImageIndex + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                          priority
                        />
                        
                        {selectedCabin.images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                              onClick={handlePrevImage}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                              onClick={handleNextImage}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </Button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {selectedCabin.images.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Miniaturas */}
                      {selectedCabin.images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {selectedCabin.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-emerald-400'
                              }`}
                            >
                              <Image
                                src={img || "/placeholder.svg"}
                                alt={`Miniatura ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Descripción */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">{getCabinDescription(selectedCabin)}</p>
                  </div>

                  {/* Capacidad */}
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-600" />
                    <span className="font-semibold text-gray-900">
                      Capacidad: Hasta {selectedCabin.capacity} personas
                    </span>
                  </div>

                  {/* Amenidades */}
                  {getActiveAmenities(selectedCabin).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">El departamento cuenta con:</h3>
                      
                      <div className="space-y-6">
                        {/* Vista y Espacios */}
                        {getActiveAmenities(selectedCabin).includes('balconyView') && (
                          <div>
                            <h4 className="font-semibold text-emerald-700 mb-3">Vista y Espacios</h4>
                            <div className="grid gap-2">
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                <span className="text-gray-700">Balcón con vista al parque y la piscina 🏞️</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Equipamiento Completo */}
                        {getActiveAmenities(selectedCabin).filter(a => 
                          ['ac', 'fridge', 'microwave', 'kettle', 'electricPot', 'dishes', 'waterHeater', 'tv', 'wifi'].includes(a)
                        ).length > 0 && (
                          <div>
                            <h4 className="font-semibold text-emerald-700 mb-3">Equipamiento Completo</h4>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {['ac', 'fridge', 'microwave', 'kettle', 'electricPot', 'dishes', 'waterHeater', 'tv', 'wifi']
                                .filter(key => getActiveAmenities(selectedCabin).includes(key))
                                .map((amenity) => {
                                  const info = getAmenityInfo(amenity)
                                  return (
                                    <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                      <span className="text-gray-700">{info.label} {info.emoji}</span>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}

                        {/* Ropa de Cama */}
                        {getActiveAmenities(selectedCabin).filter(a => 
                          ['bedding', 'blankets', 'towels'].includes(a)
                        ).length > 0 && (
                          <div>
                            <h4 className="font-semibold text-emerald-700 mb-3">Ropa de Cama Incluida</h4>
                            <div className="grid sm:grid-cols-3 gap-2">
                              {['bedding', 'blankets', 'towels']
                                .filter(key => getActiveAmenities(selectedCabin).includes(key))
                                .map((amenity) => {
                                  const info = getAmenityInfo(amenity)
                                  return (
                                    <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                      <span className="text-gray-700">{info.label} {info.emoji}</span>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Espaciado final para que no quede pegado al botón */}
                  <div className="h-4"></div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t bg-white sticky bottom-0 space-y-3">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg"
                  onClick={() => handleWhatsApp(selectedCabin)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Consultar Precio y Disponibilidad
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}