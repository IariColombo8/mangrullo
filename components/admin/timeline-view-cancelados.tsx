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

  // Obtener nombre corto del día
  const getDayName = (date: Date) => {
    const names = ["d", "l", "m", "m", "j", "v", "s"]
    return names[getDay(date)]
  }

  // Verificar si hay reserva en un día
  const getReservationForDay = (day: Date): Reserva | null => {
    const dayStart = startOfDay(day)
    for (const r of monthReservations) {
      const inicio = startOfDay(parseDate(r.fechaInicio))
      const fin = startOfDay(parseDate(r.fechaFin))
      if (dayStart >= inicio && dayStart < fin) {
        return r
      }
    }
    return null
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

  if (monthReservations.length === 0) {
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
                <th className="border border-red-200 p-1 sticky left-0 bg-red-100/50 z-10 min-w-[100px]">Estado</th>
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
              {/* Fila Canceladas */}
              <tr>
                <td className="border border-red-200 p-1 font-medium sticky left-0 bg-red-50 z-10">
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="truncate">Canceladas</span>
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const cancelada = monthReservations.find(
                    (r) => r.estado === "cancelada" && getReservationForDay(day)?.id === r.id,
                  )
                  if (cancelada) {
                    const isFirst = isFirstPaintedDay(cancelada, day)
                    const isLast = isLastPaintedDay(cancelada, day)
                    return (
                      <td
                        key={day.toISOString()}
                        className={cn(
                          "border border-red-200 p-0 cursor-pointer transition-opacity hover:opacity-80",
                          getOrigenColor(cancelada.origen),
                          "opacity-60",
                          isFirst && "border-l-[3px] border-l-black",
                          isLast && "border-r-[3px] border-r-black",
                        )}
                        onClick={() => setViewingReserva(cancelada)}
                        title={`${cancelada.nombre} - CANCELADA`}
                      >
                        {isFirst && (
                          <div className="text-[9px] text-white font-medium px-0.5 truncate">
                            {cancelada.nombre.split(" ")[0]}
                          </div>
                        )}
                      </td>
                    )
                  }
                  return <td key={day.toISOString()} className="border border-red-200 p-0 bg-white" />
                })}
              </tr>
              {/* Fila No presentados */}
              <tr>
                <td className="border border-red-200 p-1 font-medium sticky left-0 bg-red-50 z-10">
                  <div className="flex items-center gap-1">
                    <UserX className="h-3 w-3 text-amber-500" />
                    <span className="truncate">No presentados</span>
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const noPresentado = monthReservations.find(
                    (r) => r.estado === "no_presentado" && getReservationForDay(day)?.id === r.id,
                  )
                  if (noPresentado) {
                    const isFirst = isFirstPaintedDay(noPresentado, day)
                    const isLast = isLastPaintedDay(noPresentado, day)
                    return (
                      <td
                        key={day.toISOString()}
                        className={cn(
                          "border border-red-200 p-0 cursor-pointer transition-opacity hover:opacity-80",
                          getOrigenColor(noPresentado.origen),
                          "opacity-60",
                          isFirst && "border-l-[3px] border-l-black",
                          isLast && "border-r-[3px] border-r-black",
                        )}
                        onClick={() => setViewingReserva(noPresentado)}
                        title={`${noPresentado.nombre} - NO PRESENTADO`}
                      >
                        {isFirst && (
                          <div className="text-[9px] text-white font-medium px-0.5 truncate">
                            {noPresentado.nombre.split(" ")[0]}
                          </div>
                        )}
                      </td>
                    )
                  }
                  return <td key={day.toISOString()} className="border border-red-200 p-0 bg-white" />
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vista Mobile - Vertical */}
        <div className="md:hidden">
          <div className="p-2 space-y-2">
            {monthReservations.map((reserva) => (
              <div
                key={reserva.id}
                className={cn("p-2 rounded-lg cursor-pointer opacity-70", getOrigenColor(reserva.origen))}
                onClick={() => setViewingReserva(reserva)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reserva.estado === "cancelada" ? (
                      <XCircle className="h-4 w-4 text-white" />
                    ) : (
                      <UserX className="h-4 w-4 text-white" />
                    )}
                    <span className="text-white font-medium text-sm">{reserva.nombre}</span>
                  </div>
                  <span className="text-white/80 text-xs uppercase">
                    {reserva.estado === "cancelada" ? "Cancelada" : "No presentado"}
                  </span>
                </div>
                <div className="text-white/90 text-xs mt-1">
                  {format(parseDate(reserva.fechaInicio), "dd/MM")} - {format(parseDate(reserva.fechaFin), "dd/MM")}
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
