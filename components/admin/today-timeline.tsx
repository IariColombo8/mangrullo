"use client"
import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, Clock, User, Phone, MapPin, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { format, isToday, startOfDay, endOfDay } from "date-fns"
import { es } from "date-fns/locale"
import type { Reserva } from "@/types/reserva"

interface TimelineReserva extends Reserva {
  id: string
  tipo: "checkin" | "checkout"
}

export default function TodayTimeline() {
  const [checkIns, setCheckIns] = useState<TimelineReserva[]>([])
  const [checkOuts, setCheckOuts] = useState<TimelineReserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodayReservations()
  }, [])

  const loadTodayReservations = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const todayStart = startOfDay(today)
      const todayEnd = endOfDay(today)

      const reservasRef = collection(db, "reservas")
      const snapshot = await getDocs(reservasRef)

      const allReservas = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate() : new Date(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate() : new Date(data.fechaFin),
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(),
        } as Reserva & { id: string }
      })

      // Filtrar check-ins de hoy
      const todayCheckIns = allReservas
        .filter((r) => {
          const checkInDate = r.fechaInicio as Date
          return isToday(checkInDate)
        })
        .map((r) => ({ ...r, tipo: "checkin" as const }))

      // Filtrar check-outs de hoy
      const todayCheckOuts = allReservas
        .filter((r) => {
          const checkOutDate = r.fechaFin as Date
          return isToday(checkOutDate)
        })
        .map((r) => ({ ...r, tipo: "checkout" as const }))

      setCheckIns(todayCheckIns)
      setCheckOuts(todayCheckOuts)
    } catch (error) {
      console.error("Error cargando reservas del día:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOrigenColor = (origen: string) => {
    const colors = {
      booking: "bg-blue-500",
      airbnb: "bg-pink-500",
      upcn: "bg-green-500",
      particular: "bg-orange-500",
    }
    return colors[origen as keyof typeof colors] || "bg-black-500"
  }

  const getOrigenLabel = (origen: string) => {
    const labels = {
      booking: "Booking",
      airbnb: "Airbnb",
      upcn: "UPCN",
      particular: "Particular",
    }
    return labels[origen as keyof typeof labels] || origen
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-none">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-muted-foreground">Cargando...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-none overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Timeline de Hoy
            </CardTitle>
            <CardDescription className="text-blue-50 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadTodayReservations}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Check-ins */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700">
                <LogIn className="h-5 w-5" />
                Check-ins
              </h3>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-bold">
                {checkIns.length}
              </Badge>
            </div>

            {checkIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm font-medium">No hay check-ins hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkIns.map((reserva) => (
                  <Card
                    key={reserva.id}
                    className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{reserva.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{reserva.departamento}</span>
                          </div>
                          {reserva.numero && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{reserva.numero}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={`${getOrigenColor(reserva.origen)} text-white`}>
                          {getOrigenLabel(reserva.origen)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          Hasta {format(reserva.fechaFin as Date, "dd/MM/yyyy")}
                        </span>
                        {!reserva.hizoDeposito && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Sin depósito
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Check-outs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                <LogOut className="h-5 w-5" />
                Check-outs
              </h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold">
                {checkOuts.length}
              </Badge>
            </div>

            {checkOuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm font-medium">No hay check-outs hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkOuts.map((reserva) => (
                  <Card
                    key={reserva.id}
                    className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">{reserva.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{reserva.departamento}</span>
                          </div>
                          {reserva.numero && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{reserva.numero}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={`${getOrigenColor(reserva.origen)} text-white`}>
                          {getOrigenLabel(reserva.origen)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          Desde {format(reserva.fechaInicio as Date, "dd/MM/yyyy")}
                        </span>
                        {!reserva.hizoDeposito && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Sin depósito
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumen total */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="font-medium text-gray-700">
                {checkIns.length} entrada{checkIns.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-gray-700">
                {checkOuts.length} salida{checkOuts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="font-medium text-gray-700">{checkIns.length + checkOuts.length} total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
