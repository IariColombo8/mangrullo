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
  const { language, t } = useLanguage()

  const [bookedDates, setBookedDates] = useState([])

  const getLocalizedText = (field) => {
    if (!field) return ""
    if (typeof field === "object") return field[language] || Object.values(field)[0] || ""
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

        const cabinsList = cabinsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cabins.map((cabin) => (
              <div key={cabin.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={cabin.image || "/placeholder.svg"}
                    alt={getLocalizedText(cabin.name) || "Cabaña"}
                    fill
                    className="object-cover"
                    onError={handleImageError}
                    unoptimized={true}
                  />
                </div>
                <div className="p-4">
                  <pre className="text-xs text-gray-500 mb-2">ID: {cabin.id}</pre>
                  <h3 className="text-xl font-bold text-brown mb-2">{getLocalizedText(cabin.name) || `Cabaña ${cabin.id}`}</h3>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{t("cabins.capacity", { count: cabin.capacity || "?" })}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {getLocalizedText(cabin.description) || "Sin descripción disponible."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-green font-bold text-lg">
                      ${cabin.price || "?"} USD <span className="text-sm font-normal">{t("cabins.perNight")}</span>
                    </span>
                    <Button
                      variant="outline"
                      className="border-green text-green hover:bg-green hover:text-white"
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
                <DialogTitle className="text-2xl text-brown">
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
                  <div className="relative h-64 rounded-lg overflow-hidden">
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
                    <h3 className="text-xl font-bold text-brown mb-2">{t("cabins.modal.description")}</h3>
                    <p className="text-gray-600">
                      {getLocalizedText(selectedCabin.description) || "Sin descripción disponible."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green font-bold text-2xl">${selectedCabin.price || "?"} USD</span>
                      <span className="text-sm text-gray-600 ml-1">{t("cabins.perNight")}</span>
                    </div>
                    <Button
                      className="bg-green hover:bg-green/90"
                      onClick={() => window.open("https://www.booking.com", "_blank")}
                    >
                      {t("cabins.bookNow")}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="pt-4">
                  {selectedCabin.amenities && selectedCabin.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedCabin.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="mr-3 text-green">{getAmenityIcon(amenity)}</div>
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
                    <div className="flex items-center mb-4 text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
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
                            bookedDate.getFullYear() === date.getFullYear()
                        )
                      }
                      className="rounded-md border"
                    />
                    <div className="flex items-center mt-4 text-sm">
                      <div className="flex items-center mr-4">
                        <div className="w-4 h-4 bg-red-200 rounded-full mr-2"></div>
                        <span>{t("cabins.modal.booked")}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-200 rounded-full mr-2"></div>
                        <span>{t("cabins.modal.available")}</span>
                      </div>
                    </div>
                    <Button
                      className="bg-green hover:bg-green/90 mt-6"
                      onClick={() => window.open("https://www.booking.com", "_blank")}
                    >
                      {t("cabins.bookOnBooking")}
                    </Button>
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
