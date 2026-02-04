"use client"

import { useMemo } from "react"
import { startOfMonth, endOfMonth } from "date-fns"

export function useFiltrados(estado: {
  reservas: any[]
  searchQuery: string
  filterDepartamento: string
  filterOrigen: string
  filterPais: string
  filterDeposito: string
  filterNumeroReservaBooking: string
  filterMes: Date
  setFilterDepartamento: (v: string) => void
  setFilterOrigen: (v: string) => void
  setFilterPais: (v: string) => void
  setFilterDeposito: (v: string) => void
  setFilterNumeroReservaBooking: (v: string) => void
  setSearchQuery: (v: string) => void
}) {
  const filteredReservas = useMemo(() => {
    const startMes = startOfMonth(estado.filterMes)
    const endMes = endOfMonth(estado.filterMes)
    const normalizedSearch = estado.searchQuery.trim().toLowerCase()
    const normalizedBooking = estado.filterNumeroReservaBooking.trim().toLowerCase()

    return estado.reservas.filter((reserva) => {
      // Búsqueda por nombre o teléfono
      const matchesSearch =
        !normalizedSearch ||
        (reserva.nombre?.toLowerCase().includes(normalizedSearch)) ||
        (reserva.numero?.includes(estado.searchQuery))

      // Filtro departamento (soporta múltiples)
      let matchesDepartamento = true
      if (estado.filterDepartamento !== "todos") {
        if (reserva.esReservaMultiple && reserva.departamentos) {
          matchesDepartamento = reserva.departamentos.some((d: any) => d.departamento === estado.filterDepartamento)
        } else {
          matchesDepartamento = reserva.departamento === estado.filterDepartamento
        }
      }

      const matchesOrigen = estado.filterOrigen === "todos" || reserva.origen === estado.filterOrigen
      const matchesPais = estado.filterPais === "todos" || reserva.pais === estado.filterPais

      let matchesDeposito = true
      if (estado.filterDeposito === "si") matchesDeposito = reserva.hizoDeposito
      else if (estado.filterDeposito === "no") matchesDeposito = !reserva.hizoDeposito

      const matchesBooking =
        !normalizedBooking || reserva.numeroReservaBooking?.toLowerCase().includes(normalizedBooking)

      // Filtro por mes: la reserva se muestra si algún día cae dentro del mes
      const inicio = reserva.fechaInicio as Date
      const fin = reserva.fechaFin as Date
      const matchesMes = inicio <= endMes && fin > startMes

      return matchesSearch && matchesDepartamento && matchesOrigen && matchesPais && matchesDeposito && matchesBooking && matchesMes
    })
  }, [
    estado.reservas,
    estado.searchQuery,
    estado.filterDepartamento,
    estado.filterOrigen,
    estado.filterPais,
    estado.filterDeposito,
    estado.filterNumeroReservaBooking,
    estado.filterMes,
  ])

  const hasActiveFilters =
    estado.searchQuery !== "" ||
    estado.filterDepartamento !== "todos" ||
    estado.filterOrigen !== "todos" ||
    estado.filterPais !== "todos" ||
    estado.filterDeposito !== "todos" ||
    estado.filterNumeroReservaBooking !== ""

  const clearAllFilters = () => {
    estado.setFilterDepartamento("todos")
    estado.setFilterOrigen("todos")
    estado.setFilterPais("todos")
    estado.setFilterDeposito("todos")
    estado.setFilterNumeroReservaBooking("")
    estado.setSearchQuery("")
  }

  return { filteredReservas, hasActiveFilters, clearAllFilters }
}