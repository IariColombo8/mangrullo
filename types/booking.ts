export interface Booking {
  id: string
  departamento: string
  fechaInicio: Date
  fechaFin: Date
  huesped: string
  cantidadPersonas: number
  origen: "booking" | "airbnb" | "upcn" | "particular"
  estadoPago?: string
  telefono?: string
  email?: string
  notas?: string
  monto?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Department {
  id: string
  name: string
  capacity: number
  pricePerNight: number
  color: string
  lightColor: string
  textColor: string
}

export interface SearchFilters {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  multipleUnits: boolean
}

export interface AvailabilityResult {
  department: Department
  available: boolean
  totalPrice: number
}
