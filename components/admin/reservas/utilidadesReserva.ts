import type { Reserva, Departamento, OrigenReserva } from "@/types/reserva"
import { PAISES } from "./constantesReserva"
import { startOfDay, isBefore } from "date-fns"

export const toValidDate = (dateValue: any): Date => {
  if (!dateValue) return new Date()

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue
  }

  if (dateValue.toDate && typeof dateValue.toDate === "function") {
    try {
      const converted = dateValue.toDate()
      return isNaN(converted.getTime()) ? new Date() : converted
    } catch (e) {
      console.error("Error converting Firestore timestamp:", e)
      return new Date()
    }
  }

  try {
    const converted = new Date(dateValue)
    return isNaN(converted.getTime()) ? new Date() : converted
  } catch (e) {
    console.error("Error parsing date:", e)
    return new Date()
  }
}

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0"
  return value.toLocaleString()
}

export const getPrecioNocheValue = (reserva: Reserva): number => {
  if (!reserva.precioNoche || typeof reserva.precioNoche !== "object") return 0
  const currency = reserva.moneda || "ARS"
  return reserva.precioNoche[currency] || 0
}

export const calculateNights = (inicio: Date, fin: Date): number => {
  return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
}

export const getCurrency = (pais: string, origen: OrigenReserva): string => {
  if (origen === "booking" || origen === "airbnb") return "dolares"
  const paisData = PAISES.find((p) => p.code === pais)
  return paisData?.currency || "dolares"
}

export const needsPaymentAlert = (reserva: Reserva): boolean => {
  const today = startOfDay(new Date())
  const fechaSalida = reserva.fechaFin as Date
  return !reserva.hizoDeposito && isBefore(fechaSalida, today)
}

export const cleanDataForFirestore = (data: any) => {
  const cleaned: any = {}
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      cleaned[key] = data[key]
    }
  })
  return cleaned
}

export const checkOverlap = (
  reservas: Reserva[],
  departamento: Departamento,
  fechaInicio: Date,
  fechaFin: Date,
  excludeId?: string
): boolean => {
  return reservas.some((reserva) => {
    if (reserva.id === excludeId) return false
    if (reserva.estado === "cancelada" || reserva.estado === "no_presentado") return false

    const rStart = (reserva.fechaInicio as Date).getTime()
    const rEnd = (reserva.fechaFin as Date).getTime()
    const newStart = fechaInicio.getTime()
    const newEnd = fechaFin.getTime()

    const hasOverlap = newStart < rEnd && newEnd > rStart

    if (reserva.esReservaMultiple && reserva.departamentos) {
      return hasOverlap && reserva.departamentos.some((d) => d.departamento === departamento)
    } else {
      return hasOverlap && reserva.departamento === departamento
    }
  })
}