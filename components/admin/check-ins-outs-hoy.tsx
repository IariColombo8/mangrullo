"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Home, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Reserva } from "@/types/reserva"
import { cn } from "@/lib/utils"

const ORIGENES = [
  { value: "booking", label: "Booking", color: "bg-gradient-to-r from-blue-600 to-blue-700" },
  { value: "airbnb", label: "Airbnb", color: "bg-gradient-to-r from-pink-600 to-red-600" },
  { value: "upcn", label: "UPCN", color: "bg-gradient-to-r from-[#9E3D2E] to-[#7E2D1E]" },
  { value: "particular", label: "Particular", color: "bg-gradient-to-r from-purple-600 to-indigo-600" },
]

interface CheckInsOutsHoyProps {
  reservas: Reserva[]
  onReservaClick?: (reserva: Reserva) => void
}

export default function CheckInsOutsHoy({ reservas, onReservaClick }: CheckInsOutsHoyProps) {
  // Filtrar solo reservas activas (no canceladas ni no presentados)
  const reservasActivas = reservas.filter((r) => r.estado !== "cancelada" && r.estado !== "no_presentado")

  const getOrigenColor = (origen: string) => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  // Si no hay check-ins ni check-outs, no mostrar nada
  if (reservasActivas.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">
            Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Check-ins */}
          <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-green-900">
                Check-ins ({reservasActivas.filter((r) => format(r.fechaInicio as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length})
              </h4>
            </div>
            <div className="space-y-2">
              {reservasActivas.filter((r) => format(r.fechaInicio as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length === 0 ? (
                <p className="text-sm text-gray-500">No hay check-ins hoy</p>
              ) : (
                reservasActivas
                  .filter((r) => format(r.fechaInicio as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
                  .map((reserva) => (
                    <div
                      key={reserva.id}
                      onClick={() => onReservaClick?.(reserva)}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
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

          {/* Check-outs */}
          <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-4 w-4 text-orange-600" />
              <h4 className="font-semibold text-orange-900">
                Check-outs ({reservasActivas.filter((r) => format(r.fechaFin as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length})
              </h4>
            </div>
            <div className="space-y-2">
              {reservasActivas.filter((r) => format(r.fechaFin as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length === 0 ? (
                <p className="text-sm text-gray-500">No hay check-outs hoy</p>
              ) : (
                reservasActivas
                  .filter((r) => format(r.fechaFin as Date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
                  .map((reserva) => (
                    <div
                      key={reserva.id}
                      onClick={() => onReservaClick?.(reserva)}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer"
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
  )
}