"use client"

import type React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay, isBefore, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, CheckCircle, AlertTriangle } from "lucide-react"
import type { Reserva, OrigenReserva } from "@/types/reserva"
import { ORIGENES } from "@/types/reserva"
import { cn } from "@/lib/utils"

interface GridViewProps {
  reservas: Reserva[]
  mes: Date
  cabins: { id: string; name: string }[]
  setViewingReserva: (reserva: Reserva) => void
}

const GridView: React.FC<GridViewProps> = ({ reservas, mes, cabins, setViewingReserva }) => {
  const startOfMonthDate = startOfMonth(mes)
  const endOfMonthDate = endOfMonth(mes)
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

  const getMonthReservations = () => {
    return reservas.filter((r) => {
      const inicio = r.fechaInicio as Date
      const fin = r.fechaFin as Date
      return (
        (inicio >= startOfMonthDate && inicio <= endOfMonthDate) ||
        (fin >= startOfMonthDate && fin <= endOfMonthDate) ||
        (inicio <= startOfMonthDate && fin >= endOfMonthDate)
      )
    })
  }

  const monthReservations = getMonthReservations()

  const needsPaymentAlert = (reserva: Reserva): boolean => {
    const today = startOfDay(new Date())
    const fechaSalida = reserva.fechaFin as Date
    return !reserva.hizoDeposito && isBefore(fechaSalida, today)
  }

  const getOrigenColor = (origen: OrigenReserva) => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getReservationsForDay = (day: Date, departamento: string) => {
    const dayStart = startOfDay(day)
    return monthReservations.filter((r) => {
      if (r.departamento !== departamento) return false
      const inicio = startOfDay(r.fechaInicio as Date)
      const fin = startOfDay(r.fechaFin as Date)
      // CORRECCIÓN 1: Esta lógica ya era correcta - pinta desde inicio hasta (fin-1)
      // Esto funciona correctamente para reservas que cruzan meses
      return dayStart >= inicio && dayStart < fin
    })
  }

  // CORRECCIÓN 2: Nueva función para determinar si es el primer día VISIBLE de una reserva en este mes
  const isFirstVisibleDay = (day: Date, reserva: Reserva) => {
    const dayStart = startOfDay(day)
    const reservaInicio = startOfDay(reserva.fechaInicio as Date)
    
    // Si el día es el inicio real de la reserva, es el primer día
    if (isSameDay(dayStart, reservaInicio)) return true
    
    // Si la reserva empezó antes del mes, y este día es el primer día del mes, es el primer día visible
    if (reservaInicio < startOfMonthDate && isSameDay(dayStart, startOfMonthDate)) return true
    
    return false
  }

  // CORRECCIÓN 3: Nueva función para determinar si es el último día VISIBLE de una reserva en este mes
  const isLastVisibleDay = (day: Date, reserva: Reserva) => {
    const dayStart = startOfDay(day)
    const reservaFin = startOfDay(reserva.fechaFin as Date)
    const lastPaintedDay = addDays(reservaFin, -1) // El último día que se pinta es fin-1
    
    // Si el día es el último día pintado real de la reserva, es el último día
    if (isSameDay(dayStart, lastPaintedDay)) return true
    
    // Si la reserva termina después del mes, y este día es el último del mes, es el último día visible
    if (reservaFin > endOfMonthDate && isSameDay(dayStart, endOfMonthDate)) return true
    
    return false
  }

  const getCalendarWeeks = () => {
    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    const firstDayOfWeek = daysInMonth[0].getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(new Date(0))
    }

    daysInMonth.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0))
      }
      weeks.push(currentWeek)
    }

    return weeks
  }

  const calendarWeeks = getCalendarWeeks()
  const weekDays = [
    { key: "dom", label: "D" },
    { key: "lun", label: "L" },
    { key: "mar", label: "M" },
    { key: "mie", label: "X" },
    { key: "jue", label: "J" },
    { key: "vie", label: "V" },
    { key: "sab", label: "S" },
  ]

  return (
    <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-4">
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {format(mes, "MMMM yyyy", { locale: es }).toUpperCase()}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cabins.map((cabin) => {
            const deptReservations = monthReservations.filter((r) => r.departamento === cabin.name)

            return (
              <Card key={cabin.id} className="bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <CardTitle className="text-sm font-bold">{cabin.name}</CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-2 py-0">
                      {deptReservations.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-2">
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {weekDays.map((day, idx) => (
                      <div
                        key={day.key}
                        className={cn(
                          "text-center text-[9px] font-bold py-1 rounded-t",
                          idx === 0 || idx === 6 ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5">
                    {calendarWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-cols-7 gap-0.5">
                        {week.map((day, dayIdx) => {
                          const isPlaceholder = day.getTime() === 0
                          if (isPlaceholder) {
                            return <div key={dayIdx} className="h-8 bg-gray-50 rounded" />
                          }

                          const dayReservations = getReservationsForDay(day, cabin.name)
                          const primaryReservation = dayReservations[0]
                          const hasMultiple = dayReservations.length > 1
                          const isToday = isSameDay(day, new Date())
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6
                          const hasAlert = primaryReservation ? needsPaymentAlert(primaryReservation) : false
                          const isCheckIn = primaryReservation && isSameDay(primaryReservation.fechaInicio as Date, day)
                          const isCheckOut = primaryReservation && isSameDay(primaryReservation.fechaFin as Date, day)
                          
                          // CORRECCIÓN 4: Determinar si es primer o último día visible de la reserva
                          const isFirstDay = primaryReservation ? isFirstVisibleDay(day, primaryReservation) : false
                          const isLastDay = primaryReservation ? isLastVisibleDay(day, primaryReservation) : false

                          return (
                            <div
                              key={day.toISOString()}
                              className={cn(
                                "h-8 rounded border transition-all duration-200 relative overflow-hidden cursor-pointer",
                                isToday && "ring-2 ring-emerald-400 ring-offset-1",
                                primaryReservation && !hasAlert && getOrigenColor(primaryReservation.origen),
                                primaryReservation && hasAlert && "bg-red-600",
                                !primaryReservation && isWeekend && "bg-gray-100 border-gray-200",
                                !primaryReservation && !isWeekend && "bg-white border-gray-200",
                                primaryReservation && "hover:brightness-110 shadow",
                                !primaryReservation && "hover:bg-gray-50",
                                isCheckIn && "border-l-2 border-l-green-600",
                                isCheckOut && "border-r-2 border-r-orange-600",
                                // CORRECCIÓN 5: Agregar bordes oscuros para separar visualmente las reservas
                                primaryReservation && isFirstDay && "border-l-[3px] border-l-gray-900",
                                primaryReservation && isLastDay && "border-r-[3px] border-r-gray-900",
                              )}
                              onClick={() => primaryReservation && setViewingReserva(primaryReservation)}
                              title={
                                primaryReservation
                                  ? `${primaryReservation.nombre}\n${format(primaryReservation.fechaInicio as Date, "dd/MM")} - ${format(primaryReservation.fechaFin as Date, "dd/MM")}\n${calculateNights(primaryReservation.fechaInicio as Date, primaryReservation.fechaFin as Date)} noches${hasAlert ? "\n⚠️ SIN PAGO" : ""}`
                                  : `${format(day, "dd/MM/yyyy")}\nDisponible`
                              }
                            >
                              <div
                                className={cn(
                                  "absolute top-0.5 left-0.5 text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center",
                                  primaryReservation
                                    ? "bg-black/20 text-white"
                                    : isToday
                                      ? "bg-emerald-500 text-white"
                                      : "text-gray-700",
                                )}
                              >
                                {format(day, "d")}
                              </div>

                              {hasMultiple && (
                                <div className="absolute top-0.5 right-0.5">
                                  <div className="bg-white/90 text-gray-900 text-[8px] px-1 rounded font-bold">
                                    +{dayReservations.length}
                                  </div>
                                </div>
                              )}

                              {isCheckIn && (
                                <div className="absolute bottom-0.5 left-0.5">
                                  <CheckCircle className="h-2.5 w-2.5 text-white drop-shadow bg-green-600 rounded-full p-[1px]" />
                                </div>
                              )}
                              {isCheckOut && (
                                <div className="absolute bottom-0.5 right-0.5">
                                  <Home className="h-2.5 w-2.5 text-white drop-shadow bg-orange-600 rounded-full p-[1px]" />
                                </div>
                              )}

                              {hasAlert && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <AlertTriangle className="h-3 w-3 text-white animate-pulse drop-shadow" />
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 mb-1">Orígenes:</p>
              {ORIGENES.slice(0, 4).map((origen) => (
                <div key={origen.value} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded border border-white shadow-sm", origen.color)}></div>
                  <span className="text-[10px] text-gray-700">{origen.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 mb-1">&nbsp;</p>
              {ORIGENES.slice(4).map((origen) => (
                <div key={origen.value} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded border border-white shadow-sm", origen.color)}></div>
                  <span className="text-[10px] text-gray-700">{origen.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 mb-1">Estados:</p>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-600 border border-white shadow-sm"></div>
                <span className="text-[10px] text-gray-700">Sin Pago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-white border border-emerald-500 ring-1 ring-emerald-400"></div>
                <span className="text-[10px] text-gray-700">Hoy</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-600 mb-1">Indicadores:</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-white bg-green-600 rounded-full p-0.5" />
                <span className="text-[10px] text-gray-700">Check-in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="h-3 w-3 text-white bg-orange-600 rounded-full p-0.5" />
                <span className="text-[10px] text-gray-700">Check-out</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-white bg-red-600 rounded-full p-0.5" />
                <span className="text-[10px] text-gray-700">Alerta</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GridView