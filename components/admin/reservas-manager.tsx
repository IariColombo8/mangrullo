"use client"

import type React from "react"

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Reserva,
  ReservaFormData,
  Departamento,
  OrigenReserva,
  ContactoParticular,
  PrecioNoche,
} from "@/types/reserva"
import { ORIGENES, CONTACTOS_PARTICULARES } from "@/types/reserva" // Updated import for ORIGENES
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CalendarIcon, Search, DollarSign, Home, Sparkles, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  isSameDay,
  isBefore,
  endOfDay, // Import endOfDay
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

import ComprobanteProfesional from "./ComprobanteProfesional" // Import ComprobanteProfesional

import DashboardMetrics from "./dashboard-metrics"

// Import auth context and next navigation
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

// Imported new component for tabbed view
import ReservasViewTabs from "./reservas-view-tabs"

const PAISES = [
  { code: "AR", name: "Argentina", currency: "pesos" },
  { code: "UY", name: "Uruguay", currency: "uruguayos" },
  { code: "BR", name: "Brasil", currency: "dolares" },
  { code: "CL", name: "Chile", currency: "dolares" },
  { code: "US", name: "Estados Unidos", currency: "dolares" },
  { code: "ES", name: "España", currency: "dolares" },
  { code: "FR", name: "Francia", currency: "dolares" },
  { code: "OTHER", name: "Otro", currency: "dolares" },
]

const ESTADOS_RESERVA = [
  { value: "activa", label: "Activa", color: "bg-gradient-to-r from-emerald-600 to-teal-600" },
  { value: "confirmada", label: "Confirmada", color: "bg-gradient-to-r from-blue-600 to-indigo-600" },
  { value: "cancelada", label: "Cancelada", color: "bg-gradient-to-r from-red-600 to-pink-600" },
  { value: "no_presentado", label: "No Presentado", color: "bg-gradient-to-r from-orange-600 to-yellow-600" },
  { value: "pagado", label: "Pagada", color: "bg-gradient-to-r from-green-600 to-black-600" },
]

const toValidDate = (dateValue: any): Date => {
  if (!dateValue) return new Date()

  // Si ya es una fecha válida
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue
  }

  // Si es un Timestamp de Firestore
  if (dateValue.toDate && typeof dateValue.toDate === "function") {
    try {
      const converted = dateValue.toDate()
      return isNaN(converted.getTime()) ? new Date() : converted
    } catch (e) {
      console.error("[v0] Error converting Firestore timestamp:", e)
      return new Date()
    }
  }

  // Si es un string o número
  try {
    const converted = new Date(dateValue)
    return isNaN(converted.getTime()) ? new Date() : converted
  } catch (e) {
    console.error("[v0] Error parsing date:", e)
    return new Date()
  }
}

const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0"
  return value.toLocaleString()
}

const getPrecioNocheValue = (reserva: Reserva): number => {
  if (!reserva.precioNoche || typeof reserva.precioNoche !== "object") return 0
  const currency = reserva.moneda || "ARS" // Default to ARS if moneda is not specified
  return reserva.precioNoche[currency] || 0
}

export interface ReservasManagerRef {
  openNewDialog: () => void
}

