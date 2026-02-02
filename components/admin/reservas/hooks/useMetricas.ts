"use client"

import { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"
import type { Reserva } from "@/types/reserva"

interface UseMetricasProps {
  reservas: Reserva[]
  cabins: { id: string; name: string }[]
  filterMes: Date
}

export function useMetricas({ reservas, cabins, filterMes }: UseMetricasProps) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  const departamentosAlquiladosHoy = reservas.filter((r) => r.fechaInicio <= now && r.fechaFin >= today).length
  const proximosCheckIns = reservas.filter((r) => r.fechaInicio >= today && r.fechaInicio < tomorrow).length
  const proximosCheckOuts = reservas.filter((r) => r.fechaFin >= today && r.fechaFin < tomorrow).length
  const reservasPendientes = reservas.filter((r) => r.fechaInicio > now).length

  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const ingresosDelMes = reservas
    .filter((r) => {
      if (r.estado === "cancelada" || r.estado === "no_presentado") return false
      const fecha = r.fechaInicio as Date
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear
    })
    .reduce((sum, r) => sum + (r.precioTotal || 0), 0)

  const totalDepartamentos = cabins.length
  const ocupacionHoy = totalDepartamentos > 0 ? Math.round((departamentosAlquiladosHoy / totalDepartamentos) * 100) : 0

  // Stats dependientes del mes filtrado (se pasan desde useFiltrados, pero se calculan aquí con filteredReservas)
  // Para evitar dependencia circular, calculamos stats con TODAS las reservas filtradas por mes aquí
  const stats = useMemo(() => {
    const startMes = startOfMonth(filterMes)
    const endMes = endOfMonth(filterMes)

    // Filtrar por mes para las métricas del panel
    const reservasMes = reservas.filter((r) => {
      const inicio = r.fechaInicio as Date
      const fin = r.fechaFin as Date
      return inicio <= endMes && fin > startMes
    })

    const activas = reservasMes.filter((r) => r.estado !== "cancelada" && r.estado !== "no_presentado")
    const totalReservas = reservasMes.length
    const totalIngresos = activas.reduce((sum, r) => sum + (r.precioTotal || 0), 0)

    const daysInMonth = Math.ceil((endMes.getTime() - startMes.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalDiasPotenciales = cabins.length * daysInMonth

    const diasOcupados = activas.reduce((sum, r) => {
      const rStart = startOfDay(r.fechaInicio as Date)
      const rEnd = endOfDay(r.fechaFin as Date)
      const effectiveStart = rStart < startMes ? startMes : rStart
      const effectiveEnd = rEnd > endMes ? endMes : rEnd
      if (effectiveStart >= effectiveEnd) return sum
      return sum + Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)

    const ocupacionTotal = totalDiasPotenciales > 0 ? ((diasOcupados / totalDiasPotenciales) * 100).toFixed(1) : "0.0"

    return { totalReservas, totalIngresos, ocupacionTotal }
  }, [reservas, cabins, filterMes])

  return {
    now,
    departamentosAlquiladosHoy,
    proximosCheckIns,
    proximosCheckOuts,
    reservasPendientes,
    ingresosDelMes,
    ocupacionHoy,
    stats,
  }
}