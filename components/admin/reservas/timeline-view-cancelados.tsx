"use client"

import type React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay, getDay } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, UserX } from "lucide-react"
import type { Reserva, OrigenReserva } from "@/types/reserva"
import { ORIGENES } from "@/types/reserva"
import { cn } from "@/lib/utils"

interface TimelineViewCanceladosProps {
  reservas: Reserva[]
  mes: Date
  setViewingReserva: (reserva: Reserva) => void
  isFeriado: (date: Date) => boolean
  getFeriadoLabel: (date: Date) => string | undefined
}

interface ExpandedReserva {
  reserva: Reserva
  departamento: string
  uniqueKey: string
}

const TimelineViewCancelados: React.FC<TimelineViewCanceladosProps> = ({
  reservas,
  mes,
  setViewingReserva,
  isFeriado,
  getFeriadoLabel,
}) => {
  const startOfMonthDate = startOfMonth(mes)
  const endOfMonthDate = endOfMonth(mes)
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

  // Helper para parsear fechas
  const parseDate = (date: any): Date => {
    if (date instanceof Date) return date
    if (date && typeof date === "object" && "toDate" in date) {
      return date.toDate()
    }
    if (typeof date === "string") {
      if (date.includes("/")) {
        const parts = date.split("/")
        if (parts.length === 3) {
          const [day, month, year] = parts
          return new Date(Number(year), Number(month) - 1, Number(day))
        }
      }
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) return parsed
    }
    if (typeof date === "number") {
      return new Date(date)
    }
    return new Date()
  }

  // Filtrar solo canceladas y no presentados
  const reservasCanceladas = reservas.filter((r) => r.estado === "cancelada" || r.estado === "no_presentado")

  // Obtener color del origen
  const getOrigenColor = (origen: OrigenReserva): string => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  // Obtener reservas que afectan este mes
  const getMonthReservations = () => {
    const monthStart = startOfDay(startOfMonthDate)
    const monthEnd = startOfDay(endOfMonthDate)

    return reservasCanceladas.filter((r) => {
      const inicio = startOfDay(parseDate(r.fechaInicio))
      const fin = startOfDay(parseDate(r.fechaFin))
      return inicio <= monthEnd && fin > monthStart
    })
  }

  const monthReservations = getMonthReservations()

  // Expandir reservas múltiples en filas individuales por departamento
  const expandedReservations: ExpandedReserva[] = []
  monthReservations.forEach((reserva) => {
    if (reserva.esReservaMultiple && reserva.departamentos && reserva.departamentos.length > 0) {
      // Si es reserva múltiple, crear una fila por cada departamento
      reserva.departamentos.forEach((depto, index) => {
        expandedReservations.push({
          reserva,
          departamento: depto.departamento, // Cambiado de depto.nombre a depto.departamento
          uniqueKey: `${reserva.id}-${depto.departamento}-${index}`,
        })
      })
    } else {
      // Si no es múltiple, crear una sola fila
      expandedReservations.push({
        reserva,
        departamento: reserva.departamento,
        uniqueKey: reserva.id || `${reserva.nombre}-${reserva.departamento}`,
      })
    }
  })

  // Ordenar por departamento primero, luego por fecha
  expandedReservations.sort((a, b) => {
    const deptCompare = a.departamento.localeCompare(b.departamento)
    if (deptCompare !== 0) return deptCompare
    
    const fechaA = parseDate(a.reserva.fechaInicio).getTime()
    const fechaB = parseDate(b.reserva.fechaInicio).getTime()
    return fechaA - fechaB
  })

  // Obtener nombre corto del día
  const getDayName = (date: Date) => {
    const names = ["D", "L", "M", "M", "J", "V", "S"]
    return names[getDay(date)]
  }

  const getReservationForDay = (day: Date, departamento: string, reservaId: string): boolean => {
    const dayStart = startOfDay(day)
    const reserva = monthReservations.find((r) => r.id === reservaId)
    if (!reserva) return false

    const inicio = startOfDay(parseDate(reserva.fechaInicio))
    const fin = startOfDay(parseDate(reserva.fechaFin))

    const matchesDepartment =
      reserva.esReservaMultiple && reserva.departamentos && reserva.departamentos.length > 0
        ? reserva.departamentos.some((d) => d.departamento === departamento)
        : reserva.departamento === departamento

    return matchesDepartment && dayStart >= inicio && dayStart < fin
  }

  // Es primer día pintado de esta reserva en este mes
  const isFirstPaintedDay = (reserva: Reserva, day: Date): boolean => {
    const inicio = startOfDay(parseDate(reserva.fechaInicio))
    const dayStart = startOfDay(day)
    if (isSameDay(inicio, dayStart)) return true
    if (inicio < startOfMonthDate && isSameDay(dayStart, startOfMonthDate)) return true
    return false
  }

  // Es último día pintado de esta reserva en este mes
  const isLastPaintedDay = (reserva: Reserva, day: Date): boolean => {
    const fin = startOfDay(parseDate(reserva.fechaFin))
    const dayStart = startOfDay(day)
    const lastPaintedDate = new Date(fin)
    lastPaintedDate.setDate(lastPaintedDate.getDate() - 1)
    if (isSameDay(dayStart, lastPaintedDate)) return true
    if (fin > endOfMonthDate && isSameDay(dayStart, endOfMonthDate)) return true
    return false
  }

  if (expandedReservations.length === 0) {
    return null
  }

  return (
    <Card className="border border-red-200 bg-red-50/30 mt-4">
      <CardHeader className="py-2 px-3 border-b border-red-200">
        <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Canceladas / No presentados
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Vista Desktop - Horizontal */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[120px_1fr] gap-0 border-b-2 border-red-300 bg-red-100/50 sticky top-0 z-20">
              <div className="p-2 font-bold text-red-900 text-xs flex items-center border-r-2 border-red-300">
                Departamento / Reserva
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(28px, 1fr))` }}>
                {daysInMonth.map((day) => {
                  const isToday = isSameDay(day, new Date())
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const holiday = isFeriado(day)

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border-l border-red-200 p-1 text-center",
                        isToday && "bg-red-300 ring-1 ring-red-500",
                        !isToday && holiday && "bg-violet-100 ring-1 ring-violet-300",
                        !isToday && !holiday && isWeekend && "bg-red-100",
                        !isToday && !isWeekend && "bg-red-50",
                      )}
                      title={holiday ? getFeriadoLabel(day) : undefined}
                    >
                      {holiday && <div className="w-2 h-2 bg-violet-500 rounded-sm mx-auto mb-0.5" />}
                      <div className={cn("font-bold text-[10px]", isToday && "text-red-900")}>
                        {format(day, "d")}
                      </div>
                      <div className={cn("text-[8px]", isToday ? "text-red-900 font-bold" : "text-gray-600")}>
                        {getDayName(day)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {expandedReservations.map((expanded) => (
              <div
                key={expanded.uniqueKey}
                className="grid grid-cols-[120px_1fr] gap-0 border-b border-red-300 hover:bg-red-50/30 transition-colors"
              >
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-2 font-semibold text-xs flex items-center border-r-2 border-red-300">
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex items-center gap-1">
                      {expanded.reserva.estado === "cancelada" ? (
                        <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      ) : (
                        <UserX className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="truncate text-[11px] font-semibold">{expanded.departamento}</span>
                    </div>
                    <span className="truncate text-[10px] text-gray-600 ml-4">
                      {expanded.reserva.nombre}
                    </span>
                  </div>
                </div>

                <div
                  className="grid relative min-h-[45px]"
                  style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(28px, 1fr))` }}
                >
                  {daysInMonth.map((day, dayIndex) => {
                    const isToday = isSameDay(day, new Date())
                    const matchesThisReservation = getReservationForDay(day, expanded.departamento, expanded.reserva.id || "")
                    
                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "border-l border-red-200 min-h-[45px]",
                          isToday && "border-l-2 border-red-500",
                          matchesThisReservation && "bg-opacity-60",
                          matchesThisReservation && getOrigenColor(expanded.reserva.origen),
                          !matchesThisReservation && "bg-white",
                        )}
                      />
                    )
                  })}

                  {(() => {
                    const reserva = expanded.reserva
                    const reservaStartDate = startOfDay(parseDate(reserva.fechaInicio))
                    const reservaEndDate = startOfDay(parseDate(reserva.fechaFin))

                    const effectiveStart = reservaStartDate < startOfMonthDate ? startOfMonthDate : reservaStartDate
                    const lastPaintedDay = new Date(reservaEndDate)
                    lastPaintedDay.setDate(lastPaintedDay.getDate() - 1)
                    const effectiveEnd = lastPaintedDay > endOfMonthDate ? endOfMonthDate : lastPaintedDay

                    const startDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveStart))
                    const endDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveEnd))

                    if (startDayIndex === -1 || endDayIndex === -1 || endDayIndex < startDayIndex) return null

                    const visibleStartDay = startDayIndex
                    const visibleEndDay = endDayIndex
                    const visibleDays = visibleEndDay - visibleStartDay + 1

                    const origenColorClass = getOrigenColor(reserva.origen)
                    const isRealStart = isSameDay(effectiveStart, reservaStartDate)
                    const isRealEnd = isSameDay(effectiveEnd, lastPaintedDay)

                    return (
                      <div
                        className={cn(
                          "absolute h-[38px] top-[3px] cursor-pointer transition-all hover:z-30 hover:shadow-xl flex items-center px-1 text-[9px] font-medium text-white overflow-hidden opacity-60",
                          origenColorClass,
                          "border-y-2 border-red-600",
                          isRealStart && "border-l-[4px] border-l-red-800 rounded-l",
                          isRealEnd && "border-r-[4px] border-r-red-800 rounded-r",
                          !isRealStart && "border-l-2 border-l-red-600/30",
                          !isRealEnd && "border-r-2 border-r-red-600/30",
                        )}
                        style={{
                          left: `${(visibleStartDay / daysInMonth.length) * 100}%`,
                          width: `${(visibleDays / daysInMonth.length) * 100}%`,
                          zIndex: 10,
                        }}
                        onClick={() => setViewingReserva(reserva)}
                        title={`${reserva.nombre} - ${expanded.departamento} - ${reserva.estado === "cancelada" ? "CANCELADA" : "NO PRESENTADO"}`}
                      >
                        {!isRealStart && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400/80" />}
                        
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate flex-1">{reserva.nombre.split(" ")[0]}</span>
                        </div>

                        {!isRealEnd && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-yellow-400/80" />}
                      </div>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista Mobile - Vertical */}
        <div className="md:hidden">
          <div className="p-2 space-y-2">
            {expandedReservations.map((expanded) => (
              <div
                key={expanded.uniqueKey}
                className={cn("p-3 rounded-lg cursor-pointer opacity-70 border-2 border-red-300", getOrigenColor(expanded.reserva.origen))}
                onClick={() => setViewingReserva(expanded.reserva)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {expanded.reserva.estado === "cancelada" ? (
                      <XCircle className="h-4 w-4 text-white flex-shrink-0" />
                    ) : (
                      <UserX className="h-4 w-4 text-white flex-shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{expanded.departamento}</span>
                      <span className="text-white/90 text-xs">{expanded.reserva.nombre}</span>
                    </div>
                  </div>
                  <span className="text-white/80 text-[10px] uppercase font-semibold">
                    {expanded.reserva.estado === "cancelada" ? "Cancelada" : "No presentado"}
                  </span>
                </div>
                <div className="text-white/90 text-xs font-medium">
                  {format(parseDate(expanded.reserva.fechaInicio), "dd/MM/yyyy")} -{" "}
                  {format(parseDate(expanded.reserva.fechaFin), "dd/MM/yyyy")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimelineViewCancelados