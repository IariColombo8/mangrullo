"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const DEPARTMENTS = [
  { id: "dept1", name: "Departamento Vista Mar" },
  { id: "dept2", name: "Departamento Vista Montaña" },
  { id: "dept3", name: "Departamento Centro" },
  { id: "dept4", name: "Departamento Premium" },
]

const BOOKING_ORIGINS = {
  booking: {
    name: "Booking",
    color: "bg-[#0071C2]",
    lightColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  airbnb: {
    name: "Airbnb",
    color: "bg-[#FF5A5F]",
    lightColor: "bg-pink-100",
    textColor: "text-pink-700",
  },
  upcn: {
    name: "UPCN (Gremio)",
    color: "bg-[#28A745]",
    lightColor: "bg-green-100",
    textColor: "text-green-700",
  },
  particular: {
    name: "Reserva Particular",
    color: "bg-[#FFA500]",
    lightColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  blocked: {
    name: "Bloqueado",
    color: "bg-[#6C757D]",
    lightColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
}

type ViewMode = "month" | "week" | "3months"

interface Booking {
  id: string
  departmentId: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  bookingType: string
  checkIn: Date
  checkOut: Date
  guests: number
  totalAmount: number
  notes?: string
  status: string
}

export default function MultiCalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const bookingsRef = collection(db, "bookings")
      const snapshot = await getDocs(bookingsRef)
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
          id: doc.id,
          ...docData,
          checkIn: docData.checkIn?.toDate ? docData.checkIn.toDate() : new Date(docData.checkIn),
          checkOut: docData.checkOut?.toDate ? docData.checkOut.toDate() : new Date(docData.checkOut),
        } as Booking
      })
      setBookings(data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateDate = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (viewMode === "month" || viewMode === "3months") {
        newDate.setMonth(prev.getMonth() + direction)
      } else {
        newDate.setDate(prev.getDate() + direction * 7)
      }
      return newDate
    })
  }

  const getDaysInView = () => {
    if (viewMode === "week") {
      const days = []
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        days.push(day)
      }
      return days
    }

    if (viewMode === "3months") {
      const days = []
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
        }
      }
      return days
    }

    // Default: month view
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getBookingsForDayAndDepartment = (date: Date, deptId: string) => {
    const dateStr = date.toISOString().split("T")[0]
    return bookings.filter((booking) => {
      if (booking.departmentId !== deptId) return false
      const checkIn = booking.checkIn.toISOString().split("T")[0]
      const checkOut = booking.checkOut.toISOString().split("T")[0]
      return dateStr >= checkIn && dateStr < checkOut
    })
  }

  const getOriginStyle = (bookingType: string) => {
    // Map old booking types to new origin types
    const mapping: Record<string, keyof typeof BOOKING_ORIGINS> = {
      booking: "booking",
      airbnb: "airbnb",
      direct: "particular",
      upcn: "upcn",
      blocked: "blocked",
      maintenance: "blocked",
    }
    const origin = mapping[bookingType] || "particular"
    return BOOKING_ORIGINS[origin]
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const days = getDaysInView()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Vista Multi-Calendario</h2>
          <p className="text-slate-600 mt-1">Visualiza los 4 departamentos simultáneamente</p>
        </div>

        <div className="flex gap-2 items-center">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="3months">3 Meses</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend - Color coding by origin */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-3">Leyenda - Origen de Reservas</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(BOOKING_ORIGINS).map(([key, origin]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${origin.color}`} />
              <span className="text-sm">{origin.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Multi-Calendar Grid */}
      <div className="space-y-6">
        {DEPARTMENTS.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-flex gap-1 min-w-full">
                  {days.map((day, idx) => {
                    const dayBookings = getBookingsForDayAndDepartment(day, dept.id)
                    const isToday = day.toDateString() === new Date().toDateString()
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6

                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 w-20 border rounded-lg p-2 ${
                          isToday ? "border-emerald-500 border-2 bg-emerald-50" : "border-gray-200"
                        } ${isWeekend ? "bg-gray-50" : "bg-white"}`}
                      >
                        <div className="text-center mb-1">
                          <div className="text-xs font-semibold text-gray-500">
                            {day.toLocaleDateString("es-ES", { weekday: "short" })}
                          </div>
                          <div className="text-lg font-bold text-gray-900">{day.getDate()}</div>
                          {day.getDate() === 1 && (
                            <div className="text-xs text-gray-500">
                              {day.toLocaleDateString("es-ES", { month: "short" })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayBookings.map((booking) => {
                            const originStyle = getOriginStyle(booking.bookingType)
                            const isCheckIn =
                              day.toISOString().split("T")[0] === booking.checkIn.toISOString().split("T")[0]
                            const isCheckOut =
                              day.toISOString().split("T")[0] === booking.checkOut.toISOString().split("T")[0]

                            return (
                              <div
                                key={booking.id}
                                onClick={() => handleBookingClick(booking)}
                                className={`${originStyle.color} rounded px-1 py-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                title={`${booking.guestName} - ${originStyle.name}`}
                              >
                                <div className="text-xs text-white font-medium truncate">
                                  {isCheckIn && "→ "}
                                  {booking.guestName.split(" ")[0]}
                                  {isCheckOut && " ←"}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>Información completa de la reserva seleccionada</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Huésped</p>
                  <p className="text-base font-semibold">{selectedBooking.guestName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Origen</p>
                  <Badge className={getOriginStyle(selectedBooking.bookingType).lightColor}>
                    <span className={getOriginStyle(selectedBooking.bookingType).textColor}>
                      {getOriginStyle(selectedBooking.bookingType).name}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in</p>
                  <p className="text-base">
                    {selectedBooking.checkIn.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-out</p>
                  <p className="text-base">
                    {selectedBooking.checkOut.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Personas</p>
                  <p className="text-base">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-base font-bold text-emerald-600">${selectedBooking.totalAmount}</p>
                </div>
                {selectedBooking.guestEmail && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-base">{selectedBooking.guestEmail}</p>
                  </div>
                )}
                {selectedBooking.guestPhone && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    <p className="text-base">{selectedBooking.guestPhone}</p>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Notas</p>
                    <p className="text-base">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Editar
                </Button>
                <Button variant="destructive" className="flex-1">
                  Cancelar Reserva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
