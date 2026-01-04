"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Home, TrendingUp, DollarSign, CalendarIcon, LogIn, LogOut } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <Home className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{departamentosAlquiladosHoy}</p>
            <p className="text-xs md:text-sm font-medium text-emerald-100 mt-1">Alquilados Hoy</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{ocupacionHoy}%</p>
            <p className="text-xs md:text-sm font-medium text-blue-100 mt-1">Ocupación Hoy</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <LogIn className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{proximosCheckIns}</p>
            <p className="text-xs md:text-sm font-medium text-purple-100 mt-1">Check-ins Hoy</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <LogOut className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{proximosCheckOuts}</p>
            <p className="text-xs md:text-sm font-medium text-orange-100 mt-1">Check-outs Hoy</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white">{reservasPendientes}</p>
            <p className="text-xs md:text-sm font-medium text-teal-100 mt-1">Reservas Futuras</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-800 to-teal-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm mb-2">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">${formatCurrency(ingresosDelMes)}</p>
            <p className="text-xs md:text-sm font-medium text-green-100 mt-1">Ingresos del Mes</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium text-blue-100">Total Reservas</p>
              <p className="text-4xl font-bold mt-2">{totalReservas}</p>
              <p className="text-xs text-blue-100 mt-1">del mes seleccionado</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium text-green-100">Ingresos</p>
              <p className="text-3xl font-bold mt-2">${formatCurrency(totalIngresos)}</p>
              <p className="text-xs text-green-100 mt-1">{format(filterMes, "MMMM yyyy", { locale: es })}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium text-purple-100">Ocupación</p>
              <p className="text-4xl font-bold mt-2">{ocupacionTotal}%</p>
              <p className="text-xs text-purple-100 mt-1">del mes</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium text-orange-100">Fecha Actual</p>
              <p className="text-2xl font-bold mt-2">{format(now, "dd/MM")}</p>
              <p className="text-xs text-orange-100 mt-1">{format(now, "EEEE", { locale: es })}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
