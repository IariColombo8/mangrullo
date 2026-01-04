"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/context/language-context"
import { Wifi, Thermometer, PawPrint, Wind, Users, DollarSign, MapPin } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function CabinsSection() {
  const [cabins, setCabins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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
      console.error("Error al cargar las cabañas:", error)
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

  const getAmenityLabel = (amenity) => {
    const labels = {
      wifi: "WiFi",
      ac: "Aire Acondicionado",
      pets: "Se Permiten Mascotas",
      kitchen: "Cocina",
    }
    return labels[amenity] || amenity
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "ac":
        return <Thermometer className="h-4 w-4" />
      case "pets":
        return <PawPrint className="h-4 w-4" />
      case "kitchen":
        return <Wind className="h-4 w-4" />
      default:
        return null
    }
  }

  const CabinCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section id="cabins" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nuestras Cabañas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros alojamientos únicos diseñados para tu comodidad y tranquilidad
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <CabinCardSkeleton key={i} />
            ))}
          </div>
        ) : cabins.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600">Nuestras cabañas estarán disponibles pronto</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {cabins.map((cabin) => (
              <Card
                key={cabin.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-emerald-200"
              >
                <div className="relative h-64 overflow-hidden">
                  {getMainImage(cabin) ? (
                    <Image
                      src={getMainImage(cabin) || "/placeholder.svg"}
                      alt={cabin.name?.[language] || cabin.name?.es || cabin.name?.en || "Cabaña"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-600 text-white border-0 text-base px-3 py-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {cabin.price}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl line-clamp-1 text-gray-900">
                    {cabin.name?.[language] || cabin.name?.es || cabin.name?.en || "Sin nombre"}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-base">
                    {cabin.description?.[language] ||
                      cabin.description?.es ||
                      cabin.description?.en ||
                      "Sin descripción"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-t border-b border-gray-200">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-5 w-5 mr-2 text-emerald-600" />
                      <span className="font-medium">{cabin.capacity} personas</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-emerald-600 font-bold text-xl">
                        <span>${cabin.price}</span>
                      </div>
                      <span className="text-sm text-gray-500">por noche</span>
                    </div>
                  </div>

                  {cabin.amenities && cabin.amenities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Comodidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {cabin.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="flex items-center gap-1 text-sm py-1">
                            {getAmenityIcon(amenity)}
                            {getAmenityLabel(amenity)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg">
                    Reservar Ahora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
