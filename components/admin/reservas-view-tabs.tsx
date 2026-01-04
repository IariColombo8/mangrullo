"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, CalendarIcon, AlertTriangle } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
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
}: ReservasViewTabsProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(filteredReservas.length / ITEMS_PER_PAGE)
  const paginatedReservas = filteredReservas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as typeof viewMode)} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-emerald-200 h-8">
        <TabsTrigger
          value="tabla"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-[11px] px-1 py-0.5"
        >
          Tabla
        </TabsTrigger>
        <TabsTrigger
          value="timeline"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-[11px] px-1 py-0.5"
        >
          Cronograma
        </TabsTrigger>
        <TabsTrigger
          value="grid"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-[11px] px-1 py-0.5"
        >
          Cuadrícula
        </TabsTrigger>
      </TabsList>

      {viewMode === "tabla" && (
        <TabsContent value="tabla" className="mt-2">
          <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-white to-emerald-50/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Depto</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Check-in</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Check-out</TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-[10px] py-1 px-1">
                        Noches
                      </TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Nombre</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">País</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Teléfono</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Origen</TableHead>
                      <TableHead className="font-bold text-emerald-900 text-[10px] py-1 px-1">Contacto</TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-[10px] py-1 px-1">
                        Depósito
                      </TableHead>
                      <TableHead className="text-right font-bold text-emerald-900 text-[10px] py-1 px-1">
                        $ Noche
                      </TableHead>
                      <TableHead className="text-right font-bold text-emerald-900 text-[10px] py-1 px-1">
                        $ Total
                      </TableHead>
                      <TableHead className="text-center font-bold text-emerald-900 text-[10px] py-1 px-1">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReservas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-6 text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <CalendarIcon className="h-8 w-8 text-gray-300" />
                            <p className="text-xs font-medium">No se encontraron reservas</p>
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
                            <TableCell className="py-1 px-1">
                              <div className="flex items-center gap-0.5">
                                {hasAlert && (
                                  <AlertTriangle
                                    className="h-2.5 w-2.5 text-red-500 flex-shrink-0"
                                    title="Reserva vencida sin pago"
                                  />
                                )}
                                <Badge
                                  variant="outline"
                                  className="font-medium border-emerald-300 text-emerald-700 bg-emerald-50 text-[9px] px-1 py-0 truncate max-w-[70px]"
                                >
                                  {reserva.departamento}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700 text-[10px] py-1 px-1">
                              {format(reserva.fechaInicio as Date, "dd/MM/yy")}
                            </TableCell>
                            <TableCell className="font-medium text-gray-700 text-[10px] py-1 px-1">
                              {format(reserva.fechaFin as Date, "dd/MM/yy")}
                            </TableCell>
                            <TableCell className="text-center py-1 px-1">
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-[9px] px-1">
                                {nights}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900 text-[10px] py-1 px-1 max-w-[80px] truncate">
                              {reserva.nombre}
                            </TableCell>
                            <TableCell className="text-gray-600 text-[10px] py-1 px-1 max-w-[70px] truncate">
                              {PAISES.find((p) => p.code === reserva.pais)?.name || reserva.pais}
                            </TableCell>
                            <TableCell className="font-mono text-[9px] text-gray-700 py-1 px-1 max-w-[80px] truncate">
                              {reserva.numero}
                            </TableCell>
                            <TableCell className="py-1 px-1">
                              <Badge
                                className={cn(
                                  "text-white font-medium shadow-sm text-[9px] px-1",
                                  getOrigenColor(reserva.origen),
                                )}
                              >
                                {ORIGENES.find((o) => o.value === reserva.origen)?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-[10px] py-1 px-1 max-w-[70px] truncate">
                              {reserva.origen === "particular" && reserva.contactoParticular
                                ? reserva.contactoParticular
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center py-1 px-1">
                              {reserva.hizoDeposito ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm text-[9px] px-1"
                                >
                                  Sí
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-[9px] px-1">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-gray-700 text-[10px] py-1 px-1">
                              ${precioNoche.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 text-[10px] py-1 px-1">
                              ${(reserva.precioTotal || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="py-1 px-1">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingReserva(reserva)}
                                  title="Ver detalles"
                                  className="hover:bg-blue-50 hover:text-blue-600 h-6 w-6"
                                >
                                  <Eye className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(reserva)}
                                  title="Editar"
                                  className="hover:bg-emerald-50 hover:text-emerald-600 h-6 w-6"
                                >
                                  <Edit className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteReserva(reserva)}
                                  title="Eliminar"
                                  className="hover:bg-red-50 text-red-600 hover:text-red-700 h-6 w-6"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-2 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex-col sm:flex-row gap-1">
                  <div className="text-[10px] text-gray-600 font-medium">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredReservas.length)} de {filteredReservas.length}{" "}
                    reservas
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-emerald-300 hover:bg-emerald-50 h-6 px-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="text-[10px] font-semibold text-emerald-900 px-1">
                      Pág {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-emerald-300 hover:bg-emerald-50 h-6 px-1"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {viewMode === "timeline" && (
        <TabsContent value="timeline" className="mt-4">
          <TimelineView
            reservas={filteredReservas}
            mes={filterMes}
            cabins={cabins}
            setViewingReserva={setViewingReserva}
          />
        </TabsContent>
      )}

      {viewMode === "grid" && (
        <TabsContent value="grid" className="mt-4">
          <GridView reservas={filteredReservas} mes={filterMes} cabins={cabins} setViewingReserva={setViewingReserva} />
        </TabsContent>
      )}
    </Tabs>
  )
}
