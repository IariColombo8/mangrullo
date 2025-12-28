"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Wifi, Wind, Thermometer, PawPrint, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useLanguage } from "@/context/language-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Cabins() {
  const [cabins, setCabins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCabin, setSelectedCabin] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [date, setDate] = useState(undefined)
  const { t } = useLanguage()

  const [bookedDates, setBookedDates] = useState([])

  const getLocalizedText = (field) => {
    if (!field) return ""
    // Now only searches for text in Spanish
    if (typeof field === "object") return field.es || field.en || field.pt || Object.values(field)[0] || ""
    return field
  }

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const cabinsCollection = collection(db, "cabins")
        const cabinsSnapshot = await getDocs(cabinsCollection)

        if (cabinsSnapshot.empty) {
          setError("No se encontraron cabañas en la base de datos")
          setLoading(false)
          return
        }

        const cabinsList = cabinsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setCabins(cabinsList)
        setLoading(false)
      } catch (error) {
        setError(`Error al cargar datos: ${error.message}`)
        setLoading(false)
      }
    }

    fetchCabins()

    const today = new Date()
    const simulatedBookedDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 16),
    ]
    setBookedDates(simulatedBookedDates)
  }, [])

  const handleCabinClick = (cabin) => {
    setSelectedCabin(cabin)
    setIsDialogOpen(true)
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-5 w-5" />
      case "ac":
        return <Thermometer className="h-5 w-5" />
      case "pets":
        return <PawPrint className="h-5 w-5" />
      case "kitchen":
        return <Wind className="h-5 w-5" />
      default:
        return null
    }
  }

  const getAmenityLabel = (amenity) => {
    switch (amenity) {
      case "wifi":
        return t("cabins.amenities.wifi")
      case "ac":
        return t("cabins.amenities.ac")
      case "pets":
        return t("cabins.amenities.pets")
      case "kitchen":
        return t("cabins.amenities.kitchen")
      default:
        return ""
    }
  }

  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg"
  }

  const handleWhatsAppClick = (cabinName) => {
    const message = encodeURIComponent(
      `Hola, estoy interesado en reservar la cabaña "${cabinName}". ¿Podrían proporcionarme más información?`,
    )
    window.open(`https://wa.me/+123456789?text=${message}`, "_blank")
  }

  if (loading) {
    return (
      <section id="cabins" className="section-padding bg-beige">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("cabins.title")}</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="cabins" className="section-padding bg-beige">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("cabins.title")}</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <p className="mt-2">Verifica la consola para más detalles o intenta recargar la página.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="cabins" className="section-padding bg-beige">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("cabins.title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("cabins.subtitle")}</p>

        {cabins.length === 0 ? (
          <p className="text-center text-gray-600">No hay cabañas disponibles actualmente.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {cabins.map((cabin) => (
              <div
                key={cabin.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-36 sm:h-40 md:h-48">
                  <Image
                    src={cabin.image || "/placeholder.svg"}
                    alt={getLocalizedText(cabin.name) || "Cabaña"}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    unoptimized={true}
                  />
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="text-sm font-bold text-brown mb-1 md:mb-2">
                    {getLocalizedText(cabin.name) || `Cabaña ${cabin.id}`}
                  </h3>

                  {/* Solo mostrar en dispositivos medianos y grandes */}
                  <div className="hidden sm:flex items-center text-gray-600 mb-2 md:mb-4 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{t("cabins.capacity", { count: cabin.capacity || "?" })}</span>
                  </div>

                  {/* Solo mostrar en dispositivos medianos y grandes */}
                  <p className="hidden sm:block text-gray-600 mb-2 md:mb-4 line-clamp-2 text-xs sm:text-sm">
                    {getLocalizedText(cabin.description) || "Sin descripción disponible."}
                  </p>

                  <div className="flex justify-between items-center">
                    {/* Solo mostrar en dispositivos medianos y grandes */}
                    <span className="hidden sm:inline text-green font-bold text-sm sm:text-base md:text-lg">
                      ${cabin.price || "?"} USD <span className="text-xs font-normal">{t("cabins.perNight")}</span>
                    </span>

                    {/* En móvil, el botón ocupa todo el ancho */}
                    <Button
                      variant="outline"
                      className="border-green text-green hover:bg-green hover:text-white text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 w-full sm:w-auto bg-transparent"
                      onClick={() => handleCabinClick(cabin)}
                    >
                      {t("cabins.details")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedCabin && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl text-brown">
                  {getLocalizedText(selectedCabin.name) || `Cabaña ${selectedCabin.id}`}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">{t("cabins.modal.details")}</TabsTrigger>
                  <TabsTrigger value="amenities">{t("cabins.modal.amenities")}</TabsTrigger>
                  <TabsTrigger value="availability">{t("cabins.modal.availability")}</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="relative h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedCabin.image || "/placeholder.svg"}
                      alt={getLocalizedText(selectedCabin.name) || "Cabaña"}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      unoptimized={true}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-brown mb-2">{t("cabins.modal.description")}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {getLocalizedText(selectedCabin.description) || "Sin descripción disponible."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green font-bold text-xl sm:text-2xl">
                        ${selectedCabin.price || "?"} USD
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 ml-1">{t("cabins.perNight")}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="pt-4">
                  {selectedCabin.amenities && selectedCabin.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {selectedCabin.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm sm:text-base"
                        >
                          <div className="mr-2 sm:mr-3 text-green">{getAmenityIcon(amenity)}</div>
                          <span>{getAmenityLabel(amenity)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No hay amenidades disponibles.</p>
                  )}
                </TabsContent>

                <TabsContent value="availability" className="pt-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-4 text-gray-600 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span>{t("cabins.modal.checkAvailability")}</span>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date < new Date() ||
                        bookedDates.some(
                          (bookedDate) =>
                            bookedDate.getDate() === date.getDate() &&
                            bookedDate.getMonth() === date.getMonth() &&
                            bookedDate.getFullYear() === date.getFullYear(),
                        )
                      }
                      className="rounded-md border"
                    />
                    <div className="flex items-center mt-4 text-xs sm:text-sm">
                      <div className="flex items-center mr-4">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-200 rounded-full mr-2"></div>
                        <span>{t("cabins.modal.booked")}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 rounded-full mr-2"></div>
                        <span>{t("cabins.modal.available")}</span>
                      </div>
                    </div>

                    {/* Botones de reserva */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-6">
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-sm sm:text-base"
                        onClick={() => window.open("https://airbnb.com/h/loslagartos", "_blank")}
                      >
                        Reservar por Airbnb
                      </Button>

                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-sm sm:text-base"
                        onClick={() => handleWhatsAppClick(getLocalizedText(selectedCabin.name))}
                      >
                        Consultar por WhatsApp
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
