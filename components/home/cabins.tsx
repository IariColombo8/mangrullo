"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Wifi, Wind, Thermometer, PawPrint, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useLanguage } from "@/context/language-context"

// This would come from your Firebase in a real app
const cabins = [
  {
    id: 1,
    name: {
      es: "Cabaña Río",
      en: "River Cabin",
      pt: "Cabana Rio",
    },
    description: {
      es: "Hermosa cabaña con vista al río, perfecta para parejas o familias pequeñas.",
      en: "Beautiful cabin with river view, perfect for couples or small families.",
      pt: "Linda cabana com vista para o rio, perfeita para casais ou famílias pequenas.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 120,
    capacity: 4,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
  {
    id: 2,
    name: {
      es: "Cabaña Bosque",
      en: "Forest Cabin",
      pt: "Cabana Floresta",
    },
    description: {
      es: "Rodeada de naturaleza, esta cabaña ofrece tranquilidad y confort.",
      en: "Surrounded by nature, this cabin offers tranquility and comfort.",
      pt: "Rodeada pela natureza, esta cabana oferece tranquilidade e conforto.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 140,
    capacity: 6,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
  {
    id: 3,
    name: {
      es: "Cabaña Lago",
      en: "Lake Cabin",
      pt: "Cabana Lago",
    },
    description: {
      es: "Con acceso directo al lago, ideal para los amantes de la pesca y la naturaleza.",
      en: "With direct access to the lake, ideal for fishing and nature lovers.",
      pt: "Com acesso direto ao lago, ideal para os amantes da pesca e da natureza.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 160,
    capacity: 8,
    amenities: ["wifi", "ac", "kitchen"],
  },
  {
    id: 4,
    name: {
      es: "Cabaña Montaña",
      en: "Mountain Cabin",
      pt: "Cabana Montanha",
    },
    description: {
      es: "Ubicada en lo alto, con vistas panorámicas y todas las comodidades.",
      en: "Located at the top, with panoramic views and all amenities.",
      pt: "Localizada no alto, com vistas panorâmicas e todas as comodidades.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 180,
    capacity: 10,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
]

export default function Cabins() {
  const [selectedCabin, setSelectedCabin] = useState<null | (typeof cabins)[0]>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { language, t } = useLanguage()

  // This would be replaced with actual Booking.com API integration
  const [bookedDates, setBookedDates] = useState<Date[]>([])

  useEffect(() => {
    // Simulate fetching booked dates from Booking.com API
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

  const handleCabinClick = (cabin: (typeof cabins)[0]) => {
    setSelectedCabin(cabin)
    setIsDialogOpen(true)
  }

  const getAmenityIcon = (amenity: string) => {
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

  const getAmenityLabel = (amenity: string) => {
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

  return (
    <section id="cabins" className="section-padding bg-beige">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("cabins.title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("cabins.subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cabins.map((cabin) => (
            <div
              key={cabin.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={cabin.image || "/placeholder.svg"}
                  alt={cabin.name[language as keyof typeof cabin.name]}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-brown mb-2">{cabin.name[language as keyof typeof cabin.name]}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{t("cabins.capacity", { count: cabin.capacity })}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {cabin.description[language as keyof typeof cabin.description]}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green font-bold text-lg">
                    ${cabin.price} USD <span className="text-sm font-normal">{t("cabins.perNight")}</span>
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
      </div>

      {/* Cabin Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedCabin && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-brown">
                  {selectedCabin.name[language as keyof typeof selectedCabin.name]}
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
                      alt={selectedCabin.name[language as keyof typeof selectedCabin.name]}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brown mb-2">{t("cabins.modal.description")}</h3>
                    <p className="text-gray-600">
                      {selectedCabin.description[language as keyof typeof selectedCabin.description]}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green font-bold text-2xl">${selectedCabin.price} USD</span>
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
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCabin.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="mr-3 text-green">{getAmenityIcon(amenity)}</div>
                        <span>{getAmenityLabel(amenity)}</span>
                      </div>
                    ))}
                  </div>
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
                            bookedDate.getFullYear() === date.getFullYear(),
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
