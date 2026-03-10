export const PAISES = [
  { code: "AR", name: "Argentina", currency: "pesos" },
  { code: "UY", name: "Uruguay", currency: "uruguayos" },
  { code: "BR", name: "Brasil", currency: "dolares" },
  { code: "CL", name: "Chile", currency: "dolares" },
  { code: "US", name: "Estados Unidos", currency: "dolares" },
  { code: "ES", name: "España", currency: "dolares" },
  { code: "FR", name: "Francia", currency: "dolares" },
  { code: "OTHER", name: "Otro", currency: "dolares" },
]

export const ESTADOS_RESERVA = [
  { value: "activa" as const, label: "Activa", color: "bg-gradient-to-r from-emerald-600 to-teal-600" },
  { value: "confirmada" as const, label: "Confirmada", color: "bg-gradient-to-r from-blue-600 to-indigo-600" },
  { value: "cancelada" as const, label: "Cancelada", color: "bg-gradient-to-r from-red-600 to-pink-600" },
  { value: "no_presentado" as const, label: "No Presentado", color: "bg-gradient-to-r from-orange-600 to-yellow-600" },
  { value: "pagado" as const, label: "Pagada", color: "bg-gradient-to-r from-green-600 to-black-600" },
]