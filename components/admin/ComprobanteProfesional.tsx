"use client"

import type React from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Edit, Download, CheckCircle2 } from "lucide-react"
import type { Reserva } from "@/types/reserva"
import { ORIGENES } from "@/types/reserva"
import { cn } from "@/lib/utils"
import html2canvas from "html2canvas"

const PAISES = [
  { code: "AR", name: "Argentina", currency: "pesos", symbol: "ARS" },
  { code: "UY", name: "Uruguay", currency: "uruguayos", symbol: "UYU" },
  { code: "BR", name: "Brasil", currency: "dolares", symbol: "USD" },
  { code: "CL", name: "Chile", currency: "dolares", symbol: "USD" },
  { code: "US", name: "Estados Unidos", currency: "dolares", symbol: "USD" },
  { code: "ES", name: "España", currency: "dolares", symbol: "EUR" },
  { code: "FR", name: "Francia", currency: "dolares", symbol: "EUR" },
  { code: "OTHER", name: "Otro", currency: "dolares", symbol: "USD" },
]

const DEPARTAMENTOS = ["Los Horneros", "Los Zorzales", "Los Tordos", "Las Calandrias"]

interface ComprobanteProfesionalProps {
  reserva: Reserva
  onClose: () => void
  onEdit: () => void
}

const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0"
  return value.toLocaleString("es-AR")
}

const ComprobanteProfesional: React.FC<ComprobanteProfesionalProps> = ({ reserva, onClose, onEdit }) => {
  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const noches = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
  const paisData = PAISES.find((p) => p.code === reserva.pais)

  // Determinar la moneda a mostrar
  const monedaReserva = reserva.moneda || "AR"
  let simboloMoneda = "$"
  let nombreMoneda = "Pesos Argentinos"

  if (monedaReserva === "AR") {
    simboloMoneda = "ARS $"
    nombreMoneda = "Pesos Argentinos"
  } else if (monedaReserva === "UY") {
    simboloMoneda = "UYU $"
    nombreMoneda = "Pesos Uruguayos"
  } else if (monedaReserva === "USD") {
    simboloMoneda = "USD $"
    nombreMoneda = "Dólares Estadounidenses"
  } else if (monedaReserva === "EUR") {
    simboloMoneda = "EUR €"
    nombreMoneda = "Euros"
  } else {
    // Fallback para otros códigos de país
    const paisMatch = PAISES.find((p) => p.code === monedaReserva)
    if (paisMatch) {
      simboloMoneda = `${paisMatch.symbol} $`
      nombreMoneda = paisMatch.currency.charAt(0).toUpperCase() + paisMatch.currency.slice(1)
    }
  }

  const precioNocheMostrar =
    reserva.precioNoche && typeof reserva.precioNoche === "object" ? reserva.precioNoche[monedaReserva] || 0 : 0

  const handleDownload = async () => {
    const element = document.getElementById("comprobante-content")
    if (!element) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 150))

      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0,
      })

      const link = document.createElement("a")
      link.download = `comprobante-${reserva.nombre.replace(/\s+/g, "-")}-${format(new Date(), "dd-MM-yyyy")}.png`
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()
    } catch (error) {
      console.error("Error al generar la imagen:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div
        id="comprobante-content"
        className="bg-white border-4 border-double border-gray-400 rounded-lg p-6 shadow-2xl"
        style={{ width: "794px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
          <div className="flex items-center">
            <img src="/mangrullo.png" alt="El Mangrullo" className="h-20 w-auto object-contain" />
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide uppercase">El Mangrullo</h1>
            <p className="text-sm text-gray-600">Complejo Turístico</p>
          </div>
        </div>

        {/* Título */}
        <div className="mt-1 bg-gray-200 p-2.5 rounded border-2 border-gray-400">
          <h2 className="text-center text-base text-gray-900 font-bold uppercase tracking-wide">
            Comprobante de Reserva / Pago
          </h2>
        </div>

        {reserva.estado === "pagado" && (
          <div className="mt-3 bg-green-100 border-2 border-green-500 rounded-lg p-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="text-green-700 font-bold text-lg uppercase tracking-wide">PAGADO</span>
          </div>
        )}

        {/* Datos del huésped */}
        <div className="grid grid-cols-2 gap-4 mb-3 mt-3">
          <div>
            <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Nombre del huésped:</label>
            <div className="border-b-2 border-gray-400 py-1.5 mt-1">
              <p className="text-gray-900 font-medium text-base">{reserva.nombre}</p>
            </div>
          </div>
          <div>
            <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">País:</label>
            <div className="border-b-2 border-gray-400 py-1.5 mt-1">
              <p className="text-gray-900 font-medium text-base">{paisData?.name || reserva.pais}</p>
            </div>
          </div>
        </div>

        {/* Canal de alquiler */}
        <div className="mb-3">
          <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-2 block">
            Canal de alquiler:
          </label>
          <div className="flex gap-5 py-1 flex-wrap">
            {ORIGENES.map((origen) => (
              <div key={origen.value} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-5 h-5 border-2 border-gray-700 flex items-center justify-center rounded-sm",
                    reserva.origen === origen.value && "bg-gray-900",
                  )}
                >
                  {reserva.origen === origen.value && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-gray-700 text-sm font-medium">{origen.label}</span>
              </div>
            ))}
          </div>
        </div>

        {reserva.numeroReservaBooking && reserva.origen === "booking" && (
          <div className="mb-3">
            <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
              Número de Reserva Booking:
            </label>
            <div className="border-b-2 border-gray-400 py-1.5 mt-1">
              <p className="text-gray-900 font-medium text-base">{reserva.numeroReservaBooking}</p>
            </div>
          </div>
        )}

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Columna izquierda */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 space-y-3">
            <div>
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-2 block">
                {reserva.esReservaMultiple ? `Departamentos (${reserva.departamentos?.length}):` : "Departamento/s:"}
              </label>
              {reserva.esReservaMultiple && reserva.departamentos ? (
                // Multi-cabin display
                <div className="space-y-2">
                  {reserva.departamentos.map((dept) => {
                    const isSelected = dept.departamento

                    return (
                      <div key={dept.departamento} className="flex items-center gap-2 border-b border-gray-200 pb-2">
                        <div className="w-5 h-5 border-2 border-gray-700 flex items-center justify-center rounded-sm flex-shrink-0 bg-gray-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{dept.departamento}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Single cabin display
                <div className="grid grid-cols-2 gap-2">
                  {DEPARTAMENTOS.map((dept) => {
                    const isSelected = reserva.departamento?.trim() === dept.trim()

                    return (
                      <div key={dept} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-5 h-5 border-2 border-gray-700 flex items-center justify-center rounded-sm flex-shrink-0",
                            isSelected && "bg-gray-900",
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-gray-700 text-sm">{dept}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Fechas en una fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Fecha de entrada:</label>
                <div className="border-b border-gray-400 py-1 mt-1">
                  <p className="text-gray-900 text-sm font-medium">
                    {format(reserva.fechaInicio as Date, "dd / MM / yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Fecha de salida:</label>
                <div className="border-b border-gray-400 py-1 mt-1">
                  <p className="text-gray-900 text-sm font-medium">
                    {format(reserva.fechaFin as Date, "dd / MM / yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Cantidad de noches */}
            <div>
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Cantidad de noches:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900 font-bold text-sm">{noches}</p>
              </div>
            </div>

            {reserva.esReservaMultiple && reserva.departamentos ? (
              // Display per-cabin guest counts
              <div>
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-2 block">
                  Cantidad de personas por departamento:
                </label>
                <div className="space-y-1">
                  {reserva.departamentos.map((dept) => (
                    <div key={dept.departamento} className="text-sm">
                      <span className="font-medium">{dept.departamento}:</span> {dept.cantidadAdultos} Adultos,{" "}
                      {dept.cantidadMenores} Menores
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Display total guest count for single cabin
              <div>
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                  Cantidad de personas:
                </label>
                <div className="border-b border-gray-400 py-1 mt-1">
                  <p className="text-gray-900 text-sm">
                    {reserva.cantidadAdultos || 0} Adultos, {reserva.cantidadMenores || 0} Menores
                  </p>
                </div>
              </div>
            )}

            {/* Observaciones dentro del mismo recuadro */}
            {reserva.notas && reserva.notas.trim() !== "" && (
              <div className="pt-2">
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-1.5 block">
                  Observaciones:
                </label>
                <div className="border border-gray-300 rounded p-2.5 bg-white">
                  <p className="text-gray-700 text-sm leading-relaxed">{reserva.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 space-y-3">
            <div className="mb-1 pb-2 border-b border-gray-300">
              <p className="text-sm text-gray-600 font-medium">Moneda: {nombreMoneda}</p>
            </div>

            {reserva.esReservaMultiple && reserva.departamentos ? (
              // Multi-cabin pricing display
              <div className="space-y-3">
                <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide block">
                  Precios por departamento:
                </label>
                {reserva.departamentos.map((dept) => {
                  const precioNoche = dept.precioNoche[monedaReserva] || 0
                  return (
                    <div key={dept.departamento} className="border-b border-gray-300 pb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">{dept.departamento}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Precio por noche:</span>
                        <span className="font-semibold text-gray-900">
                          {simboloMoneda} {formatCurrency(precioNoche)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Total ({noches} noches):</span>
                        <span className="font-bold text-gray-900">
                          {simboloMoneda} {formatCurrency(dept.precioTotal)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Single cabin pricing display
              <>
                <div>
                  <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                    Precio por noche:
                  </label>
                  <div className="border-b border-gray-400 py-1 mt-1">
                    <p className="text-gray-900 text-base font-semibold">
                      {simboloMoneda} {formatCurrency(precioNocheMostrar)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                    Cantidad de noches:
                  </label>
                  <div className="border-b border-gray-400 py-1 mt-1">
                    <p className="text-gray-900 font-bold text-base">{noches}</p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t-2 border-gray-400">
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Subtotal:</label>
              <div className="mt-1 bg-white p-2 rounded border border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-sm">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-lg">{formatCurrency(reserva.precioTotal)}</span>
                </div>
              </div>
            </div>

            {reserva.hizoDeposito && (
              <div>
                <label className="text-green-700 font-semibold text-sm uppercase tracking-wide">Seña / Depósito:</label>
                <div className="mt-1 bg-green-50 p-2 rounded border border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold text-sm">{simboloMoneda}</span>
                    <span className="text-green-700 font-bold text-lg">{formatCurrency(reserva.montoDeposito)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="text-gray-900 font-bold text-sm uppercase tracking-wide">Total a pagar:</label>
              <div className="mt-1 bg-gray-200 p-2.5 rounded border-2 border-gray-400">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-base">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-2xl">
                    {formatCurrency(
                      reserva.hizoDeposito
                        ? (reserva.precioTotal || 0) - (reserva.montoDeposito || 0)
                        : reserva.precioTotal,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="space-y-1">
            <p className="text-gray-700 font-semibold">Federación - Entre Ríos</p>
            <p className="text-gray-600">WhatsApp: +54 9 3456 551-306</p>
            <p className="text-gray-600">Instagram: @el_mangrullo_federacion</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-gray-700">
              N° de comprobante:{" "}
              <span className="font-bold text-gray-900">{reserva.id?.substring(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-gray-700">
              Fecha de emisión: <span className="font-semibold">{format(new Date(), "dd/MM/yyyy")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <Button onClick={onClose} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-100 bg-transparent">
          Cerrar
        </Button>
        <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
        <Button onClick={onEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  )
}

export default ComprobanteProfesional