const ReservasManager = forwardRef<ReservasManagerRef>((props, ref) => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cabins, setCabins] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null)
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null)
  const [deleteReserva, setDeleteReserva] = useState<Reserva | null>(null)

  const [checkinPopoverOpen, setCheckinPopoverOpen] = useState(false)
  const [checkoutPopoverOpen, setCheckoutPopoverOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartamento, setFilterDepartamento] = useState<string>("todos")
  const [filterOrigen, setFilterOrigen] = useState<string>("todos")
  const [filterPais, setFilterPais] = useState<string>("todos")
  const [filterDeposito, setFilterDeposito] = useState<string>("todos")
  const [filterMes, setFilterMes] = useState<Date>(new Date())

  // Renamed filter variables and added search query state
  const [filterFechaDesde, setFilterFechaDesde] = useState<Date | null>(null)
  const [filterFechaHasta, setFilterFechaHasta] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [viewMode, setViewMode] = useState<"tabla" | "timeline" | "grid">("tabla")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const [formData, setFormData] = useState<ReservaFormData>({
    departamento: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    nombre: "",
    pais: "AR",
    numero: "",
    origen: "particular",
    hizoDeposito: false,
    precioNoche: { pesos: 0 },
    precioImpuestos: 0,
    precioGanancia: 0,
    precioTotal: 0,
    moneda: "AR",
    cantidadAdultos: 2,
    cantidadMenores: 0,
    estado: "activa",
  })

  // Add auth and navigation hooks
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const volverPaginaPrincipal = () => {
    router.push("/")
  }

  useEffect(() => {
    loadCabins()
    loadReservas()
  }, [])

  const loadCabins = async () => {
    try {
      const cabinsRef = collection(db, "cabins")
      const snapshot = await getDocs(cabinsRef)
      const cabinsData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name?.es || data.nameEs || `Cabaña ${doc.id}`,
        }
      })
      setCabins(cabinsData)
      if (cabinsData.length > 0 && !formData.departamento) {
        setFormData((prev) => ({ ...prev, departamento: cabinsData[0].name }))
      }
    } catch (error) {
      console.error("Error cargando cabañas:", error)
    }
  }

  const loadReservas = async () => {
    setLoading(true)
    try {
      const reservasRef = collection(db, "reservas")
      const snapshot = await getDocs(reservasRef)

      const reservasData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate() : toValidDate(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate() : toValidDate(data.fechaFin),
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : toValidDate(data.fechaCreacion),
          fechaDeposito: data.fechaDeposito?.toDate ? data.fechaDeposito.toDate() : toValidDate(data.fechaDeposito), // Load fechaDeposito
          estado: data.estado || "activa", // Load estado
        } as Reserva
      })

      reservasData.sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime())
      setReservas(reservasData)
    } catch (error) {
      console.error("Error loading reservas:", error)
      alert("Error al cargar las reservas: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkOverlap = (departamento: Departamento, fechaInicio: Date, fechaFin: Date, excludeId?: string): boolean => {
    return reservas.some((reserva) => {
      if (reserva.id === excludeId) return false
      if (reserva.departamento !== departamento) return false
      if (reserva.estado === "cancelada" || reserva.estado === "no_presentado") return false

      const rStart = (reserva.fechaInicio as Date).getTime()
      const rEnd = (reserva.fechaFin as Date).getTime()
      const newStart = fechaInicio.getTime()
      const newEnd = fechaFin.getTime()

      // Check for overlap: new range starts before existing range ends AND new range ends after existing range starts
      return newStart < rEnd && newEnd > rStart
    })
  }

  const cleanDataForFirestore = (data: any) => {
    const cleaned: any = {}
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        cleaned[key] = data[key]
      }
    })
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.departamento) {
      // numero no es obligatorio
      alert("Por favor completa Nombre y Departamento")
      return
    }

    if (formData.fechaFin <= formData.fechaInicio) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada")
      return
    }

    const hasOverlap = checkOverlap(formData.departamento, formData.fechaInicio, formData.fechaFin, editingReserva?.id)

    if (hasOverlap) {
      alert("Ya existe una reserva para este departamento en las fechas seleccionadas")
      return
    }

    try {
      const reservaData: any = {
        departamento: formData.departamento,
        fechaInicio: Timestamp.fromDate(formData.fechaInicio),
        fechaFin: Timestamp.fromDate(formData.fechaFin),
        nombre: formData.nombre,
        pais: formData.pais,
        numero: formData.numero,
        origen: formData.origen,
        hizoDeposito: formData.hizoDeposito,
        precioNoche: formData.precioNoche,
        precioImpuestos: formData.precioImpuestos,
        precioGanancia: formData.precioGanancia,
        precioTotal: formData.precioTotal,
        moneda: formData.moneda,
        estado: formData.estado || "activa",
        fechaCreacion: editingReserva?.fechaCreacion
          ? Timestamp.fromDate(editingReserva.fechaCreacion as Date)
          : Timestamp.now(),
        cantidadAdultos: formData.cantidadAdultos || 2,
        cantidadMenores: formData.cantidadMenores || 0,
      }

      if (formData.contactoParticular) {
        reservaData.contactoParticular = formData.contactoParticular
      }
      if (formData.montoDeposito !== undefined && formData.montoDeposito !== null) {
        reservaData.montoDeposito = formData.montoDeposito
      }
      if (formData.notas) {
        reservaData.notas = formData.notas
      }
      if (formData.fechaDeposito) {
        reservaData.fechaDeposito = Timestamp.fromDate(formData.fechaDeposito)
      }

      if (editingReserva) {
        await updateDoc(doc(db, "reservas", editingReserva.id!), cleanDataForFirestore(reservaData))
      } else {
        await addDoc(collection(db, "reservas"), cleanDataForFirestore(reservaData))
      }

      setIsDialogOpen(false)
      setEditingReserva(null)
      resetForm()
      loadReservas()
    } catch (error) {
      console.error("Error saving reserva:", error)
      alert("Error al guardar la reserva: " + (error as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!deleteReserva?.id) return

    try {
      await deleteDoc(doc(db, "reservas", deleteReserva.id))
      setDeleteReserva(null)
      loadReservas()
    } catch (error) {
      console.error("Error deleting reserva:", error)
      alert("Error al eliminar la reserva")
    }
  }

  const resetForm = () => {
    setFormData({
      departamento: cabins[0]?.name || "",
      fechaInicio: new Date(),
      fechaFin: new Date(),
      nombre: "",
      pais: "AR",
      numero: "",
      origen: "particular",
      hizoDeposito: false,
      precioNoche: { pesos: 0 },
      precioImpuestos: 0,
      precioGanancia: 0,
      precioTotal: 0,
      moneda: "AR", // Reset to default currency
      cantidadAdultos: 2,
      cantidadMenores: 0,
      montoDeposito: 0,
      fechaDeposito: undefined,
      estado: "activa",
    })
  }

  const openEditDialog = (reserva: Reserva) => {
    setEditingReserva(reserva)
    setFormData({
      departamento: reserva.departamento,
      fechaInicio: reserva.fechaInicio as Date,
      fechaFin: reserva.fechaFin as Date,
      nombre: reserva.nombre,
      pais: reserva.pais,
      numero: reserva.numero,
      origen: reserva.origen,
      contactoParticular: reserva.contactoParticular,
      hizoDeposito: reserva.hizoDeposito,
      montoDeposito: reserva.montoDeposito,
      precioNoche: reserva.precioNoche || { pesos: 0 }, // Ensure it's an object
      precioImpuestos: reserva.precioImpuestos,
      precioGanancia: reserva.precioGanancia,
      precioTotal: reserva.precioTotal,
      notas: reserva.notas,
      moneda: reserva.moneda || "AR", // Ensure moneda is set
      cantidadAdultos: reserva.cantidadAdultos || 2,
      cantidadMenores: reserva.cantidadMenores || 0,
      fechaDeposito: reserva.fechaDeposito ? toValidDate(reserva.fechaDeposito) : undefined,
      estado: reserva.estado || "activa",
    })
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingReserva(null)
    resetForm()
    setIsDialogOpen(true)
  }

  useImperativeHandle(ref, () => ({
    openNewDialog,
  }))

  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCurrency = (pais: string, origen: OrigenReserva): string => {
    if (origen === "booking" || origen === "airbnb") return "dolares"
    const paisData = PAISES.find((p) => p.code === pais)
    return paisData?.currency || "dolares"
  }

  const needsPaymentAlert = (reserva: Reserva): boolean => {
    const today = startOfDay(new Date())
    const fechaSalida = reserva.fechaFin as Date
    return !reserva.hizoDeposito && isBefore(fechaSalida, today)
  }

  const getTodayReservations = () => {
    const today = startOfDay(new Date())
    const checkIns = reservas.filter((r) => isSameDay(r.fechaInicio as Date, today))
    const checkOuts = reservas.filter((r) => isSameDay(r.fechaFin as Date, today))
    return { checkIns, checkOuts }
  }

  const { checkIns, checkOuts } = getTodayReservations()

  const filteredReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      const matchesSearch =
        !searchQuery ||
        (reserva.nombre && reserva.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reserva.numero && reserva.numero.includes(searchQuery))

      const matchesDepartamento = filterDepartamento === "todos" || reserva.departamento === filterDepartamento
      const matchesOrigen = filterOrigen === "todos" || reserva.origen === filterOrigen
      const matchesPais = filterPais === "todos" || reserva.pais === filterPais

      let matchesDeposito = true
      if (filterDeposito === "si") {
        matchesDeposito = reserva.hizoDeposito
      } else if (filterDeposito === "no") {
        matchesDeposito = !reserva.hizoDeposito
      }

      let matchesCheckinDesde = true
      if (filterFechaDesde) {
        matchesCheckinDesde = (reserva.fechaInicio as Date) >= startOfDay(filterFechaDesde)
      }

      let matchesCheckinHasta = true
      if (filterFechaHasta) {
        matchesCheckinHasta = (reserva.fechaInicio as Date) <= endOfDay(filterFechaHasta)
      }

      const filterMonthStart = startOfMonth(filterMes)
      const filterMonthEnd = endOfMonth(filterMes)
      const reservaInicio = reserva.fechaInicio as Date
      const reservaFin = reserva.fechaFin as Date
      // Una reserva debe aparecer si alguno de sus días cae dentro del mes seleccionado
      const matchesMes = reservaInicio <= filterMonthEnd && reservaFin > filterMonthStart

      return (
        matchesSearch &&
        matchesDepartamento &&
        matchesOrigen &&
        matchesPais &&
        matchesDeposito &&
        matchesCheckinDesde &&
        matchesCheckinHasta &&
        matchesMes
      )
    })
  }, [
    reservas,
    searchQuery,
    filterDepartamento,
    filterOrigen,
    filterPais,
    filterDeposito,
    filterFechaDesde,
    filterFechaHasta,
    filterMes,
  ])

  const paginatedReservas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredReservas.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredReservas, currentPage])

  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage)

  const getOrigenColor = (origen: OrigenReserva) => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterDepartamento("todos")
    setFilterOrigen("todos")
    setFilterPais("todos")
    setFilterDeposito("todos")
    setFilterFechaDesde(null)
    setFilterFechaHasta(null)
    setFilterMes(new Date())
    setSearchQuery("")
  }

  const hasActiveFilters =
    searchQuery ||
    filterDepartamento !== "todos" ||
    filterOrigen !== "todos" ||
    filterPais !== "todos" ||
    filterDeposito !== "todos" ||
    filterFechaDesde ||
    filterFechaHasta

  const stats = useMemo(() => {
    const reservasActivas = filteredReservas.filter((r) => r.estado !== "cancelada" && r.estado !== "no_presentado")
    const totalReservas = filteredReservas.length
    const totalIngresos = reservasActivas.reduce((sum, r) => sum + (r.precioTotal || 0), 0)
    const reservasPorDepartamento = cabins.map((cabin) => ({
      dept: cabin.name,
      count: filteredReservas.filter((r) => r.departamento === cabin.name).length,
    }))
    const startOfSelectedMonth = startOfMonth(filterMes)
    const endOfSelectedMonth = endOfMonth(filterMes)
    const daysInSelectedMonth =
      Math.ceil((endOfSelectedMonth.getTime() - startOfSelectedMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const totalDiasPotenciales = cabins.length * daysInSelectedMonth
    const diasOcupados = reservasActivas.reduce((sum, r) => {
      const reservaStart = startOfDay(r.fechaInicio as Date)
      const reservaEnd = endOfDay(r.fechaFin as Date) // Corrected this line

      // Clip reservation days to the selected month
      const effectiveStart = reservaStart < startOfSelectedMonth ? startOfSelectedMonth : reservaStart
      const effectiveEnd = reservaEnd > endOfSelectedMonth ? endOfSelectedMonth : reservaEnd

      if (effectiveStart >= effectiveEnd) return sum

      const nights = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)

    const ocupacionTotal = totalDiasPotenciales > 0 ? ((diasOcupados / totalDiasPotenciales) * 100).toFixed(1) : "0.0"

    return { totalReservas, totalIngresos, reservasPorDepartamento, ocupacionTotal }
  }, [filteredReservas, cabins, filterMes])

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  // Departamentos alquilados hoy (activos ahora)
  const departamentosAlquiladosHoy = reservas.filter((r) => {
    return r.fechaInicio <= now && r.fechaFin >= today
  }).length

  // Próximos check-ins (hoy)
  const proximosCheckIns = reservas.filter((r) => {
    return r.fechaInicio >= today && r.fechaInicio < tomorrow
  }).length

  // Próximos check-outs (hoy)
  const proximosCheckOuts = reservas.filter((r) => {
    return r.fechaFin >= today && r.fechaFin < tomorrow
  }).length

  // Reservas confirmadas futuras
  const reservasPendientes = reservas.filter((r) => {
    return r.fechaInicio > now
  }).length

  // Ingresos del mes actual
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const ingresosDelMes = reservas
    .filter((r) => {
      if (r.estado === "cancelada" || r.estado === "no_presentado") return false
      const fecha = r.fechaInicio
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear
    })
    .reduce((sum, r) => sum + (r.precioTotal || 0), 0)

  // Ocupación actual (hoy)
  const totalDepartamentos = cabins.length
  const ocupacionHoy = totalDepartamentos > 0 ? Math.round((departamentosAlquiladosHoy / totalDepartamentos) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-semibold text-emerald-900">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <DashboardMetrics
        departamentosAlquiladosHoy={departamentosAlquiladosHoy}
        ocupacionHoy={ocupacionHoy}
        proximosCheckIns={proximosCheckIns}
        proximosCheckOuts={proximosCheckOuts}
        reservasPendientes={reservasPendientes}
        ingresosDelMes={ingresosDelMes}
        totalReservas={stats.totalReservas}
        totalIngresos={stats.totalIngresos}
        ocupacionTotal={stats.ocupacionTotal}
        filterMes={filterMes}
        now={now}
        formatCurrency={formatCurrency}
      />

      {/* Check-ins/Check-outs Today Card */}
      {(checkIns.length > 0 || checkOuts.length > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">
                Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Check-ins ({checkIns.length})</h4>
                </div>
                <div className="space-y-2">
                  {checkIns.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay check-ins hoy</p>
                  ) : (
                    checkIns.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{reserva.nombre}</p>
                          <p className="text-xs text-gray-600">{reserva.departamento}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!reserva.hizoDeposito && (
                            <AlertTriangle className="h-4 w-4 text-red-500" title="Sin depósito" />
                          )}
                          <Badge className={cn("text-white text-xs", getOrigenColor(reserva.origen))}>
                            {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Check-outs ({checkOuts.length})</h4>
                </div>
                <div className="space-y-2">
                  {checkOuts.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay check-outs hoy</p>
                  ) : (
                    checkOuts.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{reserva.nombre}</p>
                          <p className="text-xs text-gray-600">{reserva.departamento}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!reserva.hizoDeposito && (
                            <AlertTriangle className="h-4 w-4 text-red-500" title="Sin depósito" />
                          )}
                          <Badge className={cn("text-white text-xs", getOrigenColor(reserva.origen))}>
                            {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop/Tablet Header */}
      <div className="hidden md:flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reservas</h2>
          <p className="text-muted-foreground">Gestiona todas las reservas del hotel</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openNewDialog}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="md:hidden flex justify-end mb-4">
        <Button
          onClick={openNewDialog}
          size="sm"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 relative bg-transparent">
              <Search className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filtros de Búsqueda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Mes */}
              <div className="space-y-2">
                <Label htmlFor="filterMes" className="text-emerald-900 font-semibold text-sm">
                  Mes
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      {format(filterMes, "MMMM yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterMes}
                      onSelect={(date) => date && setFilterMes(date)}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Departamento */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Departamento</Label>
                <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {cabins.map((cabin) => (
                      <SelectItem key={cabin.id} value={cabin.name}>
                        {cabin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Origen */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Origen</Label>
                <Select value={filterOrigen} onValueChange={setFilterOrigen}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {ORIGENES.map((origen) => (
                      <SelectItem key={origen.value} value={origen.value}>
                        {origen.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* País */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">País</Label>
                <Select value={filterPais} onValueChange={setFilterPais}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {PAISES.map((pais) => (
                      <SelectItem key={pais.code} value={pais.code}>
                        {pais.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Depósito */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Depósito</Label>
                <Select value={filterDeposito} onValueChange={setFilterDeposito}>
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="si">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in desde */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Check-in desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      {filterFechaDesde ? format(filterFechaDesde, "dd/MM/yyyy") : "Seleccionar..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterFechaDesde || undefined}
                      onSelect={(date) => setFilterFechaDesde(date || null)}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-in hasta */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Check-in hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      {filterFechaHasta ? format(filterFechaHasta, "dd/MM/yyyy") : "Seleccionar..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterFechaHasta || undefined}
                      onSelect={(date) => setFilterFechaHasta(date || null)}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Buscar */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nombre o teléfono..."
                    className="pl-9 border-emerald-200"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-emerald-200 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mes */}
          <div className="space-y-2">
            <Label htmlFor="filterMes" className="text-emerald-900 font-semibold text-sm">
              Mes
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                  {format(filterMes, "MMMM yyyy", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterMes}
                  onSelect={(date) => date && setFilterMes(date)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">Departamento</Label>
            <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {cabins.map((cabin) => (
                  <SelectItem key={cabin.id} value={cabin.name}>
                    {cabin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origen */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">Origen</Label>
            <Select value={filterOrigen} onValueChange={setFilterOrigen}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ORIGENES.map((origen) => (
                  <SelectItem key={origen.value} value={origen.value}>
                    {origen.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* País */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">País</Label>
            <Select value={filterPais} onValueChange={setFilterPais}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {PAISES.map((pais) => (
                  <SelectItem key={pais.code} value={pais.code}>
                    {pais.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Depósito */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">Depósito</Label>
            <Select value={filterDeposito} onValueChange={setFilterDeposito}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="si">Sí</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Check-in desde */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">Check-in desde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                  {filterFechaDesde ? format(filterFechaDesde, "dd/MM/yyyy") : "Seleccionar..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFechaDesde || undefined}
                  onSelect={(date) => setFilterFechaDesde(date || null)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-in hasta */}
          <div className="space-y-2">
            <Label className="text-emerald-900 font-semibold text-sm">Check-in hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                  {filterFechaHasta ? format(filterFechaHasta, "dd/MM/yyyy") : "Seleccionar..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFechaHasta || undefined}
                  onSelect={(date) => setFilterFechaHasta(date || null)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Buscar */}
          <div className="space-y-2 lg:col-span-1">
            <Label className="text-emerald-900 font-semibold text-sm">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o teléfono..."
                className="pl-9 border-emerald-200"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      <ReservasViewTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filteredReservas={filteredReservas}
        cabins={cabins}
        filterMes={filterMes}
        setViewingReserva={setViewingReserva}
        openEditDialog={openEditDialog}
        setDeleteReserva={setDeleteReserva}
        filterDepartamento={filterDepartamento}
        setFilterDepartamento={setFilterDepartamento}
        filterOrigen={filterOrigen}
        setFilterOrigen={setFilterOrigen}
        filterDeposito={filterDeposito}
        setFilterDeposito={setFilterDeposito}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setFilterMes={setFilterMes}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      />

      {/* Dialog for creating/editing reservation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              {editingReserva
                ? "Modifica los datos de la reserva existente"
                : "Completa los datos para crear una nueva reserva"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Departamento y Fechas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-emerald-100 shadow-sm">
              <h3 className="font-semibold text-base md:text-lg text-emerald-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
                Fechas y Ubicación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento" className="text-emerald-900 font-semibold text-sm">
                    Departamento *
                  </Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) => setFormData({ ...formData, departamento: value })}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cabins.map((cabin) => (
                        <SelectItem key={cabin.id} value={cabin.name}>
                          {cabin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de Entrada */}
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold text-sm">Fecha de Entrada *</Label>
                  <Popover open={checkinPopoverOpen} onOpenChange={setCheckinPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent text-sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaInicio ? format(formData.fechaInicio, "dd/MM/yyyy") : "Selecciona"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fechaInicio}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, fechaInicio: date })
                            setCheckinPopoverOpen(false)
                          }
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha de Salida */}
                <div className="space-y-2">
                  <Label className="text-emerald-900 font-semibold text-sm">Fecha de Salida *</Label>
                  <Popover open={checkoutPopoverOpen} onOpenChange={setCheckoutPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent text-sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaFin ? format(formData.fechaFin, "dd/MM/yyyy") : "Selecciona"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fechaFin}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, fechaFin: date })
                            setCheckoutPopoverOpen(false)
                          }
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-600 font-semibold text-sm">Noches</Label>
                  <div className="flex items-center h-10 px-4 border-2 border-emerald-300 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                    <span className="text-lg md:text-xl font-bold text-emerald-700">
                      {calculateNights(formData.fechaInicio, formData.fechaFin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-blue-100 shadow-sm">
              <h3 className="font-semibold text-base md:text-lg text-blue-900 mb-4">Datos del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nombre" className="text-blue-900 font-semibold text-sm">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais" className="text-blue-900 font-semibold text-sm">
                    País *
                  </Label>
                  <Select value={formData.pais} onValueChange={(value) => setFormData({ ...formData, pais: value })}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAISES.map((pais) => (
                        <SelectItem key={pais.code} value={pais.code}>
                          {pais.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-blue-900 font-semibold text-sm">
                    Teléfono
                  </Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="+54 11 1234-5678"
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidadAdultos" className="text-blue-900 font-semibold text-sm">
                    Cantidad de Adultos
                  </Label>
                  <Input
                    id="cantidadAdultos"
                    type="number"
                    value={formData.cantidadAdultos || 0}
                    onChange={(e) => setFormData({ ...formData, cantidadAdultos: Number(e.target.value) })}
                    placeholder="0"
                    className="border-blue-200 focus:border-blue-400"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidadMenores" className="text-blue-900 font-semibold text-sm">
                    Cantidad de Menores
                  </Label>
                  <Input
                    id="cantidadMenores"
                    type="number"
                    value={formData.cantidadMenores || 0}
                    onChange={(e) => setFormData({ ...formData, cantidadMenores: Number(e.target.value) })}
                    placeholder="0"
                    className="border-blue-200 focus:border-blue-400"
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Origen de la Reserva */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-purple-100 shadow-sm">
              <h3 className="font-semibold text-base md:text-lg text-purple-900 mb-4">Origen de la Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origen" className="text-purple-900 font-semibold text-sm">
                    Origen *
                  </Label>
                  <Select
                    value={formData.origen}
                    onValueChange={(value: OrigenReserva) => setFormData({ ...formData, origen: value })}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGENES.map((origen) => (
                        <SelectItem key={origen.value} value={origen.value}>
                          {origen.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.origen === "particular" && (
                  <div className="space-y-2">
                    <Label htmlFor="contactoParticular" className="text-purple-900 font-semibold text-sm">
                      Contacto
                    </Label>
                    <Select
                      value={formData.contactoParticular || ""}
                      onValueChange={(value: ContactoParticular) =>
                        setFormData({ ...formData, contactoParticular: value })
                      }
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACTOS_PARTICULARES.map((contacto) => (
                          <SelectItem key={contacto} value={contacto}>
                            {contacto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-green-100 shadow-sm">
              <h3 className="font-semibold text-base md:text-lg text-green-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                Precios y Pagos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currency Selector */}
                <div className="space-y-2">
                  <Label htmlFor="moneda" className="text-green-900 font-semibold text-sm">
                    Moneda
                  </Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value: string) => {
                      const currentPrecioNoche = formData.precioNoche || { pesos: 0 }
                      const existingValue = currentPrecioNoche[value as keyof PrecioNoche] || 0
                      setFormData({
                        ...formData,
                        moneda: value,
                        precioNoche: { ...currentPrecioNoche, [value]: existingValue }, // Keep existing value if available for the new currency, otherwise 0
                      })
                    }}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAISES.map((pais) => (
                        <SelectItem key={pais.code} value={pais.code}>
                          {pais.name} ({pais.currency})
                        </SelectItem>
                      ))}
                      {/* Add any other relevant currencies if needed */}
                      <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioNoche" className="text-green-900 font-semibold text-sm">
                    Precio por Noche ({formData.moneda})
                  </Label>
                  <Input
                    id="precioNoche"
                    type="number"
                    value={formData.precioNoche[formData.moneda as keyof PrecioNoche] || 0}
                    onChange={(e) => {
                      const currentCurrency = formData.moneda as keyof PrecioNoche
                      const newPrecioNocheValue = Number(e.target.value)
                      setFormData({
                        ...formData,
                        precioNoche: { ...formData.precioNoche, [currentCurrency]: newPrecioNocheValue },
                        // Optionally update precioTotal automatically if it's 0 or based on nights
                        precioTotal:
                          formData.precioTotal === 0
                            ? newPrecioNocheValue * calculateNights(formData.fechaInicio, formData.fechaFin)
                            : formData.precioTotal,
                      })
                    }}
                    placeholder="0"
                    className="border-green-200 focus:border-green-400"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioTotal" className="text-green-900 font-semibold text-sm">
                    Precio Total *
                  </Label>
                  <Input
                    id="precioTotal"
                    type="number"
                    value={formData.precioTotal}
                    onChange={(e) => setFormData({ ...formData, precioTotal: Number(e.target.value) })}
                    placeholder="0"
                    required
                    className="border-green-200 focus:border-green-400"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioImpuestos" className="text-green-900 font-semibold text-sm">
                    Impuestos
                  </Label>
                  <Input
                    id="precioImpuestos"
                    type="number"
                    value={formData.precioImpuestos}
                    onChange={(e) => setFormData({ ...formData, precioImpuestos: Number(e.target.value) })}
                    placeholder="0"
                    className="border-green-200 focus:border-green-400"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioGanancia" className="text-green-900 font-semibold text-sm">
                    Ganancia
                  </Label>
                  <Input
                    id="precioGanancia"
                    type="number"
                    value={formData.precioGanancia}
                    onChange={(e) => setFormData({ ...formData, precioGanancia: Number(e.target.value) })}
                    placeholder="0"
                    className="border-green-200 focus:border-green-400"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 mt-4 border-t border-green-100">
                <Checkbox
                  id="hizoDeposito"
                  checked={formData.hizoDeposito}
                  onCheckedChange={(checked) => setFormData({ ...formData, hizoDeposito: checked as boolean })}
                  className="border-green-300"
                />
                <Label htmlFor="hizoDeposito" className="font-semibold cursor-pointer text-green-900 text-sm">
                  ¿Hizo depósito?
                </Label>
              </div>

              {formData.hizoDeposito && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="montoDeposito" className="text-green-900 font-semibold text-sm">
                      Monto del Depósito
                    </Label>
                    <Input
                      id="montoDeposito"
                      type="number"
                      value={formData.montoDeposito || 0}
                      onChange={(e) => setFormData({ ...formData, montoDeposito: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                      min={0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-900 font-semibold text-sm">Fecha del Depósito</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-green-200 hover:bg-green-50 bg-white text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                          {formData.fechaDeposito ? format(formData.fechaDeposito, "dd/MM/yyyy") : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaDeposito}
                          onSelect={(date) => date && setFormData({ ...formData, fechaDeposito: date })}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
              <Label htmlFor="notas" className="text-gray-900 font-semibold text-sm md:text-base">
                Notas
              </Label>
              <Textarea
                id="notas"
                value={formData.notas || ""}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Información adicional sobre la reserva..."
                rows={3}
                className="mt-2 border-gray-300 focus:border-gray-400"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-amber-200 shadow-sm">
              <h3 className="font-semibold text-base md:text-lg text-amber-900 mb-4">Estado de la Reserva</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ESTADOS_RESERVA.map((estado) => (
                  <button
                    key={estado.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: estado.value })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                      formData.estado === estado.value
                        ? `${estado.color} text-Black border-green shadow-md`
                        : "bg-white-100 border-gray-200 text-gray-700 hover:border-amber-300",
                    )}
                  >
                    {estado.label}
                  </button>
                ))}
              </div>
              {(formData.estado === "cancelada" || formData.estado === "no_presentado") && (
                <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                  Esta reserva aparecerá en la sección de "Canceladas / No presentados" del cronograma.
                </p>
              )}
              {formData.estado === "pagado" && (
                <p className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded">
                  El comprobante mostrará que esta reserva está PAGADA.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-green-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
              >
                {editingReserva ? "Guardar Cambios" : "Crear Reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing reservation details */}
      {viewingReserva && (
        <Dialog open={!!viewingReserva} onOpenChange={() => setViewingReserva(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sr-only">Detalles de la Reserva</DialogTitle>
            </DialogHeader>
            <ComprobanteProfesional
              reserva={viewingReserva}
              onClose={() => setViewingReserva(null)}
              onEdit={() => {
                const reservaToEdit = viewingReserva
                setViewingReserva(null)
                openEditDialog(reservaToEdit)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      {/* Dialog for deleting reservation */}
      <AlertDialog open={!!deleteReserva} onOpenChange={() => setDeleteReserva(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl md:text-2xl text-red-700">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm md:text-base text-gray-600">
              Esta acción no se puede deshacer. Se eliminará permanentemente la reserva de{" "}
              <span className="font-semibold text-gray-900">{deleteReserva?.nombre}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-gray-300 w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-full sm:w-auto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})

ReservasManager.displayName = "ReservasManager"

export default ReservasManager
