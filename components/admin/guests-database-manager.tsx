"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reserva } from "@/types/reserva"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User, Calendar, DollarSign, Phone, Mail, MapPin, TrendingUp } from "lucide-react"

// Interface para datos consolidados de huéspedes
interface GuestData {
  id: string // Identificador único basado en teléfono o email
  nombre: string
  telefono: string
  email?: string
  pais: string
  totalReservas: number
  reservas: Reserva[]
  primeraVisita: Date
  ultimaVisita: Date
  totalGastado: number
  estados: {
    completadas: number
    canceladas: number
    pendientes: number
  }
  notas: string[]
}

export default function GuestsDatabaseManager() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [guests, setGuests] = useState<GuestData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"nombre" | "visitas" | "ultimaVisita" | "totalGastado">("ultimaVisita")
  const [selectedGuest, setSelectedGuest] = useState<GuestData | null>(null)

  // Función auxiliar para convertir fechas de Firebase
  const toValidDate = (timestamp: any): Date => {
    if (timestamp?.toDate) return timestamp.toDate()
    if (timestamp instanceof Date) return timestamp
    if (typeof timestamp === "string") return new Date(timestamp)
    return new Date()
  }

  // Cargar todas las reservas
  useEffect(() => {
    loadReservas()
  }, [])

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
          fechaInicio: toValidDate(data.fechaInicio),
          fechaFin: toValidDate(data.fechaFin),
          fechaCreacion: toValidDate(data.fechaCreacion),
          fechaDeposito: data.fechaDeposito ? toValidDate(data.fechaDeposito) : undefined,
        } as Reserva
      })

      setReservas(reservasData)
      processGuestData(reservasData)
    } catch (error) {
      console.error("Error loading reservas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Procesar datos de huéspedes en memoria
  const processGuestData = (reservasData: Reserva[]) => {
    const guestsMap = new Map<string, GuestData>()

    reservasData.forEach((reserva) => {
      // Usar teléfono como identificador único principal
      const guestId = reserva.numero.trim().toLowerCase()

      if (!guestsMap.has(guestId)) {
        // Nuevo huésped
        guestsMap.set(guestId, {
          id: guestId,
          nombre: reserva.nombre,
          telefono: reserva.numero,
          pais: reserva.pais,
          totalReservas: 1,
          reservas: [reserva],
          primeraVisita: reserva.fechaInicio as Date,
          ultimaVisita: reserva.fechaInicio as Date,
          totalGastado: reserva.precioTotal || 0,
          estados: {
            completadas: 0,
            canceladas: 0,
            pendientes: 1,
          },
          notas: reserva.notas ? [reserva.notas] : [],
        })
      } else {
        // Actualizar huésped existente
        const guest = guestsMap.get(guestId)!
        guest.totalReservas += 1
        guest.reservas.push(reserva)
        guest.totalGastado += reserva.precioTotal || 0

        if (reserva.notas) {
          guest.notas.push(reserva.notas)
        }

        // Actualizar fechas
        const fechaInicio = reserva.fechaInicio as Date
        if (fechaInicio < guest.primeraVisita) {
          guest.primeraVisita = fechaInicio
        }
        if (fechaInicio > guest.ultimaVisita) {
          guest.ultimaVisita = fechaInicio
        }

        // Aquí podrías agregar lógica para estados si tienes un campo 'estado' en las reservas
        guest.estados.pendientes += 1
      }
    })

    // Convertir Map a Array y ordenar las reservas de cada huésped por fecha
    const guestsArray = Array.from(guestsMap.values()).map((guest) => ({
      ...guest,
      reservas: guest.reservas.sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime()),
    }))

    setGuests(guestsArray)
  }

  // Filtrar y ordenar huéspedes
  const filteredAndSortedGuests = useMemo(() => {
    const filtered = guests.filter((guest) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        guest.nombre.toLowerCase().includes(searchLower) ||
        guest.telefono.toLowerCase().includes(searchLower) ||
        guest.email?.toLowerCase().includes(searchLower)
      )
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre)
        case "visitas":
          return b.totalReservas - a.totalReservas
        case "ultimaVisita":
          return b.ultimaVisita.getTime() - a.ultimaVisita.getTime()
        case "totalGastado":
          return b.totalGastado - a.totalGastado
        default:
          return 0
      }
    })

    return filtered
  }, [guests, searchTerm, sortBy])

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalGuests = guests.length
    const recurringGuests = guests.filter((g) => g.totalReservas >= 2).length
    const recurringPercentage = totalGuests > 0 ? Math.round((recurringGuests / totalGuests) * 100) : 0
    const topGuest = guests.reduce(
      (max, guest) => (guest.totalReservas > max.totalReservas ? guest : max),
      guests[0] || { nombre: "N/A", totalReservas: 0 },
    )

    return {
      totalGuests,
      recurringGuests,
      recurringPercentage,
      topGuest,
    }
  }, [guests])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
          <p className="mt-4 text-gray-600">Cargando base de datos de huéspedes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-brown">Base de Datos de Huéspedes</h2>
        <p className="text-muted-foreground mt-2">
          Información consolidada de todos los huéspedes basada en las reservas existentes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Huéspedes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">Huéspedes únicos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes Recurrentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recurringGuests} ({stats.recurringPercentage}%)
            </div>
            <p className="text-xs text-muted-foreground">Con 2 o más visitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Huésped</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topGuest?.nombre}</div>
            <p className="text-xs text-muted-foreground">{stats.topGuest?.totalReservas} reservas</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={sortBy === "nombre" ? "default" : "outline"} size="sm" onClick={() => setSortBy("nombre")}>
            Nombre
          </Button>
          <Button variant={sortBy === "visitas" ? "default" : "outline"} size="sm" onClick={() => setSortBy("visitas")}>
            Visitas
          </Button>
          <Button
            variant={sortBy === "ultimaVisita" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("ultimaVisita")}
          >
            Última Visita
          </Button>
          <Button
            variant={sortBy === "totalGastado" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("totalGastado")}
          >
            Total $
          </Button>
        </div>
      </div>

      {/* Tabla de huéspedes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-center">País</TableHead>
                  <TableHead className="text-center">Reservas</TableHead>
                  <TableHead>Primera Visita</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead className="text-right">Total Gastado</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron huéspedes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedGuests.map((guest) => (
                    <TableRow key={guest.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {guest.nombre}
                          {guest.totalReservas >= 2 && (
                            <Badge variant="secondary" className="text-xs">
                              Recurrente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{guest.telefono}</span>
                          </div>
                          {guest.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{guest.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{guest.pais}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge>{guest.totalReservas}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(guest.primeraVisita)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(guest.ultimaVisita)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(guest.totalGastado)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedGuest(guest)}>
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles del huésped */}
      <Dialog open={!!selectedGuest} onOpenChange={() => setSelectedGuest(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalles del Huésped</DialogTitle>
            <DialogDescription>Historial completo de reservas y información de contacto</DialogDescription>
          </DialogHeader>

          {selectedGuest && (
            <div className="space-y-6">
              {/* Información de contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedGuest.nombre}</span>
                    {selectedGuest.totalReservas >= 2 && <Badge variant="secondary">Huésped Recurrente</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedGuest.telefono}</span>
                  </div>
                  {selectedGuest.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGuest.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedGuest.pais}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas del huésped */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedGuest.totalReservas}</div>
                    <p className="text-xs text-muted-foreground">Total Reservas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatCurrency(selectedGuest.totalGastado)}</div>
                    <p className="text-xs text-muted-foreground">Total Gastado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-bold">{formatDate(selectedGuest.primeraVisita)}</div>
                    <p className="text-xs text-muted-foreground">Primera Visita</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-bold">{formatDate(selectedGuest.ultimaVisita)}</div>
                    <p className="text-xs text-muted-foreground">Última Visita</p>
                  </CardContent>
                </Card>
              </div>

              {/* Historial de reservas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Reservas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedGuest.reservas.map((reserva, index) => (
                      <div key={reserva.id || index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{reserva.departamento}</span>
                          </div>
                          <Badge>{reserva.origen}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Check-in: {formatDate(reserva.fechaInicio as Date)}</div>
                          <div>Check-out: {formatDate(reserva.fechaFin as Date)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(reserva.precioTotal)}</span>
                          </div>
                          {reserva.hizoDeposito && (
                            <Badge variant="outline" className="text-green">
                              Depósito realizado
                            </Badge>
                          )}
                        </div>
                        {reserva.notas && (
                          <div className="text-sm bg-muted p-2 rounded">
                            <span className="font-medium">Notas:</span> {reserva.notas}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notas consolidadas */}
              {selectedGuest.notas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notas y Comentarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedGuest.notas.map((nota, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {nota}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
