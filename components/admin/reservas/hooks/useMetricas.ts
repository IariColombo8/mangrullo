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

  let departamentosAlquiladosHoy = 0
  let proximosCheckIns = 0
  let proximosCheckOuts = 0
  let reservasPendientes = 0
  let ingresosDelMes = 0

  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  reservas.forEach((r) => {
    const fechaInicio = r.fechaInicio as Date
    const fechaFin = r.fechaFin as Date

    if (fechaInicio <= now && fechaFin >= today) departamentosAlquiladosHoy += 1
    if (fechaInicio >= today && fechaInicio < tomorrow) proximosCheckIns += 1
    if (fechaFin >= today && fechaFin < tomorrow) proximosCheckOuts += 1
    if (fechaInicio > now) reservasPendientes += 1

    if (r.estado !== "cancelada" && r.estado !== "no_presentado") {
      if (fechaInicio.getMonth() === currentMonth && fechaInicio.getFullYear() === currentYear) {
        ingresosDelMes += r.precioTotal || 0
      }
    }
  })

  const totalDepartamentos = cabins.length
  const ocupacionHoy = totalDepartamentos > 0 ? Math.round((departamentosAlquiladosHoy / totalDepartamentos) * 100) : 0

  // Stats dependientes del mes filtrado (se pasan desde useFiltrados, pero se calculan aquí con filteredReservas)
  // Para evitar dependencia circular, calculamos stats con TODAS las reservas filtradas por mes aquí
  const stats = useMemo(() => {
    const startMes = startOfMonth(filterMes)
    const endMes = endOfMonth(filterMes)

    let totalReservas = 0
    let totalIngresos = 0
    let diasOcupados = 0

    reservas.forEach((r) => {
      const inicio = r.fechaInicio as Date
      const fin = r.fechaFin as Date
      if (!(inicio <= endMes && fin > startMes)) return

      totalReservas += 1
      if (r.estado !== "cancelada" && r.estado !== "no_presentado") {
        totalIngresos += r.precioTotal || 0

        const rStart = startOfDay(inicio)
        const rEnd = endOfDay(fin)
        const effectiveStart = rStart < startMes ? startMes : rStart
        const effectiveEnd = rEnd > endMes ? endMes : rEnd
        if (effectiveStart < effectiveEnd) {
          diasOcupados += Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    })

    const daysInMonth = Math.ceil((endMes.getTime() - startMes.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalDiasPotenciales = cabins.length * daysInMonth

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