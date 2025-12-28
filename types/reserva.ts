import type { Timestamp } from "firebase/firestore"

export type OrigenReserva = "booking" | "airbnb" | "upcn" | "particular"
export type ContactoParticular = "iara" | "angel" | "claudia"
export type Departamento = string

export interface PrecioNoche {
  pesos?: number
  uruguayos?: number
  dolares?: number
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

  // Origen
  origen: OrigenReserva
  contactoParticular?: ContactoParticular

  // Pagos
  hizoDeposito: boolean
  montoDeposito?: number

  // Precios
  precioNoche: PrecioNoche
  precioImpuestos: number
  precioGanancia: number
  precioTotal: number

  // Metadata
  fechaCreacion: Date | Timestamp
  notas?: string
}

export interface ReservaFormData extends Omit<Reserva, "id" | "fechaInicio" | "fechaFin" | "fechaCreacion"> {
  fechaInicio: Date
  fechaFin: Date
}

export const DEPARTAMENTOS: Departamento[] = ["Los Horneros", "Las Calandrias", "Los Tordos", "Los Zorzales"]

export const ORIGENES: { value: OrigenReserva; label: string; color: string }[] = [
  { value: "booking", label: "Booking.com", color: "bg-blue-500" },
  { value: "airbnb", label: "Airbnb", color: "bg-pink-500" },
  { value: "upcn", label: "UPCN", color: "bg-green-500" },
  { value: "particular", label: "Particular", color: "bg-orange-500" },
]

export const CONTACTOS_PARTICULARES: ContactoParticular[] = ["iara", "angel", "claudia"]
