import type { Timestamp } from "firebase/firestore"

export type OrigenReserva = "booking" | "airbnb" | "upcn" | "particular"
export type ContactoParticular = "iara" | "angel" | "claudia"
export type Departamento = string
export type EstadoReserva = "activa" | "cancelada" | "no_presentado" | "pagado"

export interface PrecioNoche {
  pesos?: number
  uruguayos?: number
  dolares?: number
}

export interface DepartamentoDetalle {
  departamento: Departamento
  cantidadAdultos: number
  cantidadMenores: number
  precioNoche: PrecioNoche
  precioTotal: number
}

export interface Reserva {
  id?: string
  // Identificación
  departamento: Departamento

  // Fechas
  fechaInicio: Date | Timestamp
  fechaFin: Date | Timestamp

  // Cliente
  nombre: string
  pais: string
  numero: string
  cantidadAdultos?: number
  cantidadMenores?: number

  // Origen
  origen: OrigenReserva
  contactoParticular?: ContactoParticular

  numeroReservaBooking?: string

  // Pagos
  hizoDeposito: boolean
  montoDeposito?: number
  fechaDeposito?: Date | Timestamp

  // Precios
  precioNoche: PrecioNoche
  precioImpuestos: number
  precioGanancia: number
  precioTotal: number

  // Metadata
  fechaCreacion: Date | Timestamp
  notas?: string

  estado?: EstadoReserva
  moneda?: string

  esReservaMultiple?: boolean
  departamentos?: DepartamentoDetalle[]
}

export interface ReservaFormData extends Omit<Reserva, "id" | "fechaInicio" | "fechaFin" | "fechaCreacion"> {
  fechaInicio: Date
  fechaFin: Date
  fechaDeposito?: Date
}

export const DEPARTAMENTOS: Departamento[] = ["Los Horneros", "Las Calandrias", "Los Tordos", "Los Zorzales"]

export const ORIGENES: { value: OrigenReserva; label: string; color: string }[] = [
  { value: "booking", label: "Booking", color: "bg-blue-500" },
  { value: "airbnb", label: "Airbnb", color: "bg-pink-500" },
  { value: "upcn", label: "UPCN", color: "bg-[#9E3D2E]" }, // ← CAMBIA ESTA LÍNEA
  { value: "particular", label: "Particular", color: "bg-orange-500" },
]

export const ESTADOS_RESERVA: { value: EstadoReserva; label: string; color: string }[] = [
  { value: "activa", label: "Activa", color: "bg-emerald-500" },
  { value: "pagado", label: "Pagado", color: "bg-green-600" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-500" },
  { value: "no_presentado", label: "No presentado", color: "bg-amber-500" },
]

export const CONTACTOS_PARTICULARES: ContactoParticular[] = ["iara", "angel", "claudia"]
