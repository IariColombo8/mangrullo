"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Reserva,
  ReservaFormData,
  Departamento,
  OrigenReserva,
  ContactoParticular,
  PrecioNoche,
} from "@/types/reserva"
import { ORIGENES, CONTACTOS_PARTICULARES } from "@/types/reserva"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  CalendarIcon,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  Printer,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  endOfDay, // Import endOfDay
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const PAISES = [
  { code: "AR", name: "Argentina", currency: "pesos" },
  { code: "UY", name: "Uruguay", currency: "uruguayos" },
  { code: "BR", name: "Brasil", currency: "dolares" },
  { code: "CL", name: "Chile", currency: "dolares" },
  { code: "US", name: "Estados Unidos", currency: "dolares" },
  { code: "ES", name: "España", currency: "dolares" },
  { code: "FR", name: "Francia", currency: "dolares" },
  { code: "OTHER", name: "Otro", currency: "dolares" },
]

const toValidDate = (dateValue: any): Date => {
  if (!dateValue) return new Date()

  // Si ya es una fecha válida
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue
  }

  // Si es un Timestamp de Firestore
  if (dateValue.toDate && typeof dateValue.toDate === "function") {
    try {
      const converted = dateValue.toDate()
      return isNaN(converted.getTime()) ? new Date() : converted
    } catch (e) {
      console.error("[v0] Error converting Firestore timestamp:", e)
      return new Date()
    }
  }

  // Si es un string o número
  try {
    const converted = new Date(dateValue)
    return isNaN(converted.getTime()) ? new Date() : converted
  } catch (e) {
    console.error("[v0] Error parsing date:", e)
    return new Date()
  }
}

const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0"
  return value.toLocaleString()
}

const getPrecioNocheValue = (reserva: Reserva): number => {
  if (!reserva.precioNoche || typeof reserva.precioNoche !== "object") return 0
  const currency = reserva.moneda || "ARS" // Default to ARS if moneda is not specified
  return reserva.precioNoche[currency] || 0
}

