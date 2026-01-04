"use client"

import type React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Home, AlertTriangle } from "lucide-react"
import type { Reserva, OrigenReserva } from "@/types/reserva"
import { ORIGENES } from "@/types/reserva"
import { cn } from "@/lib/utils"

interface TimelineViewProps {
  reservas: Reserva[]
  mes: Date
  cabins: { id: string; name: string }[]
  setViewingReserva: (reserva: Reserva) => void
}

const TimelineView: React.FC<TimelineViewProps> = ({ reservas, mes, cabins, setViewingReserva }) => {
  const startOfMonthDate = startOfMonth(mes)
  const endOfMonthDate = endOfMonth(mes)
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

  const getMonthReservations = () => {
    return reservas.filter((r) => {
      const inicio = r.fechaInicio as Date
      const fin = r.fechaFin as Date
      return (
        (inicio >= startOfMonthDate && inicio < endOfMonthDate) ||
        (fin > startOfMonthDate && fin <= endOfMonthDate) ||
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
        {/* Vista Desktop - Horizontal */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[900px]">
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

                      const effectiveStart = reservaStartDate < startOfMonthDate ? startOfMonthDate : reservaStartDate
                      const effectiveEnd = reservaEndDate > endOfMonthDate ? endOfMonthDate : reservaEndDate

                      const startDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveStart))
                      const endDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveEnd))

                      if (startDayIndex === -1 && endDayIndex === -1) return null

                      const visibleStartDay = startDayIndex >= 0 ? startDayIndex : 0
                      const visibleEndDay = endDayIndex >= 0 ? endDayIndex : daysInMonth.length - 1
                      const visibleDays = visibleEndDay - visibleStartDay + 1

                      const totalNights = calculateNights(reservaStartDate, reservaEndDate)

                      const hasAlert = needsPaymentAlert(reserva)
                      const origenColorClass = getOrigenColor(reserva.origen)

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
                          {continuesFromPrevMonth && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />}

                          <div className="flex items-center justify-between w-full">
                            <span className="truncate flex-1">{reserva.nombre.split(" ")[0]}</span>
                            {hasAlert && <AlertTriangle className="h-3 w-3 ml-1 flex-shrink-0" />}
                          </div>

                          {continuesToNextMonth && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista Mobile - Horizontal invertida (días en vertical, departamentos en horizontal) */}
        <div className="md:hidden overflow-x-auto">
          <div className="min-w-full">
            {/* Encabezado con departamentos */}
            <div className="grid gap-0 border-b-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 sticky top-0 z-20"
                 style={{ gridTemplateColumns: `50px repeat(${cabins.length}, 1fr)` }}>
              <div className="p-1 font-bold text-emerald-900 text-[9px] flex items-center justify-center border-r-2 border-emerald-300">
                Día
              </div>
              {cabins.map((cabin) => (
                <div key={cabin.id} className="p-1 border-l border-emerald-200 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Home className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-emerald-900 text-[9px] truncate">{cabin.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de días */}
            {daysInMonth.map((day) => {
              const isToday = isSameDay(day, new Date())
              const isWeekend = day.getDay() === 0 || day.getDay() === 6

              return (
                <div
                  key={day.toISOString()}
                  className="grid gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                  style={{ gridTemplateColumns: `50px repeat(${cabins.length}, 1fr)` }}
                >
                  {/* Columna del día */}
                  <div
                    className={cn(
                      "p-1 font-semibold text-[9px] flex flex-col items-center justify-center border-r-2 border-gray-300",
                      isToday && "bg-emerald-500 text-white",
                      !isToday && isWeekend && "bg-emerald-100 text-emerald-900",
                      !isToday && !isWeekend && "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700",
                    )}
                  >
                    <div className="font-bold text-[11px]">{format(day, "d")}</div>
                    <div className="text-[7px] leading-tight">{format(day, "EEE", { locale: es })}</div>
                  </div>

                  {/* Columnas de departamentos */}
                  {cabins.map((cabin) => {
                    const reserva = getReservationForDayAndDept(day, cabin.name)
                    const hasAlert = reserva ? needsPaymentAlert(reserva) : false

                    return (
                      <div
                        key={cabin.id}
                        className={cn(
                          "border-l border-gray-200 min-h-[42px] p-0.5",
                          isToday && "border-l-2 border-emerald-500",
                        )}
                      >
                        {reserva ? (
                          <div
                            onClick={() => setViewingReserva(reserva)}
                            className={cn(
                              "h-full rounded p-1 cursor-pointer transition-all active:scale-95 flex flex-col justify-center",
                              getOrigenColor(reserva.origen),
                              hasAlert && "ring-1 ring-red-500 border border-red-600",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white text-[8px] truncate flex-1">
                                {reserva.nombre.split(" ")[0]}
                              </span>
                              {hasAlert && <AlertTriangle className="h-2.5 w-2.5 text-white ml-0.5 flex-shrink-0" />}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[8px] text-gray-300">
                            -
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 hidden md:block">
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

export default TimelineView