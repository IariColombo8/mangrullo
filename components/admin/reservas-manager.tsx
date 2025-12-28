"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Plus,
  CalendarIcon,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Reserva,
  ReservaFormData,
  Departamento,
  OrigenReserva,
  ContactoParticular,
  PrecioNoche,
} from "@/types/reserva"
import { ORIGENES, CONTACTOS_PARTICULARES } from "@/types/reserva"

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

export default function ReservasManager() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cabins, setCabins] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null)
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null)
  const [deleteReserva, setDeleteReserva] = useState<Reserva | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartamento, setFilterDepartamento] = useState<string>("todos")
  const [filterOrigen, setFilterOrigen] = useState<string>("todos")
  const [filterMes, setFilterMes] = useState<Date>(new Date())

  // View mode
  const [viewMode, setViewMode] = useState<"tabla" | "timeline" | "grid">("tabla")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Form state
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
  })

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
      console.log("[v0] Cargando reservas...")
      const reservasRef = collection(db, "reservas")
      const snapshot = await getDocs(reservasRef)

      console.log("[v0] Documentos encontrados:", snapshot.size)

      const reservasData = snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("[v0] Documento:", doc.id, data)
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate() : new Date(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate() : new Date(data.fechaFin),
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(),
        } as Reserva
      })

      reservasData.sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime())

      console.log("[v0] Reservas procesadas:", reservasData.length)
      setReservas(reservasData)
    } catch (error) {
      console.error("[v0] Error loading reservas:", error)
      alert("Error al cargar las reservas: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkOverlap = (departamento: Departamento, fechaInicio: Date, fechaFin: Date, excludeId?: string): boolean => {
    return reservas.some((reserva) => {
      if (reserva.id === excludeId) return false
      if (reserva.departamento !== departamento) return false

      const rStart = (reserva.fechaInicio as Date).getTime()
      const rEnd = (reserva.fechaFin as Date).getTime()
      const newStart = fechaInicio.getTime()
      const newEnd = fechaFin.getTime()

      return newStart < rEnd && newEnd > rStart
    })
  }

  // FUNCIÓN CORREGIDA: Limpia valores undefined antes de guardar en Firestore
  const cleanDataForFirestore = (data: any) => {
    const cleaned: any = {}
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        cleaned[key] = data[key]
      }
    })
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.numero || !formData.departamento) {
      alert("Por favor completa todos los campos obligatorios")
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
      const reservaData = {
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
        fechaCreacion: editingReserva?.fechaCreacion
          ? Timestamp.fromDate(editingReserva.fechaCreacion as Date)
          : Timestamp.now(),
      }

      // Solo agregar campos opcionales si tienen valor
      if (formData.contactoParticular) {
        (reservaData as any).contactoParticular = formData.contactoParticular
      }
      if (formData.montoDeposito !== undefined && formData.montoDeposito !== null) {
        (reservaData as any).montoDeposito = formData.montoDeposito
      }
      if (formData.notas) {
        (reservaData as any).notas = formData.notas
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
      precioNoche: reserva.precioNoche,
      precioImpuestos: reserva.precioImpuestos,
      precioGanancia: reserva.precioGanancia,
      precioTotal: reserva.precioTotal,
      notas: reserva.notas,
    })
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingReserva(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCurrency = (pais: string, origen: OrigenReserva): string => {
    if (origen === "booking" || origen === "airbnb") return "dolares"
    const paisData = PAISES.find((p) => p.code === pais)
    return paisData?.currency || "dolares"
  }

  const filteredReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      const matchesSearch =
        !searchTerm ||
        (reserva.nombre && reserva.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reserva.numero && reserva.numero.includes(searchTerm))

      const matchesDepartamento = filterDepartamento === "todos" || reserva.departamento === filterDepartamento
      const matchesOrigen = filterOrigen === "todos" || reserva.origen === filterOrigen

      const reservaMonth = (reserva.fechaInicio as Date).getMonth()
      const reservaYear = (reserva.fechaInicio as Date).getFullYear()
      const filterMonth = filterMes.getMonth()
      const filterYear = filterMes.getFullYear()
      const matchesMes = reservaMonth === filterMonth && reservaYear === filterYear

      return matchesSearch && matchesDepartamento && matchesOrigen && matchesMes
    })
  }, [reservas, searchTerm, filterDepartamento, filterOrigen, filterMes])

  const paginatedReservas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredReservas.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredReservas, currentPage])

  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage)

  const getOrigenColor = (origen: OrigenReserva) => {
    return ORIGENES.find((o) => o.value === origen)?.color || "bg-gray-500"
  }

  const stats = useMemo(() => {
    const totalReservas = filteredReservas.length
    const totalIngresos = filteredReservas.reduce((sum, r) => sum + r.precioTotal, 0)
    const reservasPorDepartamento = cabins.map((cabin) => ({
      dept: cabin.name,
      count: filteredReservas.filter((r) => r.departamento === cabin.name).length,
    }))
    const totalDias = cabins.length * 30
    const diasOcupados = filteredReservas.reduce(
      (sum, r) => sum + calculateNights(r.fechaInicio as Date, r.fechaFin as Date),
      0,
    )
    const ocupacionTotal = totalDias > 0 ? ((diasOcupados / totalDias) * 100).toFixed(1) : "0.0"

    return { totalReservas, totalIngresos, reservasPorDepartamento, ocupacionTotal }
  }, [filteredReservas, cabins])

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header mejorado */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-emerald-100">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Reservas - El Mangrullo
            </h2>
            <p className="text-gray-600">Gestiona todas las reservas de los departamentos</p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>

        {/* Filters mejorados */}
        <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">Mes</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-white hover:bg-emerald-50 border-emerald-200">
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      {format(filterMes, "MMMM yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={() => setFilterMes(subMonths(filterMes, 1))}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-emerald-900">{format(filterMes, "MMMM yyyy", { locale: es })}</span>
                        <Button variant="outline" size="icon" onClick={() => setFilterMes(addMonths(filterMes, 1))}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                        onClick={() => setFilterMes(new Date())}
                      >
                        Mes actual
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">Departamento</Label>
                <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                  <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
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

              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">Origen</Label>
                <Select value={filterOrigen} onValueChange={setFilterOrigen}>
                  <SelectTrigger className="bg-white border-emerald-200 hover:bg-emerald-50">
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

              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    placeholder="Nombre o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-blue-100">Total Reservas</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalReservas}</p>
                  <p className="text-xs text-blue-100 mt-1">del mes seleccionado</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-green-100">Ingresos</p>
                  <p className="text-3xl font-bold mt-2">${stats.totalIngresos.toLocaleString()}</p>
                  <p className="text-xs text-green-100 mt-1">{format(filterMes, "MMMM yyyy", { locale: es })}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-purple-100">Ocupación</p>
                  <p className="text-4xl font-bold mt-2">{stats.ocupacionTotal}%</p>
                  <p className="text-xs text-purple-100 mt-1">del mes</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium text-orange-100">Departamentos</p>
                  <p className="text-4xl font-bold mt-2">{cabins.length}</p>
                  <p className="text-xs text-orange-100 mt-1">totales activos</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Home className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Tabs mejorados */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/80 backdrop-blur-sm border border-emerald-200">
            <TabsTrigger value="tabla" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">Tabla</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">Timeline</TabsTrigger>
            <TabsTrigger value="grid" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">Grid</TabsTrigger>
          </TabsList>

          <TabsContent value="tabla" className="space-y-4">
            <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                        <TableHead className="font-bold text-emerald-900">Departamento</TableHead>
                        <TableHead className="font-bold text-emerald-900">Check-in</TableHead>
                        <TableHead className="font-bold text-emerald-900">Check-out</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Noches</TableHead>
                        <TableHead className="font-bold text-emerald-900">Nombre</TableHead>
                        <TableHead className="font-bold text-emerald-900">País</TableHead>
                        <TableHead className="font-bold text-emerald-900">Teléfono</TableHead>
                        <TableHead className="font-bold text-emerald-900">Origen</TableHead>
                        <TableHead className="font-bold text-emerald-900">Contacto</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Depósito</TableHead>
                        <TableHead className="text-right font-bold text-emerald-900">$ Noche</TableHead>
                        <TableHead className="text-right font-bold text-emerald-900">$ Total</TableHead>
                        <TableHead className="text-center font-bold text-emerald-900">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReservas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                              <CalendarIcon className="h-12 w-12 text-gray-300" />
                              <p className="text-lg font-medium">No se encontraron reservas</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedReservas.map((reserva) => {
                          const nights = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
                          const currency = getCurrency(reserva.pais, reserva.origen)
                          const precioNoche = reserva.precioNoche[currency as keyof PrecioNoche] || 0

                          return (
                            <TableRow key={reserva.id} className="hover:bg-emerald-50/50 transition-colors duration-150 border-b border-emerald-100">
                              <TableCell>
                                <Badge variant="outline" className="font-medium border-emerald-300 text-emerald-700 bg-emerald-50">
                                  {reserva.departamento}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-700">
                                {format(reserva.fechaInicio as Date, "dd/MM/yy")}
                              </TableCell>
                              <TableCell className="font-medium text-gray-700">
                                {format(reserva.fechaFin as Date, "dd/MM/yy")}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">{nights}</Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">{reserva.nombre}</TableCell>
                              <TableCell className="text-gray-600">{PAISES.find((p) => p.code === reserva.pais)?.name || reserva.pais}</TableCell>
                              <TableCell className="font-mono text-sm text-gray-700">{reserva.numero}</TableCell>
                              <TableCell>
                                <Badge className={cn("text-white font-medium shadow-sm", getOrigenColor(reserva.origen))}>
                                  {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {reserva.origen === "particular" && reserva.contactoParticular
                                  ? reserva.contactoParticular
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {reserva.hizoDeposito ? (
                                  <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                                    Sí
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">No</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-gray-700">${precioNoche}</TableCell>
                              <TableCell className="text-right font-bold text-emerald-600 text-lg">
                                ${reserva.precioTotal.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewingReserva(reserva)}
                                    title="Ver detalles"
                                    className="hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(reserva)}
                                    title="Editar"
                                    className="hover:bg-emerald-50 hover:text-emerald-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteReserva(reserva)}
                                    title="Eliminar"
                                    className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="text-sm text-gray-600 font-medium">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, filteredReservas.length)} de {filteredReservas.length}{" "}
                      reservas
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-emerald-300 hover:bg-emerald-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-semibold text-emerald-900 px-3">
                        Página {currentPage} de {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-emerald-300 hover:bg-emerald-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView reservas={filteredReservas} mes={filterMes} cabins={cabins} />
          </TabsContent>

          <TabsContent value="grid">
            <GridView reservas={filteredReservas} mes={filterMes} cabins={cabins} />
          </TabsContent>
        </Tabs>

        {/* Dialog para crear/editar reserva - MEJORADO */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingReserva
                  ? "Modifica los datos de la reserva existente"
                  : "Completa los datos para crear una nueva reserva"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Departamento y Fechas */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-emerald-100 shadow-sm">
                <h3 className="font-semibold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Fechas y Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento" className="text-emerald-900 font-semibold">Departamento *</Label>
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

                  <div className="space-y-2">
                    <Label className="text-emerald-900 font-semibold">Fecha de Entrada *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-white">
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                          {format(formData.fechaInicio, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaInicio}
                          onSelect={(date) => date && setFormData({ ...formData, fechaInicio: date })}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-900 font-semibold">Fecha de Salida *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-white">
                          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                          {format(formData.fechaFin, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaFin}
                          onSelect={(date) => date && setFormData({ ...formData, fechaFin: date })}
                          locale={es}
                          disabled={(date) => date <= formData.fechaInicio}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Noches</Label>
                    <div className="flex items-center h-10 px-4 border-2 border-emerald-300 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                      <span className="text-xl font-bold text-emerald-700">
                        {calculateNights(formData.fechaInicio, formData.fechaFin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-sm">
                <h3 className="font-semibold text-lg text-blue-900 mb-4">Datos del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre" className="text-blue-900 font-semibold">Nombre Completo *</Label>
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
                    <Label htmlFor="pais" className="text-blue-900 font-semibold">País *</Label>
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
                    <Label htmlFor="numero" className="text-blue-900 font-semibold">Teléfono *</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Origen de la Reserva */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-purple-100 shadow-sm">
                <h3 className="font-semibold text-lg text-purple-900 mb-4">Origen de la Reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origen" className="text-purple-900 font-semibold">Origen *</Label>
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
                      <Label htmlFor="contacto" className="text-purple-900 font-semibold">Contacto</Label>
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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-green-100 shadow-sm">
                <h3 className="font-semibold text-lg text-green-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precios y Pagos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precioNoche" className="text-green-900 font-semibold">Precio por Noche</Label>
                    <Input
                      id="precioNoche"
                      type="number"
                      value={formData.precioNoche[getCurrency(formData.pais, formData.origen) as keyof PrecioNoche] || 0}
                      onChange={(e) => {
                        const currency = getCurrency(formData.pais, formData.origen) as keyof PrecioNoche
                        setFormData({
                          ...formData,
                          precioNoche: { ...formData.precioNoche, [currency]: Number(e.target.value) },
                        })
                      }}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioTotal" className="text-green-900 font-semibold">Precio Total *</Label>
                    <Input
                      id="precioTotal"
                      type="number"
                      value={formData.precioTotal}
                      onChange={(e) => setFormData({ ...formData, precioTotal: Number(e.target.value) })}
                      placeholder="0"
                      required
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioImpuestos" className="text-green-900 font-semibold">Impuestos</Label>
                    <Input
                      id="precioImpuestos"
                      type="number"
                      value={formData.precioImpuestos}
                      onChange={(e) => setFormData({ ...formData, precioImpuestos: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioGanancia" className="text-green-900 font-semibold">Ganancia</Label>
                    <Input
                      id="precioGanancia"
                      type="number"
                      value={formData.precioGanancia}
                      onChange={(e) => setFormData({ ...formData, precioGanancia: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 mt-4 border-t border-green-100">
                  <Checkbox
                    id="deposito"
                    checked={formData.hizoDeposito}
                    onCheckedChange={(checked) => setFormData({ ...formData, hizoDeposito: checked as boolean })}
                    className="border-green-300"
                  />
                  <Label htmlFor="deposito" className="font-semibold cursor-pointer text-green-900">
                    ¿Hizo depósito?
                  </Label>
                </div>

                {formData.hizoDeposito && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="montoDeposito" className="text-green-900 font-semibold">Monto del Depósito</Label>
                    <Input
                      id="montoDeposito"
                      type="number"
                      value={formData.montoDeposito || 0}
                      onChange={(e) => setFormData({ ...formData, montoDeposito: Number(e.target.value) })}
                      placeholder="0"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-sm">
                <Label htmlFor="notas" className="text-gray-900 font-semibold text-base">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas || ""}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Información adicional sobre la reserva..."
                  rows={3}
                  className="mt-2 border-gray-300 focus:border-gray-400"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                  {editingReserva ? "Guardar Cambios" : "Crear Reserva"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para eliminar - MEJORADO */}
        <AlertDialog open={!!deleteReserva} onOpenChange={() => setDeleteReserva(null)}>
          <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl text-red-700">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Esta acción no se puede deshacer. Se eliminará permanentemente la reserva de <span className="font-semibold text-gray-900">{deleteReserva?.nombre}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para ver detalles - MEJORADO */}
        {viewingReserva && (
          <Dialog open={!!viewingReserva} onOpenChange={() => setViewingReserva(null)}>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-blue-50/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Detalles de la Reserva
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-sm text-gray-500 font-medium">Departamento</p>
                    <p className="font-bold text-lg text-blue-900">{viewingReserva.departamento}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-sm text-gray-500 font-medium">Cliente</p>
                    <p className="font-bold text-lg text-blue-900">{viewingReserva.nombre}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-sm text-gray-500 font-medium">Check-in</p>
                    <p className="font-bold text-lg text-emerald-900">{format(viewingReserva.fechaInicio as Date, "dd/MM/yyyy")}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-sm text-gray-500 font-medium">Check-out</p>
                    <p className="font-bold text-lg text-emerald-900">{format(viewingReserva.fechaFin as Date, "dd/MM/yyyy")}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-sm text-gray-500 font-medium">Origen</p>
                    <Badge className={cn("text-white mt-2", getOrigenColor(viewingReserva.origen))}>
                      {ORIGENES.find((o) => o.value === viewingReserva.origen)?.label}
                    </Badge>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-gray-500 font-medium">Precio Total</p>
                    <p className="font-bold text-2xl text-green-600">${viewingReserva.precioTotal.toLocaleString()}</p>
                  </div>
                </div>
                {viewingReserva.notas && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium mb-2">Notas</p>
                    <p className="text-sm text-gray-700">{viewingReserva.notas}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setViewingReserva(null)} className="border-gray-300">
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setViewingReserva(null)
                    openEditDialog(viewingReserva)
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

// Timeline View Component - MEJORADO
function TimelineView({
  reservas,
  mes,
  cabins,
}: { reservas: Reserva[]; mes: Date; cabins: { id: string; name: string }[] }) {
  const start = startOfMonth(mes)
  const end = endOfMonth(mes)
  const days = eachDayOfInterval({ start, end })

  return (
    <Card className="border-emerald-100 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          {cabins.map((dept) => {
            const deptReservas = reservas.filter((r) => r.departamento === dept.name)

            return (
              <div key={dept.id} className="space-y-3">
                <div className="font-bold text-base text-emerald-900 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {dept.name}
                </div>
                <div className="relative h-14 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-inner border border-gray-200">
                  {deptReservas.map((reserva) => {
                    const reservaStart = reserva.fechaInicio as Date
                    const reservaEnd = reserva.fechaFin as Date

                    const startOffset = Math.max(0, differenceInDays(reservaStart, start))
                    const duration = differenceInDays(reservaEnd, reservaStart)
                    const width = (duration / days.length) * 100
                    const left = (startOffset / days.length) * 100

                    return (
                      <div
                        key={reserva.id}
                        className={cn(
                          "absolute h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold top-1 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer",
                          ORIGENES.find((o) => o.value === reserva.origen)?.color,
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                        title={`${reserva.nombre} - ${format(reservaStart, "dd/MM")} al ${format(reservaEnd, "dd/MM")}`}
                      >
                        <span className="truncate px-2">{reserva.nombre}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-bold text-emerald-900">Leyenda:</span>
            {ORIGENES.map((origen) => (
              <div key={origen.value} className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded shadow-sm", origen.color)} />
                <span className="text-sm font-medium text-gray-700">{origen.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Grid View Component - MEJORADO
function GridView({
  reservas,
  mes,
  cabins,
}: { reservas: Reserva[]; mes: Date; cabins: { id: string; name: string }[] }) {
  const start = startOfMonth(mes)
  const end = endOfMonth(mes)
  const days = eachDayOfInterval({ start, end })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cabins.map((dept) => {
        const deptReservas = reservas.filter((r) => r.departamento === dept.name)

        return (
          <Card key={dept.id}>
            <CardHeader>
              <CardTitle className="text-lg">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
                  <div key={i} className="text-center text-xs font-semibold text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
                {days.map((day) => {
                  const reserva = deptReservas.find((r) => day >= (r.fechaInicio as Date) && day < (r.fechaFin as Date))

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "aspect-square flex items-center justify-center text-xs rounded",
                        reserva
                          ? cn("text-white font-semibold", ORIGENES.find((o) => o.value === reserva.origen)?.color)
                          : "bg-gray-50",
                      )}
                      title={reserva ? `${reserva.nombre} - ${reserva.origen}` : ""}
                    >
                      {format(day, "d")}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Helper function to get currency based on country and origin
function getCurrencyForCountry(pais: string, origen: OrigenReserva): string {
  if (origen === "booking" || origen === "airbnb") return "dolares"
  const paisData = PAISES.find((p) => p.code === pais)
  return paisData?.currency || "dolares"
}
