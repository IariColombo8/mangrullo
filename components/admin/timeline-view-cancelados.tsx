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
}

interface ExpandedReserva {
  reserva: Reserva
  departamento: string
  uniqueKey: string
}

const TimelineViewCancelados: React.FC<TimelineViewCanceladosProps> = ({ reservas, mes, setViewingReserva }) => {
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
    const names = ["d", "l", "m", "m", "j", "v", "s"]
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
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-red-100/50">
                <th className="border border-red-200 p-1 sticky left-0 bg-red-100/50 z-10 min-w-[120px]">
                  Departamento / Reserva
                </th>
                {daysInMonth.map((day) => (
                  <th key={day.toISOString()} className="border border-red-200 p-1 min-w-[28px] text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{format(day, "d")}</span>
                      <span className="text-[10px] text-gray-500">{getDayName(day)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expandedReservations.map((expanded) => (
                <tr key={expanded.uniqueKey}>
                  <td className="border border-red-200 p-1 font-medium sticky left-0 bg-red-50 z-10">
                    <div className="flex flex-col gap-0.5">
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
                  </td>
                  {daysInMonth.map((day) => {
                    const matchesThisReservation = getReservationForDay(day, expanded.departamento, expanded.reserva.id || "")
                    if (matchesThisReservation) {
                      const isFirst = isFirstPaintedDay(expanded.reserva, day)
                      const isLast = isLastPaintedDay(expanded.reserva, day)
                      return (
                        <td
                          key={day.toISOString()}
                          className={cn(
                            "border border-red-200 p-0 cursor-pointer transition-opacity hover:opacity-80",
                            getOrigenColor(expanded.reserva.origen),
                            "opacity-60",
                            isFirst && "border-l-[3px] border-l-black",
                            isLast && "border-r-[3px] border-r-black",
                          )}
                          onClick={() => setViewingReserva(expanded.reserva)}
                          title={`${expanded.reserva.nombre} - ${expanded.departamento} - ${expanded.reserva.estado === "cancelada" ? "CANCELADA" : "NO PRESENTADO"}`}
                        >
                          {isFirst && (
                            <div className="text-[9px] text-white font-medium px-0.5 truncate">
                              {expanded.reserva.nombre.split(" ")[0]}
                            </div>
                          )}
                        </td>
                      )
                    }
                    return <td key={day.toISOString()} className="border border-red-200 p-0 bg-white" />
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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