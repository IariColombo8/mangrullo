"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Departamento, Reserva } from "@/types/reserva"
import { DEPARTAMENTOS } from "@/types/reserva"

export default function PublicAvailabilitySearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(2)
  const [availableDepartments, setAvailableDepartments] = useState<Departamento[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      alert("Por favor selecciona las fechas de entrada y salida")
      return
    }

    if (checkOut <= checkIn) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada")
      return
    }

    setIsSearching(true)
    setSearchPerformed(false)

    try {
      console.log("[v0] Searching availability from", checkIn, "to", checkOut)
      const reservasRef = collection(db, "reservas")

      // Query para reservas que terminan después del check-in
      const q = query(reservasRef, where("fechaFin", ">=", Timestamp.fromDate(checkIn)))

      const snapshot = await getDocs(q)
      console.log("[v0] Found", snapshot.size, "reservas in date range")

      const occupiedDepts = new Set<Departamento>()

      snapshot.forEach((doc) => {
        const data = doc.data() as Reserva
        const reservaStart = data.fechaInicio.toDate()
        const reservaEnd = data.fechaFin.toDate()

        // Check if there's an overlap
        if (reservaStart < checkOut && reservaEnd > checkIn) {
          console.log("[v0] Department occupied:", data.departamento)
          occupiedDepts.add(data.departamento)
        }
      })

      // Find available departments
      const available = DEPARTAMENTOS.filter((dept) => !occupiedDepts.has(dept))
      console.log("[v0] Available departments:", available)
      setAvailableDepartments(available)
      setSearchPerformed(true)
    } catch (error) {
      console.error("[v0] Error searching availability:", error)
      alert("Hubo un error al buscar disponibilidad. Por favor intenta nuevamente.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleContactForBooking = (dept: Departamento) => {
    const checkInStr = checkIn ? format(checkIn, "dd/MM/yyyy") : ""
    const checkOutStr = checkOut ? format(checkOut, "dd/MM/yyyy") : ""
    const message = encodeURIComponent(
      `Hola, estoy interesado en reservar ${dept} desde el ${checkInStr} hasta el ${checkOutStr} para ${guests} personas.`,
    )
    window.open(`https://wa.me/5491234567890?text=${message}`, "_blank")
  }

  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Consultar Disponibilidad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Buscar Disponibilidad</DialogTitle>
          <DialogDescription>Verifica qué departamentos están disponibles para tus fechas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Entrada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !checkIn && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn || undefined}
                    onSelect={(date) => setCheckIn(date || null)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Salida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut || undefined}
                    onSelect={(date) => setCheckOut(date || null)}
                    disabled={(date) => date < new Date() || (checkIn ? date <= checkIn : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Cantidad de Personas</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value) || 1)}
                  className="pl-10"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="space-y-2">
                <Label>Noches</Label>
                <Input value={`${nights} ${nights === 1 ? "noche" : "noches"}`} disabled />
              </div>
            )}
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !checkIn || !checkOut}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSearching ? (
              "Buscando..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Disponibilidad
              </>
            )}
          </Button>

          {searchPerformed && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">
                {availableDepartments.length > 0 ? "Departamentos Disponibles" : "No hay disponibilidad"}
              </h3>

              {availableDepartments.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No hay departamentos disponibles para las fechas seleccionadas.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Por favor intenta con otras fechas o contáctanos para más opciones.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableDepartments.map((dept) => (
                    <Card key={dept} className="border-2 border-emerald-500 hover:shadow-lg transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{dept}</CardTitle>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                            Disponible
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleContactForBooking(dept)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          Reservar por WhatsApp
                        </Button>
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
