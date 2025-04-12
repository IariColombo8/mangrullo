"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { CalendarIcon, RefreshCw, Eye, Check, X } from "lucide-react"

// This would come from your Booking.com API in a real app
const bookings = [
  {
    id: "B001",
    cabinId: 1,
    cabinName: {
      es: "Cabaña Río",
      en: "River Cabin",
      pt: "Cabana Rio",
    },
    guestName: "Juan Pérez",
    checkIn: new Date(2023, 5, 15),
    checkOut: new Date(2023, 5, 20),
    guests: 2,
    status: "confirmed",
    total: 600,
    source: "booking.com",
  },
  {
    id: "B002",
    cabinId: 2,
    cabinName: {
      es: "Cabaña Bosque",
      en: "Forest Cabin",
      pt: "Cabana Floresta",
    },
    guestName: "María González",
    checkIn: new Date(2023, 6, 10),
    checkOut: new Date(2023, 6, 15),
    guests: 4,
    status: "confirmed",
    total: 700,
    source: "direct",
  },
  {
    id: "B003",
    cabinId: 3,
    cabinName: {
      es: "Cabaña Lago",
      en: "Lake Cabin",
      pt: "Cabana Lago",
    },
    guestName: "Carlos Rodríguez",
    checkIn: new Date(2023, 7, 5),
    checkOut: new Date(2023, 7, 10),
    guests: 6,
    status: "pending",
    total: 800,
    source: "booking.com",
  },
]

export default function BookingManager() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const handleSync = () => {
    setIsSyncing(true)

    // Simulate API call to Booking.com
    setTimeout(() => {
      setIsSyncing(false)
      toast({
        title: t("admin.bookings.syncSuccess"),
        description: t("admin.bookings.syncSuccessMessage"),
      })
    }, 2000)
  }

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // This would update the booking status in your Firebase in a real app
    toast({
      title: t("admin.bookings.statusChanged"),
      description: t("admin.bookings.statusChangedMessage", { status: newStatus }),
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green">{t("admin.bookings.statuses.confirmed")}</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {t("admin.bookings.statuses.pending")}
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">{t("admin.bookings.statuses.cancelled")}</Badge>
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.bookings.title")}</h2>
        <Button onClick={handleSync} className="bg-green hover:bg-green/90" disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? t("admin.bookings.syncing") : t("admin.bookings.syncWithBooking")}
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="mb-6">
          <TabsTrigger value="list">{t("admin.bookings.tabs.list")}</TabsTrigger>
          <TabsTrigger value="calendar">{t("admin.bookings.tabs.calendar")}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.cabinName[language as keyof typeof booking.cabinName]} - {booking.guestName}
                      </CardTitle>
                      <div className="text-sm text-gray-500">
                        {t("admin.bookings.bookingId")}: {booking.id}
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {booking.checkIn.toLocaleDateString()} - {booking.checkOut.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("admin.bookings.guests")}: {booking.guests}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("admin.bookings.total")}: ${booking.total}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("admin.bookings.source")}: {booking.source}
                      </div>
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        {t("admin.bookings.details")}
                      </Button>

                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green hover:bg-green/90"
                            onClick={() => handleStatusChange(booking.id, "confirmed")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t("admin.bookings.confirm")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t("admin.bookings.cancel")}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mx-auto"
              />

              <div className="mt-6">
                <h3 className="font-semibold mb-2">{selectedDate ? selectedDate.toLocaleDateString() : ""}</h3>
                <div className="space-y-2">
                  {bookings
                    .filter((booking) => {
                      if (!selectedDate) return false
                      const checkIn = new Date(booking.checkIn)
                      const checkOut = new Date(booking.checkOut)
                      return selectedDate >= checkIn && selectedDate <= checkOut
                    })
                    .map((booking) => (
                      <div key={booking.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">
                              {booking.cabinName[language as keyof typeof booking.cabinName]}
                            </div>
                            <div className="text-sm text-gray-600">
                              {booking.guestName} - {booking.guests} {t("admin.bookings.guests")}
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}

                  {selectedDate &&
                    bookings.filter((booking) => {
                      const checkIn = new Date(booking.checkIn)
                      const checkOut = new Date(booking.checkOut)
                      return selectedDate >= checkIn && selectedDate <= checkOut
                    }).length === 0 && (
                      <div className="text-center text-gray-500 py-4">{t("admin.bookings.noBookings")}</div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