// Helper function for timeline view
const TimelineView = ({
  reservas,
  mes,
  cabins,
  setViewingReserva,
}: {
  reservas: Reserva[]
  mes: Date
  cabins: { id: string; name: string }[]
  setViewingReserva: (reserva: Reserva) => void
}) => {
  const startOfMonthDate = startOfMonth(mes)
  const endOfMonthDate = endOfMonth(mes)
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

  const getMonthReservations = () => {
    return reservas.filter((r) => {
      const inicio = r.fechaInicio as Date
      const fin = r.fechaFin as Date
      // Check if the reservation overlaps with the current month at all
      return (
        (inicio >= startOfMonthDate && inicio < endOfMonthDate) || // Starts within the month
        (fin > startOfMonthDate && fin <= endOfMonthDate) || // Ends within the month
        (inicio <= startOfMonthDate && fin >= endOfMonthDate) // Spans the entire month
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

  const getReservationForDayAndDept = (day: Date, departamento: string): Reserva | null => {
    const dayStart = startOfDay(day)
    return (
      monthReservations.find((r) => {
        if (r.departamento !== departamento) return false
        const inicio = startOfDay(r.fechaInicio as Date)
        const fin = startOfDay(r.fechaFin as Date)
        return dayStart >= inicio && dayStart < fin
      }) || null
    )
  }

  return (
    <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header con días - MÁS COMPACTO */}
            <div className="grid grid-cols-[120px_1fr] gap-0 border-b-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 sticky top-0 z-20">
              <div className="p-2 font-bold text-emerald-900 text-xs flex items-center border-r-2 border-emerald-300">
                Departamento
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(28px, 1fr))` }}>
                {daysInMonth.map((day) => {
                  const isToday = isSameDay(day, new Date())
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border-l border-emerald-200 p-1 text-center",
                        isToday && "bg-emerald-300 ring-1 ring-emerald-500",
                        !isToday && isWeekend && "bg-emerald-100",
                        !isToday && !isWeekend && "bg-emerald-50",
                      )}
                    >
                      <div className={cn("font-bold text-[10px]", isToday && "text-emerald-900")}>
                        {format(day, "d")}
                      </div>
                      <div className={cn("text-[8px]", isToday ? "text-emerald-900 font-bold" : "text-gray-600")}>
                        {format(day, "EEE", { locale: es })[0]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filas de departamentos - MÁS COMPACTAS */}
            {cabins.map((cabin) => (
              <div
                key={cabin.id}
                className="grid grid-cols-[120px_1fr] gap-0 border-b border-gray-300 hover:bg-gray-50/50 transition-colors"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 font-semibold text-xs flex items-center border-r-2 border-gray-300">
                  <Home className="h-3 w-3 mr-1 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{cabin.name}</span>
                </div>

                <div
                  className="grid relative min-h-[45px]"
                  style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(28px, 1fr))` }}
                >
                  {/* Celdas de días con color de fondo */}
                  {daysInMonth.map((day, dayIndex) => {
                    const isToday = isSameDay(day, new Date())
                    const reserva = getReservationForDayAndDept(day, cabin.name)
                    const hasAlert = reserva ? needsPaymentAlert(reserva) : false

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "border-l border-gray-200 min-h-[45px]",
                          isToday && "border-l-2 border-emerald-500",
                          hasAlert && "bg-red-100",
                          !hasAlert && reserva && getOrigenColor(reserva.origen).replace("bg-", "bg-opacity-20 bg-"),
                          !reserva && "bg-white",
                        )}
                      />
                    )
                  })}

                  {monthReservations
                    .filter((r) => r.departamento === cabin.name)
                    .map((reserva, idx) => {
                      const reservaStartDate = startOfDay(reserva.fechaInicio as Date)
                      const reservaEndDate = startOfDay(reserva.fechaFin as Date)

                      // Calcular inicio y fin efectivos dentro del mes visible
                      const effectiveStart = reservaStartDate < startOfMonthDate ? startOfMonthDate : reservaStartDate
                      const effectiveEnd = reservaEndDate > endOfMonthDate ? endOfMonthDate : reservaEndDate

                      // Calcular posición y ancho dentro del mes
                      const startDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveStart))
                      const endDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveEnd))

                      // Si la reserva no está visible en este mes, no renderizar
                      if (startDayIndex === -1 && endDayIndex === -1) return null

                      // Calcular el día de inicio y la cantidad de días visibles
                      const visibleStartDay = startDayIndex >= 0 ? startDayIndex : 0
                      const visibleEndDay = endDayIndex >= 0 ? endDayIndex : daysInMonth.length - 1
                      const visibleDays = visibleEndDay - visibleStartDay + 1

                      // Calcular noches totales (para mostrar en tooltip)
                      const totalNights = calculateNights(reservaStartDate, reservaEndDate)

                      const hasAlert = needsPaymentAlert(reserva)
                      const origenColorClass = getOrigenColor(reserva.origen)

                      // Indicadores de continuación
                      const continuesFromPrevMonth = reservaStartDate < startOfMonthDate
                      const continuesToNextMonth = reservaEndDate > endOfMonthDate

                      return (
                        <div
                          key={`${reserva.id}-${idx}`}
                          className={cn(
                            "absolute h-[38px] top-[3px] rounded cursor-pointer transition-all hover:z-30 hover:shadow-xl border-2 flex items-center px-1 text-[9px] font-medium text-white overflow-hidden",
                            origenColorClass,
                            hasAlert && "border-red-600 ring-2 ring-red-300",
                            !hasAlert && "border-gray-400 shadow-md",
                          )}
                          style={{
                            left: `${(visibleStartDay / daysInMonth.length) * 100}%`,
                            width: `${(visibleDays / daysInMonth.length) * 100}%`,
                            zIndex: 10 + idx,
                          }}
                          onClick={() => setViewingReserva(reserva)}
                          title={`${reserva.nombre} - ${reserva.origen} - ${totalNights} noches`}
                        >
                          {/* Indicador de continuación desde mes anterior */}
                          {continuesFromPrevMonth && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />}

                          <div className="flex items-center justify-between w-full">
                            <span className="truncate flex-1">{reserva.nombre.split(" ")[0]}</span>
                            {hasAlert && <AlertTriangle className="h-3 w-3 ml-1 flex-shrink-0" />}
                          </div>

                          {/* Indicador de continuación hacia mes siguiente */}
                          {continuesToNextMonth && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded border border-gray-300 bg-emerald-300"></div>
              <span>Hoy</span>
            </div>
            {ORIGENES.map((origen) => (
              <div key={origen.value} className="flex items-center gap-1">
                <div className={cn("w-4 h-4 rounded border border-gray-300", origen.color)}></div>
                <span>{origen.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Sin pago vencido</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-white/50 border-l-2 border-gray-600"></div>
              <span>Continúa de/hacia otro mes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function for grid view
const GridView = ({
  reservas,
  mes,
  cabins,
  setViewingReserva,
}: {
  reservas: Reserva[]
  mes: Date
  cabins: { id: string; name: string }[]
  setViewingReserva: (reserva: Reserva) => void
}) => {
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
      return dayStart >= inicio && dayStart < fin
    })
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
        {/* Header del mes */}
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {format(mes, "MMMM yyyy", { locale: es }).toUpperCase()}
          </h3>
        </div>

        {/* Grid 2x2 de calendarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cabins.map((cabin) => {
            const deptReservations = monthReservations.filter((r) => r.departamento === cabin.name)

            return (
              <Card key={cabin.id} className="bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-200">
                {/* Header compacto */}
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
                  {/* Días de la semana - MÁS COMPACTOS */}
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

                  {/* Semanas del mes - MÁS COMPACTAS */}
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
                              )}
                              onClick={() => primaryReservation && setViewingReserva(primaryReservation)}
                              title={
                                primaryReservation
                                  ? `${primaryReservation.nombre}\n${format(primaryReservation.fechaInicio as Date, "dd/MM")} - ${format(primaryReservation.fechaFin as Date, "dd/MM")}\n${calculateNights(primaryReservation.fechaInicio as Date, primaryReservation.fechaFin as Date)} noches${hasAlert ? "\n⚠️ SIN PAGO" : ""}`
                                  : `${format(day, "dd/MM/yyyy")}\nDisponible`
                              }
                            >
                              {/* Número del día - MÁS PEQUEÑO */}
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

                              {/* Badge de múltiples - MÁS PEQUEÑO */}
                              {hasMultiple && (
                                <div className="absolute top-0.5 right-0.5">
                                  <div className="bg-white/90 text-gray-900 text-[8px] px-1 rounded font-bold">
                                    +{dayReservations.length}
                                  </div>
                                </div>
                              )}

                              {/* Indicadores - MÁS PEQUEÑOS */}
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

                              {/* Alerta - MÁS PEQUEÑA */}
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

        {/* Leyenda compacta */}
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

const ComprobanteProfesional = ({
  reserva,
  onClose,
  onEdit,
}: {
  reserva: Reserva
  onClose: () => void
  onEdit: () => void
}) => {
  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const noches = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
  const paisData = PAISES.find((p) => p.code === reserva.pais)

  const monedaMostrar = reserva.moneda || "ARS"
  const simboloMoneda = monedaMostrar === "ARS" ? "ARS: $" : monedaMostrar === "UYU" ? "UYU: $" : "USD: $"

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Border exterior decorativo */}
      <div className="border-4 border-double border-gray-400 rounded-lg p-8">
        {/* Header con logo y título */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex justify-center items-center mb-4">
            <img src="/mangrullo.png" alt="El Mangrullo" className="h-20 w-auto object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-wide">EL MANGRULLO</h1>
          <p className="text-lg text-gray-600 border-b border-gray-300 inline-block pb-1">Complejo Turístico</p>
        </div>

        {/* Información de contacto y número de comprobante */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div className="space-y-1">
            <p className="text-gray-700">
              <span className="font-semibold">Federación - Entre Ríos</span>
            </p>
            <p className="text-gray-600">WhatsApp: +54 9 3456 551-306</p>
            <p className="text-gray-600">Instagram: @el_mangrullo_federacion</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-gray-700">
              N° de comprobante: <span className="font-semibold">{reserva.id?.substring(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-gray-700">
              Fecha de emisión: <span className="font-semibold">{format(new Date(), "dd/MM/yyyy")}</span>
            </p>
          </div>
        </div>

        {/* Título de sección */}
        <div className="bg-gray-200 py-3 px-4 mb-6">
          <h2 className="text-center text-xl font-bold text-gray-800 tracking-wider">COMPROBANTE DE RESERVA / PAGO</h2>
        </div>

        {/* Datos del huésped */}
        <div className="space-y-6 mb-6">
          <div>
            <label className="text-gray-700 font-semibold text-sm">Nombre del huésped:</label>
            <div className="border-b-2 border-gray-400 py-2 mt-1">
              <p className="text-gray-900 font-medium">{reserva.nombre}</p>
            </div>
          </div>

          <div>
            <label className="text-gray-700 font-semibold text-sm">País:</label>
            <div className="border-b-2 border-gray-400 py-2 mt-1">
              <p className="text-gray-900 font-medium">{paisData?.name || reserva.pais}</p>
            </div>
          </div>

          {/* Canal de alquiler */}
          <div>
            <label className="text-gray-700 font-semibold text-sm mb-2 block">Canal de alquiler:</label>
            <div className="flex gap-6 py-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                    reserva.origen === "particular" && "bg-gray-800",
                  )}
                >
                  {reserva.origen === "particular" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-gray-700">Particular</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                    reserva.origen === "booking" && "bg-gray-800",
                  )}
                >
                  {reserva.origen === "booking" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-gray-700">Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                    reserva.origen === "airbnb" && "bg-gray-800",
                  )}
                >
                  {reserva.origen === "airbnb" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-gray-700">Airbnb</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                    reserva.origen === "upcn" && "bg-gray-800",
                  )}
                >
                  {reserva.origen === "upcn" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-gray-700">UPCN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de 2 columnas - Detalles y Precios */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Columna izquierda - Departamentos y fechas */}
          <div className="bg-gray-100 p-4 space-y-4">
            <div>
              <label className="text-gray-700 font-semibold text-sm">Departamento/s:</label>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                      reserva.departamento === "Los Horneros" && "bg-gray-800",
                    )}
                  >
                    {reserva.departamento === "Los Horneros" && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700">Los Horneros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                      reserva.departamento === "Los Zorzales" && "bg-gray-800",
                    )}
                  >
                    {reserva.departamento === "Los Zorzales" && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700">Los Zorzales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                      reserva.departamento === "Los Tordos" && "bg-gray-800",
                    )}
                  >
                    {reserva.departamento === "Los Tordos" && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700">Los Tordos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 border-2 border-gray-600 flex items-center justify-center",
                      reserva.departamento === "Las Calandrias" && "bg-gray-800",
                    )}
                  >
                    {reserva.departamento === "Las Calandrias" && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700">Las Calandrias</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Fecha de entrada:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{format(reserva.fechaInicio as Date, "dd / MM / yyyy")}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Fecha de salida:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{format(reserva.fechaFin as Date, "dd / MM / yyyy")}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Cantidad de noches:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900 font-bold">{noches}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Cantidad de personas:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">_____________</p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Precios */}
          <div className="bg-gray-100 p-4 space-y-4">
            <div>
              <label className="text-gray-700 font-semibold text-sm">Precio por noche:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">
                  {simboloMoneda} {formatCurrency(getPrecioNocheValue(reserva))}
                </p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Cantidad de noches:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900 font-bold">{noches}</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-400">
              <label className="text-gray-700 font-semibold text-sm">SUBTOTAL:</label>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-lg">{formatCurrency(reserva.precioTotal)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="text-gray-700 font-semibold text-sm">TOTAL A PAGAR:</label>
              <div className="mt-2 space-y-1 bg-gray-200 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-xl">{formatCurrency(reserva.precioTotal)}</span>
                </div>
              </div>
            </div>

            {reserva.hizoDeposito && (
              <div className="pt-2">
                <label className="text-gray-700 font-semibold text-sm">SEÑA / DEPÓSITO:</label>
                <div className="mt-2 bg-green-100 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold">{simboloMoneda}</span>
                    <span className="text-green-700 font-bold text-lg">{formatCurrency(reserva.montoDeposito)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <label className="text-gray-700 font-semibold text-sm mb-2 block">OBSERVACIONES:</label>
          <div className="border-2 border-gray-300 rounded p-3 min-h-[80px] bg-gray-50">
            <p className="text-gray-700 text-sm">{reserva.notas || "Sin observaciones"}</p>
          </div>
        </div>

        {/* Footer con logo */}
        <div className="flex justify-end items-center pt-6 border-t-2 border-gray-300">
          <div className="flex items-center gap-3">
            <img src="/mangrullo.png" alt="El Mangrullo" className="h-20 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide">EL MANGRULLO</h2>
          </div>
      </div>

      {/* Botones de acción - se ocultan al imprimir */}
      <div className="flex gap-3 mt-6 print:hidden">
        <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
          Cerrar
        </Button>
        <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={onEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  )
}

export default function ReservasManager() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cabins, setCabins] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null)
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null)
  const [deleteReserva, setDeleteReserva] = useState<Reserva | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartamento, setFilterDepartamento] = useState<string>("todos")
  const [filterOrigen, setFilterOrigen] = useState<string>("todos")
  const [filterPais, setFilterPais] = useState<string>("todos")
  const [filterDeposito, setFilterDeposito] = useState<string>("todos")
  const [filterCheckinDesde, setFilterCheckinDesde] = useState<Date | undefined>(undefined)
  const [filterCheckinHasta, setFilterCheckinHasta] = useState<Date | undefined>(undefined)
  const [filterCheckoutDesde, setFilterCheckoutDesde] = useState<Date | undefined>(undefined)
  const [filterCheckoutHasta, setFilterCheckoutHasta] = useState<Date | undefined>(undefined)
  const [filterMes, setFilterMes] = useState<Date>(new Date())

  const [viewMode, setViewMode] = useState<"tabla" | "timeline" | "grid">("tabla")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const [formData, setFormData] = useState<ReservaFormData>({
    departamento: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    nombre: "",
    pais: "AR",
    numero: "",
    origen: "particular",
    hizoDeposito: false,
    precioNoche: { pesos: 0 },
    precioImpuestos: 0,
    precioGanancia: 0,
    precioTotal: 0,
    moneda: "AR", // Default currency
  })

  useEffect(() => {
    loadCabins()
    loadReservas()
  }, [])

  const loadCabins = async () => {
    try {
      const cabinsRef = collection(db, "cabins")
      const snapshot = await getDocs(cabinsRef)
      const cabinsData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name?.es || data.nameEs || `Cabaña ${doc.id}`,
        }
      })
      setCabins(cabinsData)
      if (cabinsData.length > 0 && !formData.departamento) {
        setFormData((prev) => ({ ...prev, departamento: cabinsData[0].name }))
      }
    } catch (error) {
      console.error("Error cargando cabañas:", error)
    }
  }

  const loadReservas = async () => {
    setLoading(true)
    try {
      const reservasRef = collection(db, "reservas")
      const snapshot = await getDocs(reservasRef)

      const reservasData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate() : toValidDate(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate() : toValidDate(data.fechaFin),
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : toValidDate(data.fechaCreacion),
        } as Reserva
      })

      reservasData.sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime())
      setReservas(reservasData)
    } catch (error) {
      console.error("Error loading reservas:", error)
      alert("Error al cargar las reservas: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkOverlap = (departamento: Departamento, fechaInicio: Date, fechaFin: Date, excludeId?: string): boolean => {
    return reservas.some((reserva) => {
      if (reserva.id === excludeId) return false
      if (reserva.departamento !== departamento) return false

      const rStart = (reserva.fechaInicio as Date).getTime()
      const rEnd = (reserva.fechaFin as Date).getTime()
      const newStart = fechaInicio.getTime()
      const newEnd = fechaFin.getTime()

      // Check for overlap: new range starts before existing range ends AND new range ends after existing range starts
      return newStart < rEnd && newEnd > rStart
    })
  }

  const cleanDataForFirestore = (data: any) => {
    const cleaned: any = {}
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        cleaned[key] = data[key]
      }
    })
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.numero || !formData.departamento) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    if (formData.fechaFin <= formData.fechaInicio) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada")
      return
    }

    const hasOverlap = checkOverlap(formData.departamento, formData.fechaInicio, formData.fechaFin, editingReserva?.id)

    if (hasOverlap) {
      alert("Ya existe una reserva para este departamento en las fechas seleccionadas")
      return
    }

    try {
      const reservaData: any = {
        departamento: formData.departamento,
        fechaInicio: Timestamp.fromDate(formData.fechaInicio),
        fechaFin: Timestamp.fromDate(formData.fechaFin),
        nombre: formData.nombre,
        pais: formData.pais,
        numero: formData.numero,
        origen: formData.origen,
        hizoDeposito: formData.hizoDeposito,
        precioNoche: formData.precioNoche,
        precioImpuestos: formData.precioImpuestos,
        precioGanancia: formData.precioGanancia,
        precioTotal: formData.precioTotal,
        moneda: formData.moneda,
        fechaCreacion: editingReserva?.fechaCreacion
          ? Timestamp.fromDate(editingReserva.fechaCreacion as Date)
          : Timestamp.now(),
      }

      if (formData.contactoParticular) {
        reservaData.contactoParticular = formData.contactoParticular
      }
      if (formData.montoDeposito !== undefined && formData.montoDeposito !== null) {
        reservaData.montoDeposito = formData.montoDeposito
      }
      if (formData.notas) {
        reservaData.notas = formData.notas
      }

      if (editingReserva) {
        await updateDoc(doc(db, "reservas", editingReserva.id!), cleanDataForFirestore(reservaData))
      } else {
        await addDoc(collection(db, "reservas"), cleanDataForFirestore(reservaData))
      }

      setIsDialogOpen(false)
      setEditingReserva(null)
      resetForm()
      loadReservas()
    } catch (error) {
      console.error("Error saving reserva:", error)
      alert("Error al guardar la reserva: " + (error as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!deleteReserva?.id) return

    try {
      await deleteDoc(doc(db, "reservas", deleteReserva.id))
      setDeleteReserva(null)
      loadReservas()
    } catch (error) {
      console.error("Error deleting reserva:", error)
      alert("Error al eliminar la reserva")
    }
  }

  const resetForm = () => {
    setFormData({
      departamento: cabins[0]?.name || "",
      fechaInicio: new Date(),
      fechaFin: new Date(),
      nombre: "",
      pais: "AR",
      numero: "",
      origen: "particular",
      hizoDeposito: false,
      precioNoche: { pesos: 0 },
      precioImpuestos: 0,
      precioGanancia: 0,
      precioTotal: 0,
      moneda: "AR", // Reset to default currency
    })
  }

  const openEditDialog = (reserva: Reserva) => {
    setEditingReserva(reserva)
    setFormData({
      departamento: reserva.departamento,
      fechaInicio: reserva.fechaInicio as Date,
      fechaFin: reserva.fechaFin as Date,
      nombre: reserva.nombre,
      pais: reserva.pais,
      numero: reserva.numero,
      origen: reserva.origen,
      contactoParticular: reserva.contactoParticular,
      hizoDeposito: reserva.hizoDeposito,
      montoDeposito: reserva.montoDeposito,
      precioNoche: reserva.precioNoche || { pesos: 0 }, // Ensure it's an object
      precioImpuestos: reserva.precioImpuestos,
      precioGanancia: reserva.precioGanancia,
      precioTotal: reserva.precioTotal,
      notas: reserva.notas,
      moneda: reserva.moneda || "AR", // Ensure moneda is set
    })
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingReserva(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCurrency = (pais: string, origen: OrigenReserva): string => {
    if (origen === "booking" || origen === "airbnb") return "dolares"
    const paisData = PAISES.find((p) => p.code === pais)
    return paisData?.currency || "dolares"
  }

  const needsPaymentAlert = (reserva: Reserva): boolean => {
    const today = startOfDay(new Date())
    const fechaSalida = reserva.fechaFin as Date
    return !reserva.hizoDeposito && isBefore(fechaSalida, today)
  }

  const getTodayReservations = () => {
    const today = startOfDay(new Date())
    const checkIns = reservas.filter((r) => isSameDay(r.fechaInicio as Date, today))
    const checkOuts = reservas.filter((r) => isSameDay(r.fechaFin as Date, today))
    return { checkIns, checkOuts }
  }

  const { checkIns, checkOuts } = getTodayReservations()

  const filteredReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      const matchesSearch =
        !searchTerm ||
        (reserva.nombre && reserva.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reserva.numero && reserva.numero.includes(searchTerm))

      const matchesDepartamento = filterDepartamento === "todos" || reserva.departamento === filterDepartamento
      const matchesOrigen = filterOrigen === "todos" || reserva.origen === filterOrigen
      const matchesPais = filterPais === "todos" || reserva.pais === filterPais

      let matchesDeposito = true
      if (filterDeposito === "si") {
        matchesDeposito = reserva.hizoDeposito
      } else if (filterDeposito === "no") {
        matchesDeposito = !reserva.hizoDeposito
      }

      let matchesCheckinDesde = true
      if (filterCheckinDesde) {
        matchesCheckinDesde = (reserva.fechaInicio as Date) >= filterCheckinDesde
      }

      let matchesCheckinHasta = true
      if (filterCheckinHasta) {
        matchesCheckinHasta = (reserva.fechaInicio as Date) <= filterCheckinHasta
      }

      let matchesCheckoutDesde = true
      if (filterCheckoutDesde) {
        matchesCheckoutDesde = (reserva.fechaFin as Date) >= filterCheckoutDesde
      }

      let matchesCheckoutHasta = true
      if (filterCheckoutHasta) {
        matchesCheckoutHasta = (reserva.fechaFin as Date) <= filterCheckoutHasta
      }

      const reservaMonth = (reserva.fechaInicio as Date).getMonth()
      const reservaYear = (reserva.fechaInicio as Date).getFullYear()
      const filterMonth = filterMes.getMonth()
      const filterYear = filterMes.getFullYear()
      const matchesMes = reservaMonth === filterMonth && reservaYear === filterYear

      return (
        matchesSearch &&
        matchesDepartamento &&
        matchesOrigen &&
        matchesPais &&
        matchesDeposito &&
        matchesCheckinDesde &&
        matchesCheckinHasta &&
        matchesCheckoutDesde &&
        matchesCheckoutHasta &&
        matchesMes
      )
    })
  }, [
    reservas,
    searchTerm,
    filterDepartamento,
    filterOrigen,
    filterPais,
    filterDeposito,
    filterCheckinDesde,
    filterCheckinHasta,
    filterCheckoutDesde,
    filterCheckoutHasta,
    filterMes,
  ])

  const paginatedReservas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredReservas.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredReservas, currentPage])

  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage)

  const getOrigenColor = (origen: OrigenReserva) => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterDepartamento("todos")
    setFilterOrigen("todos")
    setFilterPais("todos")
    setFilterDeposito("todos")
    setFilterCheckinDesde(undefined)
    setFilterCheckinHasta(undefined)
    setFilterCheckoutDesde(undefined)
    setFilterCheckoutHasta(undefined)
    setFilterMes(new Date())
  }

  const hasActiveFilters =
    searchTerm ||
    filterDepartamento !== "todos" ||
    filterOrigen !== "todos" ||
    filterPais !== "todos" ||
    filterDeposito !== "todos" ||
    filterCheckinDesde ||
    filterCheckinHasta ||
    filterCheckoutDesde ||
    filterCheckoutHasta

  const stats = useMemo(() => {
    const totalReservas = filteredReservas.length
    const totalIngresos = filteredReservas.reduce((sum, r) => sum + (r.precioTotal || 0), 0)
    const reservasPorDepartamento = cabins.map((cabin) => ({
      dept: cabin.name,
      count: filteredReservas.filter((r) => r.departamento === cabin.name).length,
    }))
    const startOfSelectedMonth = startOfMonth(filterMes)
    const endOfSelectedMonth = endOfMonth(filterMes)
    const daysInSelectedMonth =
      Math.ceil((endOfSelectedMonth.getTime() - startOfSelectedMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const totalDiasPotenciales = cabins.length * daysInSelectedMonth
    const diasOcupados = filteredReservas.reduce((sum, r) => {
      const reservaStart = startOfDay(r.fechaInicio as Date)
      const reservaEnd = endOfDay(r.fechaFin as Date) // Corrected this line

      // Clip reservation days to the selected month
      const effectiveStart = reservaStart < startOfSelectedMonth ? startOfSelectedMonth : reservaStart
      const effectiveEnd = reservaEnd > endOfSelectedMonth ? endOfSelectedMonth : reservaEnd

      if (effectiveStart >= effectiveEnd) return sum

      const nights = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)

    const ocupacionTotal = totalDiasPotenciales > 0 ? ((diasOcupados / totalDiasPotenciales) * 100).toFixed(1) : "0.0"

    return { totalReservas, totalIngresos, reservasPorDepartamento, ocupacionTotal }
  }, [filteredReservas, cabins, filterMes])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-semibold text-emerald-900">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-100">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Reservas - El Mangrullo
            </h2>
            <p className="text-gray-600">Gestiona todas las reservas de los departamentos</p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>

        {(checkIns.length > 0 || checkOuts.length > 0) && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">
                  Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900">Check-ins ({checkIns.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {checkIns.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay check-ins hoy</p>
                    ) : (
                      checkIns.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{reserva.nombre}</p>
                            <p className="text-xs text-gray-600">{reserva.departamento}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!reserva.hizoDeposito && (
                              <AlertTriangle className="h-4 w-4 text-red-500" title="Sin depósito" />
                            )}
                            <Badge className={cn("text-white text-xs", getOrigenColor(reserva.origen))}>
                              {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">Check-outs ({checkOuts.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {checkOuts.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay check-outs hoy</p>
                    ) : (
                      checkOuts.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{reserva.nombre}</p>
                            <p className="text-xs text-gray-600">{reserva.departamento}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!reserva.hizoDeposito && (
                              <AlertTriangle className="h-4 w-4 text-red-500" title="Sin depósito" />
                            )}
                            <Badge className={cn("text-white text-xs", getOrigenColor(reserva.origen))}>
                              {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-900">Filtros</h3>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Mes</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-emerald-50 border-emerald-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                        {format(filterMes, "MMMM yyyy", { locale: es })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 space-y-2 bg-white">
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="icon" onClick={() => setFilterMes(subMonths(filterMes, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold text-emerald-900">
                            {format(filterMes, "MMMM yyyy", { locale: es })}
                          </span>
                          <Button variant="outline" size="icon" onClick={() => setFilterMes(addMonths(filterMes, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                          onClick={() => setFilterMes(new Date())}
                        >
                          Mes actual
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Departamento</Label>
                  <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                    <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {cabins.map((cabin) => (
                        <SelectItem key={cabin.id} value={cabin.name}>
                          {cabin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Origen</Label>
                  <Select value={filterOrigen} onValueChange={setFilterOrigen}>
                    <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {ORIGENES.map((origen) => (
                        <SelectItem key={origen.value} value={origen.value}>
                          {origen.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">País</Label>
                  <Select value={filterPais} onValueChange={setFilterPais}>
                    <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {PAISES.map((pais) => (
                        <SelectItem key={pais.code} value={pais.code}>
                          {pais.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Depósito</Label>
                  <Select value={filterDeposito} onValueChange={setFilterDeposito}>
                    <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Check-in desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-emerald-50 border-emerald-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                        {filterCheckinDesde ? format(filterCheckinDesde, "dd/MM/yyyy") : "Seleccionar..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterCheckinDesde}
                        onSelect={setFilterCheckinDesde}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Check-in hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-emerald-50 border-emerald-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                        {filterCheckinHasta ? format(filterCheckinHasta, "dd/MM/yyyy") : "Seleccionar..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterCheckinHasta}
                        onSelect={setFilterCheckinHasta}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                    <Input
                      placeholder="Nombre o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-emerald-200 focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-blue-100">Total Reservas</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalReservas}</p>
                  <p className="text-xs text-blue-100 mt-1">del mes seleccionado</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-green-100">Ingresos</p>
                  <p className="text-3xl font-bold mt-2">${formatCurrency(stats.totalIngresos)}</p>
                  <p className="text-xs text-green-100 mt-1">{format(filterMes, "MMMM yyyy", { locale: es })}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-purple-100">Ocupación</p>
                  <p className="text-4xl font-bold mt-2">{stats.ocupacionTotal}%</p>
                  <p className="text-xs text-purple-100 mt-1">del mes</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-orange-100">Departamentos</p>
                  <p className="text-4xl font-bold mt-2">{cabins.length}</p>
                  <p className="text-xs text-orange-100 mt-1">totales activos</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Home className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/80 backdrop-blur-sm border border-emerald-200">
            <TabsTrigger
              value="tabla"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Tabla
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Grid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tabla" className="space-y-4">
            <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                        <TableHead className="font-bold text-emerald-900">Departamento</TableHead>
                        <TableHead className="font-bold text-emerald-900">Check-in</TableHead>
                        <TableHead className="font-bold text-emerald-900">Check-out</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Noches</TableHead>
                        <TableHead className="font-bold text-emerald-900">Nombre</TableHead>
                        <TableHead className="font-bold text-emerald-900">País</TableHead>
                        <TableHead className="font-bold text-emerald-900">Teléfono</TableHead>
                        <TableHead className="font-bold text-emerald-900">Origen</TableHead>
                        <TableHead className="font-bold text-emerald-900">Contacto</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Depósito</TableHead>
                        <TableHead className="text-right font-bold text-emerald-900">$ Noche</TableHead>
                        <TableHead className="text-right font-bold text-emerald-900">$ Total</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReservas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                              <CalendarIcon className="h-12 w-12 text-gray-300" />
                              <p className="text-lg font-medium">No se encontraron reservas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedReservas.map((reserva) => {
                          const nights = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
                          const currency = getCurrency(reserva.pais, reserva.origen)
                          const precioNoche =
                            reserva.precioNoche && typeof reserva.precioNoche === "object"
                              ? reserva.precioNoche[currency as keyof PrecioNoche] || 0
                              : 0
                          const hasAlert = needsPaymentAlert(reserva)

                          return (
                            <TableRow
                              key={reserva.id}
                              className={cn(
                                "hover:bg-emerald-50/50 transition-colors duration-150 border-b border-emerald-100",
                                hasAlert && "bg-red-50/50 hover:bg-red-50",
                              )}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {hasAlert && (
                                    <AlertTriangle
                                      className="h-4 w-4 text-red-500 flex-shrink-0"
                                      title="Reserva vencida sin pago"
                                    />
                                  )}
                                  <Badge
                                    variant="outline"
                                    className="font-medium border-emerald-300 text-emerald-700 bg-emerald-50"
                                  >
                                    {reserva.departamento}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-gray-700">
                                {format(reserva.fechaInicio as Date, "dd/MM/yy")}
                              </TableCell>
                              <TableCell className="font-medium text-gray-700">
                                {format(reserva.fechaFin as Date, "dd/MM/yy")}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                                  {nights}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">{reserva.nombre}</TableCell>
                              <TableCell className="text-gray-600">
                                {PAISES.find((p) => p.code === reserva.pais)?.name || reserva.pais}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-gray-700">{reserva.numero}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn("text-white font-medium shadow-sm", getOrigenColor(reserva.origen))}
                                >
                                  {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {reserva.origen === "particular" && reserva.contactoParticular
                                  ? reserva.contactoParticular
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {reserva.hizoDeposito ? (
                                  <Badge
                                    variant="default"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                                  >
                                    Sí
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                    No
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-gray-700">
                                ${precioNoche.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-bold text-emerald-600 text-lg">
                                ${(reserva.precioTotal || 0).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewingReserva(reserva)}
                                    title="Ver detalles"
                                    className="hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(reserva)}
                                    title="Editar"
                                    className="hover:bg-emerald-50 hover:text-emerald-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteReserva(reserva)}
                                    title="Eliminar"
                                    className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="text-sm text-gray-600 font-medium">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, filteredReservas.length)} de {filteredReservas.length}{" "}
                      reservas
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-emerald-300 hover:bg-emerald-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-semibold text-emerald-900 px-3">
                        Página {currentPage} de {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-emerald-300 hover:bg-emerald-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView
              reservas={filteredReservas}
              mes={filterMes}
              cabins={cabins}
              setViewingReserva={setViewingReserva}
            />
          </TabsContent>

          <TabsContent value="grid">
            <GridView
              reservas={filteredReservas}
              mes={filterMes}
              cabins={cabins}
              setViewingReserva={setViewingReserva}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog for creating/editing reservation */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-600">
                {editingReserva
                  ? "Modifica los datos de la reserva existente"
                  : "Completa los datos para crear una nueva reserva"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Departamento y Fechas */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-emerald-100 shadow-sm">
                <h3 className="font-semibold text-base md:text-lg text-emerald-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
                  Fechas y Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento" className="text-emerald-900 font-semibold text-sm">
                      Departamento *
                    </Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) => setFormData({ ...formData, departamento: value })}
                    >
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cabins.map((cabin) => (
                          <SelectItem key={cabin.id} value={cabin.name}>
                            {cabin.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-900 font-semibold text-sm">Fecha de Entrada *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-white text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                          {format(formData.fechaInicio, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaInicio}
                          onSelect={(date) => date && setFormData({ ...formData, fechaInicio: date })}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-900 font-semibold text-sm">Fecha de Salida *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-white text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                          {format(formData.fechaFin, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaFin}
                          onSelect={(date) => date && setFormData({ ...formData, fechaFin: date })}
                          locale={es}
                          disabled={(date) => isBefore(date, formData.fechaInicio)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold text-sm">Noches</Label>
                    <div className="flex items-center h-10 px-4 border-2 border-emerald-300 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                      <span className="text-lg md:text-xl font-bold text-emerald-700">
                        {calculateNights(formData.fechaInicio, formData.fechaFin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-blue-100 shadow-sm">
                <h3 className="font-semibold text-base md:text-lg text-blue-900 mb-4">Datos del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre" className="text-blue-900 font-semibold text-sm">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pais" className="text-blue-900 font-semibold text-sm">
                      País *
                    </Label>
                    <Select value={formData.pais} onValueChange={(value) => setFormData({ ...formData, pais: value })}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAISES.map((pais) => (
                          <SelectItem key={pais.code} value={pais.code}>
                            {pais.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-blue-900 font-semibold text-sm">
                      Teléfono *
                    </Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Origen de la Reserva */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-purple-100 shadow-sm">
                <h3 className="font-semibold text-base md:text-lg text-purple-900 mb-4">Origen de la Reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origen" className="text-purple-900 font-semibold text-sm">
                      Origen *
                    </Label>
                    <Select
                      value={formData.origen}
                      onValueChange={(value: OrigenReserva) => setFormData({ ...formData, origen: value })}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIGENES.map((origen) => (
                          <SelectItem key={origen.value} value={origen.value}>
                            {origen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.origen === "particular" && (
                    <div className="space-y-2">
                      <Label htmlFor="contactoParticular" className="text-purple-900 font-semibold text-sm">
                        Contacto
                      </Label>
                      <Select
                        value={formData.contactoParticular || ""}
                        onValueChange={(value: ContactoParticular) =>
                          setFormData({ ...formData, contactoParticular: value })
                        }
                      >
                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACTOS_PARTICULARES.map((contacto) => (
                            <SelectItem key={contacto} value={contacto}>
                              {contacto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Precios */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-green-100 shadow-sm">
                <h3 className="font-semibold text-base md:text-lg text-green-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                  Precios y Pagos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Currency Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="moneda" className="text-green-900 font-semibold text-sm">
                      Moneda
                    </Label>
                    <Select
                      value={formData.moneda}
                      onValueChange={(value: string) => {
                        const currentPrecioNoche = formData.precioNoche || { pesos: 0 }
                        const existingValue = currentPrecioNoche[value as keyof PrecioNoche] || 0
                        setFormData({
                          ...formData,
                          moneda: value,
                          precioNoche: { ...currentPrecioNoche, [value]: existingValue }, // Keep existing value if available for the new currency, otherwise 0
                        })
                      }}
                    >
                      <SelectTrigger className="border-green-200 focus:border-green-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAISES.map((pais) => (
                          <SelectItem key={pais.code} value={pais.code}>
                            {pais.name} ({pais.currency})
                          </SelectItem>
                        ))}
                        {/* Add any other relevant currencies if needed */}
                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioNoche" className="text-green-900 font-semibold text-sm">
                      Precio por Noche ({formData.moneda})
                    </Label>
                    <Input
                      id="precioNoche"
                      type="number"
                      value={formData.precioNoche[formData.moneda as keyof PrecioNoche] || 0}
                      onChange={(e) => {
                        const currentCurrency = formData.moneda as keyof PrecioNoche
                        const newPrecioNocheValue = Number(e.target.value)
                        setFormData({
                          ...formData,
                          precioNoche: { ...formData.precioNoche, [currentCurrency]: newPrecioNocheValue },
                          // Optionally update precioTotal automatically if it's 0 or based on nights
                          precioTotal:
                            formData.precioTotal === 0
                              ? newPrecioNocheValue * calculateNights(formData.fechaInicio, formData.fechaFin)
                              : formData.precioTotal,
                        })
                      }}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioTotal" className="text-green-900 font-semibold text-sm">
                      Precio Total *
                    </Label>
                    <Input
                      id="precioTotal"
                      type="number"
                      value={formData.precioTotal}
                      onChange={(e) => setFormData({ ...formData, precioTotal: Number(e.target.value) })}
                      placeholder="0"
                      required
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioImpuestos" className="text-green-900 font-semibold text-sm">
                      Impuestos
                    </Label>
                    <Input
                      id="precioImpuestos"
                      type="number"
                      value={formData.precioImpuestos}
                      onChange={(e) => setFormData({ ...formData, precioImpuestos: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioGanancia" className="text-green-900 font-semibold text-sm">
                      Ganancia
                    </Label>
                    <Input
                      id="precioGanancia"
                      type="number"
                      value={formData.precioGanancia}
                      onChange={(e) => setFormData({ ...formData, precioGanancia: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 mt-4 border-t border-green-100">
                  <Checkbox
                    id="hizoDeposito"
                    checked={formData.hizoDeposito}
                    onCheckedChange={(checked) => setFormData({ ...formData, hizoDeposito: checked as boolean })}
                    className="border-green-300"
                  />
                  <Label htmlFor="hizoDeposito" className="font-semibold cursor-pointer text-green-900 text-sm">
                    ¿Hizo depósito?
                  </Label>
                </div>

                {formData.hizoDeposito && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="montoDeposito" className="text-green-900 font-semibold text-sm">
                      Monto del Depósito
                    </Label>
                    <Input
                      id="montoDeposito"
                      type="number"
                      value={formData.montoDeposito || 0}
                      onChange={(e) => setFormData({ ...formData, montoDeposito: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
                <Label htmlFor="notas" className="text-gray-900 font-semibold text-sm md:text-base">
                  Notas
                </Label>
                <Textarea
                  id="notas"
                  value={formData.notas || ""}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Información adicional sobre la reserva..."
                  rows={3}
                  className="mt-2 border-gray-300 focus:border-gray-400"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                >
                  {editingReserva ? "Guardar Cambios" : "Crear Reserva"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for viewing reservation details */}
        {viewingReserva && (
          <Dialog open={!!viewingReserva} onOpenChange={() => setViewingReserva(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ComprobanteProfesional
                reserva={viewingReserva}
                onClose={() => setViewingReserva(null)}
                onEdit={() => {
                  const reservaToEdit = viewingReserva
                  setViewingReserva(null)
                  openEditDialog(reservaToEdit)
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for deleting reservation */}
        <AlertDialog open={!!deleteReserva} onOpenChange={() => setDeleteReserva(null)}>
          <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl md:text-2xl text-red-700">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm md:text-base text-gray-600">
                Esta acción no se puede deshacer. Se eliminará permanentemente la reserva de{" "}
                <span className="font-semibold text-gray-900">{deleteReserva?.nombre}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="border-gray-300 w-full sm:w-auto">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-full sm:w-auto"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
