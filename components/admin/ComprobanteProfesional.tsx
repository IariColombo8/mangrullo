import type React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
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
    reserva.precioNoche && typeof reserva.precioNoche === "object"
      ? reserva.precioNoche[monedaReserva] || 0
      : 0

  const handleDownload = async () => {
    const element = document.getElementById('comprobante-content')
    if (!element) return

    try {
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0
      })

      const link = document.createElement('a')
      link.download = `comprobante-${reserva.nombre.replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Error al generar la imagen:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div id="comprobante-content" className="bg-white border-4 border-double border-gray-400 rounded-lg p-6 shadow-2xl" style={{ width: '794px' }}>
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
        <div className="mt-1 bg-gray-200 p-2 rounded border-2 border-gray-400">
          <h2 className="text-center text-base text-gray-900 font-bold text-xs uppercase tracking-wide">
            Comprobante de Reserva / Pago
          </h2>
        </div>

        {/* Datos del huésped */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Nombre del huésped:</label>
            <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{reserva.nombre}</p>
            </div>
          </div>
          <div>
            <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">País:</label>
            <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{paisData?.name || reserva.pais}</p>
            </div>
          </div>
        </div>

        {/* Canal de alquiler */}
        <div className="mb-3">
          <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide mb-1.5 block">
            Canal de alquiler:
          </label>
          <div className="flex gap-4 py-1 flex-wrap">
            {ORIGENES.map((origen) => (
              <div key={origen.value} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-4 h-4 border-2 border-gray-700 flex items-center justify-center rounded-sm",
                    reserva.origen === origen.value && "bg-gray-900",
                  )}
                >
                  {reserva.origen === origen.value && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-xs font-medium">{origen.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Columna izquierda */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 space-y-2.5">
            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Departamento/s:</label>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {DEPARTAMENTOS.map((dept) => (
                  <div key={dept} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-4 h-4 border-2 border-gray-700 flex items-center justify-center rounded-sm",
                        reserva.departamento === dept && "bg-gray-900",
                      )}
                    >
                      {reserva.departamento === dept && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-gray-700 text-xs">{dept}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Fecha de entrada:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">
                  {format(reserva.fechaInicio as Date, "dd / MM / yyyy")}
                </p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Fecha de salida:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{format(reserva.fechaFin as Date, "dd / MM / yyyy")}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Cantidad de noches:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{noches}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-sm">Cantidad de personas:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">
                  {reserva.cantidadAdultos || 0} Adultos, {reserva.cantidadMenores || 0} Menores
                </p>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 space-y-2.5">
            <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">Moneda: {nombreMoneda}</p>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Precio por noche:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">
                  {simboloMoneda} {formatCurrency(precioNocheMostrar)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Cantidad de noches:</label>
              <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{noches}</p>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-gray-400">
              <label className="text-gray-700 font-semibold text-xs uppercase tracking-wide">Subtotal:</label>
              <div className="mt-1 bg-white p-1.5 rounded border border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-xs">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-base">{formatCurrency(reserva.precioTotal)}</span>
                </div>
              </div>
            </div>

            {reserva.hizoDeposito && (
              <div>
                <label className="text-green-700 font-semibold text-xs uppercase tracking-wide">Seña / Depósito:</label>
                <div className="mt-1 bg-green-50 p-1.5 rounded border border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold text-xs">{simboloMoneda}</span>
                    <span className="text-green-700 font-bold text-base">{formatCurrency(reserva.montoDeposito)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-1.5">
              <label className="text-gray-900 font-bold text-xs uppercase tracking-wide">Total a pagar:</label>
              <div className="mt-1 bg-gray-200 p-2 rounded border-2 border-gray-400">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-sm">{simboloMoneda}</span>
                  <span className="text-gray-900 font-bold text-xl">
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

        {/* Observaciones */}
        {reserva.notas && reserva.notas.trim() !== "" && (
          <div className="mb-5">
            <label className="text-gray-800 font-semibold text-xs uppercase tracking-wide mb-1.5 block">
              Observaciones:
            </label>
            <div className="border-b border-gray-400 py-1 mt-1">
                <p className="text-gray-900">{reserva.notas}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div className="space-y-0.5">
            <p className="text-gray-900 font-semibold">Federación - Entre Ríos</p>
            <p className="text-gray-800">WhatsApp: +54 9 3456 551-306</p>
            <p className="text-gray-800">Instagram: @el_mangrullo_federacion</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-gray-800">
              N° de comprobante:{" "}
              <span className="font-bold text-gray-900">{reserva.id?.substring(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-gray-800">
              Fecha de emisión: <span className="font-semibold">{format(new Date(), "dd/MM/yyyy")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <Button onClick={onClose} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-100">
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