"use client"
import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, ChevronLeft, ChevronRight, Search, Home, RefreshCw, AlertCircle } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { DEPARTAMENTOS, ORIGENES } from "@/types/reserva"
import type { Reserva } from "@/types/reserva"
import { cn } from "@/lib/utils"

interface ReservaWithId extends Reserva {
  id: string
}

function CalendarUnifiedView() {
  const [reservas, setReservas] = useState<ReservaWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    loadReservas()
  }, [])

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
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate() : new Date(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate() : new Date(data.fechaFin),
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(),
        } as ReservaWithId
      })

      setReservas(reservasData)
    } catch (error) {
      console.error("Error cargando reservas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const getReservasForDay = (day: Date, departamento?: string) => {
    return reservas.filter((reserva) => {
      const matchesDepartment = !departamento || reserva.departamento === departamento
      const matchesSearch = !searchQuery || reserva.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      const isInRange = isWithinInterval(day, {
        start: reserva.fechaInicio as Date,
        end: reserva.fechaFin as Date,
      })
      return matchesDepartment && matchesSearch && isInRange
    })
  }

  const getOrigenColor = (origen: string) => {
    const origenObj = ORIGENES.find((o) => o.value === origen)
    return origenObj?.color || "bg-gray-500"
  }

  const getOrigenLabel = (origen: string) => {
    const origenObj = ORIGENES.find((o) => o.value === origen)
    return origenObj?.label || origen
  }

  const isCheckInDay = (reserva: ReservaWithId, day: Date) => {
    return isSameDay(reserva.fechaInicio as Date, day)
  }

  const isCheckOutDay = (reserva: ReservaWithId, day: Date) => {
    return isSameDay(reserva.fechaFin as Date, day)
  }

  const days = getDaysInMonth()

  const renderTimelineForDepartment = (departamento?: string) => {
    const departamentos = departamento ? [departamento] : DEPARTAMENTOS

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header con fechas */}
          <div className="flex mb-2 sticky top-0 bg-white z-10">
            <div className="w-48 flex-shrink-0 font-semibold p-2 bg-slate-50 rounded-tl-lg">Departamento</div>
            <div className="flex-1 flex">
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date())
                return (
                  <div
                    key={idx}
                    className={cn("flex-1 text-center text-xs p-1 border-l", isToday && "bg-blue-100 font-bold")}
                  >
                    <div className={cn("font-semibold", isToday && "text-blue-700")}>{day.getDate()}</div>
                    <div className={cn("text-gray-500", isToday && "text-blue-600")}>
                      {format(day, "EEE", { locale: es })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline rows */}
          {departamentos.map((dept) => {
            const deptReservas = getReservasForDay(currentDate, dept)
            return (
              <div
                key={dept}
                className="flex mb-3 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-48 flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 p-3 flex items-center font-medium text-sm border-r">
                  <Home className="h-4 w-4 mr-2 text-emerald-600" />
                  <span className="text-gray-800">{dept}</span>
                </div>
                <div className="flex-1 flex relative bg-white">
                  {days.map((day, idx) => {
                    const reservasInDay = getReservasForDay(day, dept)
                    const isToday = isSameDay(day, new Date())

                    return (
                      <div
                        key={idx}
                        className={cn("flex-1 border-l relative min-h-[80px]", isToday && "bg-blue-50/50")}
                      >
                        {reservasInDay.map((reserva) => {
                          const isStart = isCheckInDay(reserva, day)
                          const isEnd = isCheckOutDay(reserva, day)

                          // Calcular el ancho de la barra
                          const duration = Math.ceil(
                            ((reserva.fechaFin as Date).getTime() - (reserva.fechaInicio as Date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )

                          // Calcular cuántos días quedan desde este día
                          const remainingDays = Math.ceil(
                            ((reserva.fechaFin as Date).getTime() - day.getTime()) / (1000 * 60 * 60 * 24),
                          )

                          const daysFromStart = Math.ceil(
                            (day.getTime() - (reserva.fechaInicio as Date).getTime()) / (1000 * 60 * 60 * 24),
                          )

                          // Solo renderizar el bloque en el día de inicio
                          if (isStart) {
                            const hasAlert = !reserva.hizoDeposito && (reserva.fechaFin as Date) < new Date()

                            return (
                              <div
                                key={reserva.id}
                                className={cn(
                                  "absolute top-1 left-0 rounded px-2 py-2 text-white text-xs flex items-center justify-between cursor-pointer hover:opacity-90 transition-all hover:z-20 shadow-md",
                                  getOrigenColor(reserva.origen),
                                  hasAlert && "ring-2 ring-red-500 ring-offset-1",
                                )}
                                style={{
                                  width: `calc(${duration * 100}% - 4px)`,
                                  zIndex: 10,
                                }}
                                title={`${reserva.nombre} - ${getOrigenLabel(reserva.origen)}\nCheck-in: ${format(
                                  reserva.fechaInicio as Date,
                                  "dd/MM",
                                )}\nCheck-out: ${format(reserva.fechaFin as Date, "dd/MM")}`}
                              >
                                <span className="truncate font-semibold flex items-center gap-1">
                                  {hasAlert && <AlertCircle className="h-3 w-3 flex-shrink-0 text-red-200" />}
                                  {reserva.nombre}
                                </span>
                                <span className="text-[10px] opacity-80 ml-1 flex-shrink-0">{duration}n</span>
                              </div>
                            )
                          }

                          return null
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {departamentos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay departamentos disponibles</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
          <span className="text-muted-foreground">Cargando calendario...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Calendario Unificado
              </CardTitle>
              <p className="text-emerald-50 text-sm mt-1">Vista completa de todas las reservas por departamento</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4"
              >
                Hoy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadReservas}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="text-2xl font-bold text-center text-gray-800">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre de huésped..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para cada departamento */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="todos" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Todos
              </TabsTrigger>
              {DEPARTAMENTOS.map((dept) => (
                <TabsTrigger key={dept} value={dept}>
                  {dept.split(" ")[1]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="todos" className="mt-0">
              {renderTimelineForDepartment()}
            </TabsContent>

            {DEPARTAMENTOS.map((dept) => (
              <TabsContent key={dept} value={dept} className="mt-0">
                {renderTimelineForDepartment(dept)}
              </TabsContent>
            ))}
          </Tabs>

          {/* Leyenda */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-3">Origen de reservas:</p>
            <div className="flex flex-wrap gap-3">
              {ORIGENES.map((origen) => (
                <div key={origen.value} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded", origen.color)}></div>
                  <span className="text-sm text-gray-600">{origen.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 ml-4">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Alerta: Sin depósito + fecha vencida</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarUnifiedView
