"use client"

import type React from "react"
import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  isBefore,
  addDays,
  parse,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Home, AlertTriangle } from "lucide-react"
import type { Reserva, OrigenReserva } from "@/types/reserva"
import { ORIGENES } from "@/types/reserva"
import { cn } from "@/lib/utils"

interface TimelineViewProps {
  reservas: Reserva[]
  mes: Date
  cabins: { id: string; name: string }[]
  setViewingReserva: (reserva: Reserva) => void
  isFeriado: (date: Date) => boolean
  getFeriadoLabel: (date: Date) => string | undefined
  monthFeriados: { date: string; name: string; isCustom: boolean }[]
  addCustomHoliday: (date: string, name: string) => void
  removeCustomHoliday: (date: string) => void
  error?: string | null
}

const parseDate = (date: Date | string | number): Date => {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date
  }
  if (typeof date === "number") {
    return new Date(date)
  }
  if (typeof date === "string") {
    let parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
    try {
      parsed = parse(date, "dd/MM/yyyy", new Date())
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch (e) {}
    try {
      parsed = parse(date, "yyyy-MM-dd", new Date())
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch (e) {}
  }
  return new Date()
}

const TimelineView: React.FC<TimelineViewProps> = ({
  reservas,
  mes,
  cabins,
  setViewingReserva,
  isFeriado,
  getFeriadoLabel,
  monthFeriados,
  addCustomHoliday,
  removeCustomHoliday,
  error,
}) => {
  const [feriadoDate, setFeriadoDate] = useState<Date | undefined>(undefined)
  const [feriadoNombre, setFeriadoNombre] = useState("")
  const [isFeriadosOpen, setIsFeriadosOpen] = useState(false)
  const startOfMonthDate = startOfMonth(mes)
  const endOfMonthDate = endOfMonth(mes)
  const daysInMonth = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

  const monthReservations = reservas.filter((r) => r.estado !== "cancelada" && r.estado !== "no_presentado")

  const needsPaymentAlert = (reserva: Reserva): boolean => {
    const today = startOfDay(new Date())
    const fechaSalida = startOfDay(parseDate(reserva.fechaFin))
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
        // Manejar nombre como string o como objeto
        const deptName = typeof r.departamento === 'string' ? r.departamento : (r.departamento?.es || r.departamento?.en || '')
        const matchesDept =
          deptName === departamento ||
          (r.departamentos && r.departamentos.some((d) => {
            const dName = typeof d.departamento === 'string' ? d.departamento : (d.departamento?.es || d.departamento?.en || '')
            return dName === departamento
          }))
        if (!matchesDept) return false

        const inicio = startOfDay(parseDate(r.fechaInicio))
        const fin = startOfDay(parseDate(r.fechaFin))
        return dayStart >= inicio && dayStart < fin
      }) || null
    )
  }

  const isFirstPaintedDay = (day: Date, reserva: Reserva) => {
    const dayStart = startOfDay(day)
    const reservaInicio = startOfDay(parseDate(reserva.fechaInicio))
    return isSameDay(dayStart, reservaInicio)
  }

  const isLastPaintedDay = (day: Date, reserva: Reserva) => {
    const dayStart = startOfDay(day)
    const reservaFin = startOfDay(parseDate(reserva.fechaFin))
    const lastPaintedDay = addDays(reservaFin, -1)
    return isSameDay(dayStart, lastPaintedDay)
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
                {daysInMonth.map((day, index) => {
                  const isToday = isSameDay(day, new Date())
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const holiday = isFeriado(day)
                  const prevIsHoliday = index > 0 ? isFeriado(daysInMonth[index - 1]) : false
                  const nextIsHoliday = index < daysInMonth.length - 1 ? isFeriado(daysInMonth[index + 1]) : false

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border-l border-emerald-200 p-1 text-center relative",
                        isToday && "bg-emerald-400 ring-2 ring-emerald-700",
                        !isToday && holiday && "bg-violet-100 ring-1 ring-violet-300",
                        !isToday && !holiday && isWeekend && "bg-emerald-100",
                        !isToday && !isWeekend && "bg-emerald-50",
                      )}
                      title={holiday ? getFeriadoLabel(day) : undefined}
                    >
                      {isToday && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-700" />
                          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-700" />
                        </>
                      )}
                      {holiday && (
                        <>
                          {!prevIsHoliday && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-600" />}
                          {!nextIsHoliday && <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-violet-600" />}
                        </>
                      )}
                      {holiday && <div className="w-2 h-2 bg-violet-600 rounded-sm mx-auto mb-0.5" />}
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

            <div className="relative">
              {cabins.map((cabin) => (
                <div
                  key={cabin.id}
                  className="grid grid-cols-[120px_1fr] gap-0 border-b border-gray-300 hover:bg-gray-50/50 transition-colors relative z-10"
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
                      const holiday = isFeriado(day)
                      const prevIsHoliday = dayIndex > 0 ? isFeriado(daysInMonth[dayIndex - 1]) : false
                      const nextIsHoliday =
                        dayIndex < daysInMonth.length - 1 ? isFeriado(daysInMonth[dayIndex + 1]) : false

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "border-l border-gray-200 min-h-[45px]",
                            isToday && "border-l-2 border-r-2 border-emerald-600",
                            holiday && "bg-violet-100/40",
                            holiday && !prevIsHoliday && "border-l-2 border-violet-600",
                            holiday && !nextIsHoliday && "border-r-2 border-violet-600",
                            hasAlert && "bg-red-100",
                            !hasAlert && reserva && getOrigenColor(reserva.origen).replace("bg-", "bg-opacity-20 bg-"),
                            !reserva && "bg-white",
                          )}
                        />
                      )
                    })}

                    {monthReservations
                      .filter((r) => {
                        return (
                          r.departamento === cabin.name ||
                          (r.departamentos && r.departamentos.some((d) => d.departamento === cabin.name))
                        )
                      })
                      .map((reserva, idx) => {
                        const reservaStartDate = startOfDay(parseDate(reserva.fechaInicio))
                        const reservaEndDate = startOfDay(parseDate(reserva.fechaFin))

                        const effectiveStart = reservaStartDate < startOfMonthDate ? startOfMonthDate : reservaStartDate
                        const lastPaintedDay = addDays(reservaEndDate, -1)
                        const effectiveEnd = lastPaintedDay > endOfMonthDate ? endOfMonthDate : lastPaintedDay

                        const startDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveStart))
                        const endDayIndex = daysInMonth.findIndex((day) => isSameDay(day, effectiveEnd))

                        if (startDayIndex === -1 || endDayIndex === -1 || endDayIndex < startDayIndex) return null

                        const visibleStartDay = startDayIndex
                        const visibleEndDay = endDayIndex
                        const visibleDays = visibleEndDay - visibleStartDay + 1

                        const totalNights = calculateNights(reservaStartDate, reservaEndDate)

                        const hasAlert = needsPaymentAlert(reserva)
                        const origenColorClass = getOrigenColor(reserva.origen)

                        const isRealStart = isSameDay(effectiveStart, reservaStartDate)
                        const isRealEnd = isSameDay(effectiveEnd, lastPaintedDay)

                        return (
                          <div
                            key={`${reserva.id}-${idx}`}
                            className={cn(
                              "absolute h-[38px] top-[3px] cursor-pointer transition-all hover:z-30 hover:shadow-xl flex items-center px-1 text-[9px] font-medium text-white overflow-hidden",
                              origenColorClass,
                              hasAlert && "border-2 border-red-600 ring-2 ring-red-300",
                              !hasAlert && "border-y-2 border-black/70",
                              !hasAlert && isRealStart && "border-l-[4px] border-l-black rounded-l",
                              !hasAlert && isRealEnd && "border-r-[4px] border-r-black rounded-r",
                              !hasAlert && !isRealStart && "border-l-2 border-l-black/30",
                              !hasAlert && !isRealEnd && "border-r-2 border-r-black/30",
                            )}
                            style={{
                              left: `${(visibleStartDay / daysInMonth.length) * 100}%`,
                              width: `${(visibleDays / daysInMonth.length) * 100}%`,
                              zIndex: 10 + idx,
                            }}
                            onClick={() => setViewingReserva(reserva)}
                            title={`${reserva.nombre} - ${reserva.origen} - ${totalNights} noches${!isRealStart ? " (continúa desde mes anterior)" : ""}${!isRealEnd ? " (continúa en mes siguiente)" : ""}`}
                          >
                            {!isRealStart && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400/80" />}

                            <div className="flex items-center justify-between w-full">
                              <span className="truncate flex-1">{reserva.nombre.split(" ")[0]}</span>
                              {hasAlert && <AlertTriangle className="h-3 w-3 ml-1 flex-shrink-0" />}
                            </div>

                            {!isRealEnd && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-yellow-400/80" />}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden overflow-x-auto">
          <div className="min-w-full">
            <div
              className="grid gap-0 border-b-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 sticky top-0 z-30"
              style={{ gridTemplateColumns: `50px repeat(${cabins.length}, 1fr)` }}
            >
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

            {daysInMonth.map((day, index) => {
                  const isToday = isSameDay(day, new Date())
              const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const holiday = isFeriado(day)
                  const prevIsHoliday = index > 0 ? isFeriado(daysInMonth[index - 1]) : false
                  const nextIsHoliday = index < daysInMonth.length - 1 ? isFeriado(daysInMonth[index + 1]) : false

              return (
                <div
                  key={day.toISOString()}
                  className="grid gap-0 border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                  style={{ gridTemplateColumns: `50px repeat(${cabins.length}, 1fr)` }}
                >
                  <div
                    className={cn(
                      "p-1 font-semibold text-[9px] flex flex-col items-center justify-center border-r-2 border-gray-300 relative",
                      isToday && "bg-emerald-600 text-white ring-2 ring-emerald-700",
                      !isToday && isFeriado(day) && "bg-violet-100 text-violet-900",
                      !isToday && !isFeriado(day) && isWeekend && "bg-emerald-100 text-emerald-900",
                      !isToday && !isWeekend && "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700",
                    )}
                    title={isFeriado(day) ? getFeriadoLabel(day) : undefined}
                  >
                    {isToday && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-800" />
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-800" />
                      </>
                    )}
                        {holiday && (
                          <>
                            {!prevIsHoliday && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-700" />}
                            {!nextIsHoliday && <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-violet-700" />}
                          </>
                        )}
                    {isFeriado(day) && <div className="w-2 h-2 bg-violet-600 rounded-sm mb-0.5" />}
                    <div className="font-bold text-[11px]">{format(day, "d")}</div>
                    <div className="text-[7px] leading-tight">{format(day, "EEE", { locale: es })}</div>
                  </div>

                  {cabins.map((cabin) => {
                    const reserva = getReservationForDayAndDept(day, cabin.name)
                    const hasAlert = reserva ? needsPaymentAlert(reserva) : false

                    const isFirstDay = reserva ? isFirstPaintedDay(day, reserva) : false
                    const isLastDay = reserva ? isLastPaintedDay(day, reserva) : false

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
                              "h-full p-1 cursor-pointer transition-all active:scale-95 flex flex-col justify-center",
                              getOrigenColor(reserva.origen),
                              hasAlert && "ring-1 ring-red-500 border border-red-600",
                              !hasAlert && "border-x-2 border-black/70",
                              !hasAlert && isFirstDay && "border-t-[4px] border-t-black rounded-t",
                              !hasAlert && isLastDay && "border-b-[4px] border-b-black rounded-b",
                              !hasAlert && !isFirstDay && "border-t border-t-black/30",
                              !hasAlert && !isLastDay && "border-b border-b-black/30",
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
                          <div className="h-full flex items-center justify-center text-[8px] text-gray-300">-</div>
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
          <div className="flex flex-wrap items-start justify-between gap-6 text-xs">
            <div className="flex flex-wrap gap-3 justify-center flex-1">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded border border-gray-300 bg-emerald-300"></div>
                <span>Hoy</span>
              </div>
              {ORIGENES.map((origen) => (
                <div key={origen.value} className="flex items-center gap-1">
                  <div className={cn("w-5 h-5 rounded border border-gray-300", origen.color)}></div>
                  <span>{origen.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Sin pago vencido</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-yellow-400/80 border border-gray-300"></div>
                <span>Continúa de/hacia otro mes</span>
              </div>
            </div>
            <Dialog open={isFeriadosOpen} onOpenChange={setIsFeriadosOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-violet-700 hover:text-violet-800 ml-auto">
                  <div className="w-5 h-5 rounded border border-violet-300 bg-violet-600"></div>
                  <span>Feriados</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Feriados del mes</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {monthFeriados.length === 0 && (
                      <div className="text-sm text-gray-500">No hay feriados este mes</div>
                    )}
                    {monthFeriados.map((feriado) => (
                      <div key={`${feriado.date}-${feriado.name}`} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-violet-600 rounded-sm flex-shrink-0" />
                        <span className="text-gray-800">
                          {format(parseISO(feriado.date), "dd/MM")} - {feriado.name}
                        </span>
                        {feriado.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => removeCustomHoliday(feriado.date)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Nombre</Label>
                      <Input
                        placeholder="Ej: Feriado local"
                        value={feriadoNombre}
                        onChange={(e) => setFeriadoNombre(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 w-full justify-start text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {feriadoDate ? format(feriadoDate, "dd/MM/yyyy") : "Elegir fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={feriadoDate}
                            onSelect={(date) => setFeriadoDate(date || undefined)}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                      onClick={() => {
                        if (!feriadoDate) return
                        addCustomHoliday(format(feriadoDate, "yyyy-MM-dd"), feriadoNombre)
                        setFeriadoNombre("")
                        setFeriadoDate(undefined)
                      }}
                    >
                      Agregar feriado
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimelineView
