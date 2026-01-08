"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Phone,
  User,
  MapPin,
  Search,
  Filter,
  X,
} from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import type { Reserva } from "@/types/reserva"
import type { Cabin } from "@/types/cabin"
import { cn } from "@/lib/utils"
import TimelineView from "./timeline-view"
import GridView from "./grid-view"

const ITEMS_PER_PAGE = 10

const PAISES = [
  { code: "AR", name: "Argentina", currency: "ARS" },
  { code: "BR", name: "Brasil", currency: "BRL" },
  { code: "CL", name: "Chile", currency: "CLP" },
  { code: "UY", name: "Uruguay", currency: "UYU" },
  { code: "PY", name: "Paraguay", currency: "PYG" },
  { code: "BO", name: "Bolivia", currency: "BOB" },
  { code: "PE", name: "Perú", currency: "PEN" },
  { code: "EC", name: "Ecuador", currency: "USD" },
  { code: "CO", name: "Colombia", currency: "COP" },
  { code: "VE", name: "Venezuela", currency: "VES" },
  { code: "MX", name: "México", currency: "MXN" },
  { code: "US", name: "Estados Unidos", currency: "USD" },
  { code: "CA", name: "Canadá", currency: "CAD" },
  { code: "ES", name: "España", currency: "EUR" },
  { code: "FR", name: "Francia", currency: "EUR" },
  { code: "DE", name: "Alemania", currency: "EUR" },
  { code: "IT", name: "Italia", currency: "EUR" },
  { code: "GB", name: "Reino Unido", currency: "GBP" },
  { code: "CN", name: "China", currency: "CNY" },
  { code: "JP", name: "Japón", currency: "JPY" },
]

const ORIGENES = [
  { value: "booking", label: "Booking" },
  { value: "airbnb", label: "Airbnb" },
  { value: "particular", label: "Particular" },
]

interface PrecioNoche {
  pesos?: number
  dolares?: number
  reales?: number
  [key: string]: number | undefined
}

interface ReservasViewTabsProps {
  viewMode: "tabla" | "timeline" | "grid"
  onViewModeChange: (mode: "tabla" | "timeline" | "grid") => void
  filteredReservas: Reserva[]
  cabins: Cabin[]
  filterMes: Date
  setViewingReserva: (reserva: Reserva | null) => void
  openEditDialog: (reserva: Reserva) => void
  setDeleteReserva: (reserva: Reserva | null) => void
  // Filter props
  filterDepartamento: string
  setFilterDepartamento: (value: string) => void
  filterOrigen: string
  setFilterOrigen: (value: string) => void
  filterDeposito: string
  setFilterDeposito: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  setFilterMes: (date: Date) => void
  hasActiveFilters: boolean
  clearAllFilters: () => void
}

function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getCurrency(pais: string, origen: string): string {
  const paisInfo = PAISES.find((p) => p.code === pais)
  if (!paisInfo) return "pesos"

  switch (paisInfo.currency) {
    case "USD":
      return "dolares"
    case "BRL":
      return "reales"
    default:
      return "pesos"
  }
}

function getOrigenColor(origen: string): string {
  switch (origen) {
    case "booking":
      return "bg-gradient-to-r from-blue-600 to-blue-700"
    case "airbnb":
      return "bg-gradient-to-r from-pink-600 to-red-600"
    case "particular":
      return "bg-gradient-to-r from-purple-600 to-indigo-600"
    default:
      return "bg-gray-600"
  }
}

function needsPaymentAlert(reserva: Reserva): boolean {
  const today = startOfDay(new Date())
  const checkIn = startOfDay(reserva.fechaInicio as Date)
  return !reserva.hizoDeposito && isBefore(checkIn, today)
}

export default function ReservasViewTabs({
  viewMode,
  onViewModeChange,
  filteredReservas,
  cabins,
  filterMes,
  setViewingReserva,
  openEditDialog,
  setDeleteReserva,
  filterDepartamento,
  setFilterDepartamento,
  filterOrigen,
  setFilterOrigen,
  filterDeposito,
  setFilterDeposito,
  searchQuery,
  setSearchQuery,
  setFilterMes,
  hasActiveFilters,
  clearAllFilters,
}: ReservasViewTabsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const totalPages = Math.ceil(filteredReservas.length / ITEMS_PER_PAGE)
  const paginatedReservas = filteredReservas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as typeof viewMode)} className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <TabsList className="grid flex-1 grid-cols-3 bg-white/80 backdrop-blur-sm border border-emerald-200 h-9 sm:h-10">
          <TabsTrigger
            value="tabla"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs sm:text-sm px-2 py-1"
          >
            Tabla
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs sm:text-sm px-2 py-1"
          >
            Cronograma
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs sm:text-sm px-2 py-1"
          >
            Cuadrícula
          </TabsTrigger>
        </TabsList>

        {/* Mobile filter button */}
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-emerald-200 hover:bg-emerald-50 relative h-9 w-9 bg-transparent"
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-emerald-600" />
                Filtros
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Mes */}
              <div className="space-y-2">
                <Label className="text-emerald-900 font-semibold text-sm">Mes</Label>
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
                    <CalendarIcon
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

              <div className="flex gap-2 pt-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearAllFilters()
                      setMobileFiltersOpen(false)
                    }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active filters badges (mobile) */}
      {hasActiveFilters && (
        <div className="md:hidden flex flex-wrap gap-1.5 mb-2">
          {filterDepartamento !== "todos" && (
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              {filterDepartamento}
              <button onClick={() => setFilterDepartamento("todos")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterOrigen !== "todos" && (
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              {ORIGENES.find((o) => o.value === filterOrigen)?.label}
              <button onClick={() => setFilterOrigen("todos")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterDeposito !== "todos" && (
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              Depósito: {filterDeposito === "si" ? "Sí" : "No"}
              <button onClick={() => setFilterDeposito("todos")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {viewMode === "tabla" && (
        <TabsContent value="tabla" className="mt-2">
          <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-white to-emerald-50/20">
            <CardContent className="p-0">
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Depto</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Check-in</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Check-out</TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-xs py-2 px-2">Noches</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Nombre</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">País</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Teléfono</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Origen</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-xs py-2 px-2">Contacto</TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-xs py-2 px-2">
                        Depósito
                      </TableHead>
                      <TableHead className="text-right font-bold text-emerald-900 text-xs py-2 px-2">$ Noche</TableHead>
                      <TableHead className="text-right font-bold text-emerald-900 text-xs py-2 px-2">$ Total</TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-xs py-2 px-2">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReservas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <CalendarIcon className="h-12 w-12 text-gray-300" />
                            <p className="text-sm font-medium">No se encontraron reservas</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReservas.map((reserva) => {
                        const nights = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
                        const currency = getCurrency(reserva.pais, reserva.origen)
                        const precioNoche =
                          reserva.precioNoche && typeof reserva.precioNoche === "object"
                            ? reserva.precioNoche[currency as keyof PrecioNoche] || 0
                            : 0
                        const hasAlert = needsPaymentAlert(reserva)

                        return (
                          <TableRow
                            key={reserva.id}
                            className={cn(
                              "hover:bg-emerald-50/50 transition-colors duration-150 border-b border-emerald-100",
                              hasAlert && "bg-red-50/50 hover:bg-red-50",
                            )}
                          >
                            <TableCell className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                {hasAlert && (
                                  <AlertTriangle
                                    className="h-3 w-3 text-red-500 flex-shrink-0"
                                    title="Reserva vencida sin pago"
                                  />
                                )}
                                <Badge
                                  variant="outline"
                                  className="font-medium border-emerald-300 text-emerald-700 bg-emerald-50 text-xs px-2 py-0.5"
                                >
                                  {reserva.departamento}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs py-2 px-2">
                              {format(reserva.fechaInicio as Date, "dd/MM/yy")}
                            </TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs py-2 px-2">
                              {format(reserva.fechaFin as Date, "dd/MM/yy")}
                            </TableCell>
                            <TableCell className="text-center py-2 px-2">
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs px-2">
                                {nights}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900 text-xs py-2 px-2">
                              {reserva.nombre}
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs py-2 px-2">
                              {PAISES.find((p) => p.code === reserva.pais)?.name || reserva.pais}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-700 py-2 px-2">
                              {reserva.numero}
                            </TableCell>
                            <TableCell className="py-2 px-2">
                              <Badge
                                className={cn(
                                  "text-white font-medium shadow-sm text-xs px-2",
                                  getOrigenColor(reserva.origen),
                                )}
                              >
                                {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs py-2 px-2">
                              {reserva.origen === "particular" && reserva.contactoParticular
                                ? reserva.contactoParticular
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center py-2 px-2">
                              {reserva.hizoDeposito ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm text-xs px-2"
                                >
                                  Sí
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs px-2">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-gray-700 text-xs py-2 px-2">
                              ${precioNoche.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 text-xs py-2 px-2">
                              ${(reserva.precioTotal || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingReserva(reserva)}
                                  title="Ver detalles"
                                  className="hover:bg-blue-50 hover:text-blue-600 h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(reserva)}
                                  title="Editar"
                                  className="hover:bg-emerald-50 hover:text-emerald-600 h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteReserva(reserva)}
                                  title="Eliminar"
                                  className="hover:bg-red-50 text-red-600 hover:text-red-700 h-8 w-8"
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

              {/* Vista Mobile - Cards */}
              <div className="lg:hidden divide-y divide-emerald-100">
                {paginatedReservas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarIcon className="h-12 w-12 text-gray-300" />
                      <p className="text-sm font-medium">No se encontraron reservas</p>
                    </div>
                  </div>
                ) : (
                  paginatedReservas.map((reserva) => {
                    const nights = calculateNights(reserva.fechaInicio as Date, reserva.fechaFin as Date)
                    const currency = getCurrency(reserva.pais, reserva.origen)
                    const precioNoche =
                      reserva.precioNoche && typeof reserva.precioNoche === "object"
                        ? reserva.precioNoche[currency as keyof PrecioNoche] || 0
                        : 0
                    const hasAlert = needsPaymentAlert(reserva)

                    return (
                      <div
                        key={reserva.id}
                        className={cn("p-4 hover:bg-emerald-50/50 transition-colors", hasAlert && "bg-red-50/50")}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {hasAlert && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                            <Badge
                              variant="outline"
                              className="font-bold border-emerald-300 text-emerald-700 bg-emerald-50 text-sm px-2 py-1"
                            >
                              {reserva.departamento}
                            </Badge>
                          </div>
                          <Badge
                            className={cn("text-white font-medium shadow-sm text-xs", getOrigenColor(reserva.origen))}
                          >
                            {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                          </Badge>
                        </div>

                        {/* Fechas y Noches */}
                        <div className="grid grid-cols-2 gap-2 mb-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Check-in</div>
                            <div className="font-semibold text-sm text-gray-900">
                              {format(reserva.fechaInicio as Date, "dd/MM/yy")}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Check-out</div>
                            <div className="font-semibold text-sm text-gray-900">
                              {format(reserva.fechaFin as Date, "dd/MM/yy")}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-center pt-2 border-t border-emerald-200">
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                              {nights} {nights === 1 ? "noche" : "noches"}
                            </Badge>
                          </div>
                        </div>

                        {/* Información del Cliente */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-sm text-gray-900">{reserva.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {PAISES.find((p) => p.code === reserva.pais)?.name || reserva.pais}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-600">{reserva.numero}</span>
                          </div>
                          {reserva.origen === "particular" && reserva.contactoParticular && (
                            <div className="text-sm text-gray-600 pl-6">Contacto: {reserva.contactoParticular}</div>
                          )}
                        </div>

                        {/* Precios y Depósito */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-xs text-gray-500 mb-1">Por noche</div>
                            <div className="font-semibold text-sm text-gray-700">${precioNoche.toLocaleString()}</div>
                          </div>
                          <div className="bg-emerald-50 p-2 rounded">
                            <div className="text-xs text-emerald-600 mb-1">Total</div>
                            <div className="font-bold text-sm text-emerald-600">
                              ${(reserva.precioTotal || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Depósito</div>
                          {reserva.hizoDeposito ? (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                              Pagado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                              Pendiente
                            </Badge>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-3 border-t border-emerald-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingReserva(reserva)}
                            className="flex-1 hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(reserva)}
                            className="flex-1 hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteReserva(reserva)}
                            className="hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-3 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex-col sm:flex-row gap-2">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredReservas.length)} de {filteredReservas.length}{" "}
                    reservas
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-emerald-300 hover:bg-emerald-50 h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs sm:text-sm font-semibold text-emerald-900 px-2">
                      Pág {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-emerald-300 hover:bg-emerald-50 h-8 px-3"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {viewMode === "timeline" && (
        <TabsContent value="timeline" className="mt-2">
          <TimelineView
            reservas={filteredReservas}
            mes={filterMes}
            cabins={cabins}
            setViewingReserva={setViewingReserva}
          />
        </TabsContent>
      )}

      {viewMode === "grid" && (
        <TabsContent value="grid" className="mt-2">
          <GridView reservas={filteredReservas} mes={filterMes} cabins={cabins} setViewingReserva={setViewingReserva} />
        </TabsContent>
      )}
    </Tabs>
  )
}
