"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Home, TrendingUp, DollarSign, Calendar, LogIn, LogOut, Users, Clock, CheckCircle2 } from "lucide-react"

interface DashboardMetricsProps {
  departamentosAlquiladosHoy: number
  ocupacionHoy: number
  proximosCheckIns: number
  proximosCheckOuts: number
  reservasPendientes: number
  ingresosDelMes: number
  totalReservas: number
  totalIngresos: number
  ocupacionTotal: string
  filterMes: Date
  now: Date
  formatCurrency: (value: number | undefined | null) => string
}

export default function DashboardMetrics({
  departamentosAlquiladosHoy,
  ocupacionHoy,
  proximosCheckIns,
  proximosCheckOuts,
  reservasPendientes,
  ingresosDelMes,
  totalReservas,
  totalIngresos,
  ocupacionTotal,
  filterMes,
  now,
  formatCurrency,
}: DashboardMetricsProps) {
  // Calcular promedio de ingresos por reserva
  const promedioIngresos = totalReservas > 0 ? Math.round(totalIngresos / totalReservas) : 0
  
  // Calcular días restantes del mes
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const diasRestantesMes = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Formatear mes
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const mesFormateado = `${meses[filterMes.getMonth()]} ${filterMes.getFullYear()}`

  return (
    <div className="space-y-4">
      {/* Métricas principales - más compactas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Alquilados Hoy */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="pt-4 pb-4 px-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mb-1.5">
                <Home className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{departamentosAlquiladosHoy}</p>
              <p className="text-xs font-medium text-emerald-100 mt-0.5">Alquilados Hoy</p>
            </div>
          </CardContent>
        </Card>

        {/* Ocupación Hoy */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="pt-4 pb-4 px-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mb-1.5">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{ocupacionHoy}%</p>
              <p className="text-xs font-medium text-blue-100 mt-0.5">Ocupación Hoy</p>
            </div>
          </CardContent>
        </Card>

        {/* Check-ins Hoy */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="pt-4 pb-4 px-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mb-1.5">
                <LogIn className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{proximosCheckIns}</p>
              <p className="text-xs font-medium text-purple-100 mt-0.5">Check-ins Hoy</p>
            </div>
          </CardContent>
        </Card>

        {/* Check-outs Hoy */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="pt-4 pb-4 px-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mb-1.5">
                <LogOut className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{proximosCheckOuts}</p>
              <p className="text-xs font-medium text-orange-100 mt-0.5">Check-outs Hoy</p>
            </div>
          </CardContent>
        </Card>

        {/* Reservas Futuras */}
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="pt-4 pb-4 px-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mb-1.5">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">{reservasPendientes}</p>
              <p className="text-xs font-medium text-teal-100 mt-0.5">Reservas Futuras</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas del mes seleccionado - más detalladas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Total Reservas del Mes */}
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-5 pb-5 px-4">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">Reservas</p>
                <p className="text-3xl md:text-4xl font-bold mt-2">{totalReservas}</p>
                <p className="text-xs text-indigo-100/80 mt-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mesFormateado}
                </p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Totales del Mes */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-5 pb-5 px-4">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide">Ingresos</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 truncate">${formatCurrency(totalIngresos)}</p>
                <p className="text-xs text-emerald-100/80 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Total del mes
                </p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ocupación del Mes */}
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-5 pb-5 px-4">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-xs font-medium text-violet-100 uppercase tracking-wide">Ocupación</p>
                <p className="text-3xl md:text-4xl font-bold mt-2">{ocupacionTotal}%</p>
                <p className="text-xs text-violet-100/80 mt-1.5 flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Del mes completo
                </p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promedio por Reserva */}
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-5 pb-5 px-4">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-xs font-medium text-amber-100 uppercase tracking-wide">Promedio</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 truncate">${formatCurrency(promedioIngresos)}</p>
                <p className="text-xs text-amber-100/80 mt-1.5 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Por reserva
                </p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fecha Actual y Días Restantes */}
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="pt-5 pb-5 px-4">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-xs font-medium text-rose-100 uppercase tracking-wide">Hoy</p>
                <p className="text-3xl md:text-4xl font-bold mt-2">
                  {String(now.getDate()).padStart(2, '0')}/{String(now.getMonth() + 1).padStart(2, '0')}
                </p>
                <p className="text-xs text-rose-100/80 mt-1.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {diasRestantesMes} días quedan
                </p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}