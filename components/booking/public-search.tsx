"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { SearchFilters, AvailabilityResult, Department } from "@/types/booking"

const DEPARTMENTS: Department[] = [
  {
    id: "dept1",
    name: "Departamento Vista Mar",
    capacity: 4,
    pricePerNight: 120,
    color: "bg-blue-500",
    lightColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    id: "dept2",
    name: "Departamento Vista Montaña",
    capacity: 6,
    pricePerNight: 150,
    color: "bg-green-500",
    lightColor: "bg-green-100",
    textColor: "text-green-700",
  },
  {
    id: "dept3",
    name: "Departamento Centro",
    capacity: 4,
    pricePerNight: 100,
    color: "bg-purple-500",
    lightColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    id: "dept4",
    name: "Departamento Premium",
    capacity: 8,
    pricePerNight: 200,
    color: "bg-orange-500",
    lightColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
]

export default function PublicBookingSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AvailabilityResult[] | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    checkIn: null,
    checkOut: null,
    guests: 2,
    multipleUnits: false,
  })

  const handleSearch = async () => {
    if (!filters.checkIn || !filters.checkOut) {
      alert("Por favor selecciona las fechas de entrada y salida")
      return
    }

    if (filters.checkOut <= filters.checkIn) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada")
      return
    }

    setIsSearching(true)

    try {
      const bookingsRef = collection(db, "bookings")
      const bookingsSnapshot = await getDocs(bookingsRef)

      const existingBookings = bookingsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          departmentId: data.departmentId,
          checkIn: data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn),
          checkOut: data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut),
        }
      })

      const results: AvailabilityResult[] = DEPARTMENTS.map((dept) => {
        const isAvailable = !existingBookings.some((booking) => {
          if (booking.departmentId !== dept.id) return false

          const searchStart = filters.checkIn!
          const searchEnd = filters.checkOut!
          const bookingStart = booking.checkIn
          const bookingEnd = booking.checkOut

          // Check if dates overlap
          return (
            (searchStart >= bookingStart && searchStart < bookingEnd) ||
            (searchEnd > bookingStart && searchEnd <= bookingEnd) ||
            (searchStart <= bookingStart && searchEnd >= bookingEnd)
          )
        })

        const nights = Math.ceil((filters.checkOut!.getTime() - filters.checkIn!.getTime()) / (1000 * 60 * 60 * 24))
        const totalPrice = nights * dept.pricePerNight

        return {
          department: dept,
          available: isAvailable && dept.capacity >= filters.guests,
          totalPrice,
        }
      })

      setSearchResults(results)
    } catch (error) {
      console.error("Error searching availability:", error)
      alert("Hubo un error al buscar disponibilidad. Por favor intenta nuevamente.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleContactForBooking = (dept: Department) => {
    const checkInStr = filters.checkIn ? format(filters.checkIn, "dd/MM/yyyy") : ""
    const checkOutStr = filters.checkOut ? format(filters.checkOut, "dd/MM/yyyy") : ""
    const message = encodeURIComponent(
      `Hola, estoy interesado en reservar ${dept.name} desde el ${checkInStr} hasta el ${checkOutStr} para ${filters.guests} personas.`,
    )
    window.open(`https://wa.me/5491234567890?text=${message}`, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Reservar Ahora
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Buscar Disponibilidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">Fecha de Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.checkIn && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkIn ? format(filters.checkIn, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.checkIn || undefined}
                    onSelect={(date) => setFilters({ ...filters, checkIn: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">Fecha de Salida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.checkOut && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkOut ? format(filters.checkOut, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.checkOut || undefined}
                    onSelect={(date) => setFilters({ ...filters, checkOut: date || null })}
                    disabled={(date) => date < new Date() || (filters.checkIn ? date <= filters.checkIn : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Number of Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests">Cantidad de Personas</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={filters.guests}
                  onChange={(e) => setFilters({ ...filters, guests: Number.parseInt(e.target.value) || 1 })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Multiple Units Checkbox */}
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="multipleUnits"
                checked={filters.multipleUnits}
                onCheckedChange={(checked) => setFilters({ ...filters, multipleUnits: checked as boolean })}
              />
              <Label htmlFor="multipleUnits" className="text-sm font-normal cursor-pointer">
                Necesito múltiples departamentos
              </Label>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isSearching ? (
              "Buscando..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Disponibilidad
              </>
            )}
          </Button>

          {searchResults && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Resultados de Búsqueda</h3>

              {searchResults.filter((r) => r.available).length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No hay departamentos disponibles para las fechas seleccionadas.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Por favor intenta con otras fechas o contáctanos para más opciones.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result) => (
                    <Card
                      key={result.department.id}
                      className={cn(
                        "transition-all",
                        result.available ? "border-2 border-emerald-500 hover:shadow-lg" : "opacity-50 bg-gray-50",
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{result.department.name}</CardTitle>
                          {result.available ? (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                              Disponible
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                              No disponible
                            </span>
                          )}
                        </div>
                        <CardDescription>Capacidad: {result.department.capacity} personas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Precio por noche:</span>
                            <span className="font-semibold">${result.department.pricePerNight}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Precio total estimado:</span>
                            <span className="text-xl font-bold text-emerald-600">${result.totalPrice}</span>
                          </div>
                          {result.available && (
                            <Button
                              onClick={() => handleContactForBooking(result.department)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              Continuar con la Reserva
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
