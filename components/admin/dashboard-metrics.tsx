"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Home, TrendingUp, DollarSign, Calendar, LogIn, LogOut, Users, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { useState } from "react"

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
  const [showAll, setShowAll] = useState(false)

  // Calcular promedio de ingresos por reserva
  const promedioIngresos = totalReservas > 0 ? Math.round(totalIngresos / totalReservas) : 0
  
  // Calcular días restantes del mes
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const diasRestantesMes = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Formatear mes
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const mesFormateado = `${meses[filterMes.getMonth()]} ${filterMes.getFullYear()}`

  const allMetrics = [
    {
      icon: Home,
      value: departamentosAlquiladosHoy,
      label: "Alquilados Hoy",
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-100",
      iconBg: "bg-white/20"
    },
    {
      icon: DollarSign,
      value: `$${formatCurrency(totalIngresos)}`,
      label: "Ingresos",
      subtitle: "Total del mes",
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-100",
      iconBg: "bg-white/20",
      isLarge: true
    },
    {
      icon: TrendingUp,
      value: `${ocupacionHoy}%`,
      label: "Ocupación Hoy",
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      iconBg: "bg-white/20"
    },
    {
      icon: LogIn,
      value: proximosCheckIns,
      label: "Check-ins Hoy",
      gradient: "from-purple-500 to-purple-600",
      textColor: "text-purple-100",
      iconBg: "bg-white/20"
    },
    {
      icon: LogOut,
      value: proximosCheckOuts,
      label: "Check-outs Hoy",
      gradient: "from-orange-500 to-orange-600",
      textColor: "text-orange-100",
      iconBg: "bg-white/20"
    },
    {
      icon: Calendar,
      value: reservasPendientes,
      label: "Reservas Futuras",
      gradient: "from-teal-500 to-teal-600",
      textColor: "text-teal-100",
      iconBg: "bg-white/20"
    },
    {
      icon: CheckCircle2,
      value: totalReservas,
      label: "Reservas",
      subtitle: mesFormateado,
      gradient: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-100",
      iconBg: "bg-white/20",
      isLarge: true
    },
    {
      icon: TrendingUp,
      value: `${ocupacionTotal}%`,
      label: "Ocupación",
      subtitle: "Del mes completo",
      gradient: "from-violet-500 to-violet-600",
      textColor: "text-violet-100",
      iconBg: "bg-white/20",
      isLarge: true
    },
    {
      icon: Users,
      value: `$${formatCurrency(promedioIngresos)}`,
      label: "Promedio",
      subtitle: "Por reserva",
      gradient: "from-amber-500 to-amber-600",
      textColor: "text-amber-100",
      iconBg: "bg-white/20",
      isLarge: true
    },
    {
      icon: Calendar,
      value: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`,
      label: "Hoy",
      subtitle: `${diasRestantesMes} días quedan`,
      gradient: "from-rose-500 to-rose-600",
      textColor: "text-rose-100",
      iconBg: "bg-white/20",
      isLarge: true
    }
  ]

  const visibleMetrics = showAll ? allMetrics : allMetrics.slice(0, 2)

  return (
    <div className="space-y-4">
      {/* Desktop - Mostrar todas las métricas */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3 md:gap-4">
        {allMetrics.map((metric, index) => {
          const Icon = metric.icon
          
          if (metric.isLarge) {
            return (
              <Card key={index} className={`bg-gradient-to-br ${metric.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-200`}>
                <CardContent className="pt-5 pb-5 px-4">
                  <div className="flex items-start justify-between">
                    <div className="text-white">
                      <p className={`text-xs font-medium ${metric.textColor} uppercase tracking-wide`}>{metric.label}</p>
                      <p className="text-3xl md:text-4xl font-bold mt-2 truncate">{metric.value}</p>
                      {metric.subtitle && (
                        <p className={`text-xs ${metric.textColor}/80 mt-1.5 flex items-center gap-1`}>
                          <Icon className="h-3 w-3" />
                          {metric.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`p-2.5 ${metric.iconBg} rounded-xl backdrop-blur-sm`}>
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={index} className={`bg-gradient-to-br ${metric.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <CardContent className="pt-4 pb-4 px-3">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-2 ${metric.iconBg} rounded-xl backdrop-blur-sm mb-1.5`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white">{metric.value}</p>
                  <p className={`text-xs font-medium ${metric.textColor} mt-0.5`}>{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mobile - Mostrar 2 métricas + botón expandir */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {visibleMetrics.map((metric, index) => {
            const Icon = metric.icon
            
            if (metric.isLarge) {
              return (
                <Card key={index} className={`bg-gradient-to-br ${metric.gradient} border-0 shadow-lg`}>
                  <CardContent className="pt-4 pb-4 px-3">
                    <div className="flex items-start justify-between">
                      <div className="text-white">
                        <p className={`text-xs font-medium ${metric.textColor} uppercase tracking-wide`}>{metric.label}</p>
                        <p className="text-2xl font-bold mt-1 truncate">{metric.value}</p>
                        {metric.subtitle && (
                          <p className={`text-xs ${metric.textColor}/80 mt-1 flex items-center gap-1`}>
                            <Icon className="h-3 w-3" />
                            {metric.subtitle}
                          </p>
                        )}
                      </div>
                      <div className={`p-2 ${metric.iconBg} rounded-xl backdrop-blur-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={index} className={`bg-gradient-to-br ${metric.gradient} border-0 shadow-lg`}>
                <CardContent className="pt-4 pb-4 px-3">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 ${metric.iconBg} rounded-xl backdrop-blur-sm mb-1.5`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className={`text-xs font-medium ${metric.textColor} mt-0.5`}>{metric.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Botón para expandir/colapsar */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          {showAll ? (
            <>
              <span>Ver menos</span>
              <ChevronRight className="h-5 w-5 rotate-90 transition-transform" />
            </>
          ) : (
            <>
              <span>Ver todas las métricas ({allMetrics.length - 2} más)</span>
              <ChevronRight className="h-5 w-5 -rotate-90 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}