"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, List, TrendingUp, BarChart, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

const DEPARTMENTS = [
  { id: "dept1", name: "Departamento Vista Mar" },
  { id: "dept2", name: "Departamento Vista Montaña" },
  { id: "dept3", name: "Departamento Centro" },
  { id: "dept4", name: "Departamento Premium" },
]

const BOOKING_ORIGINS = {
  booking: { name: "Booking.com", color: "bg-[#0071C2]", textColor: "text-blue-700", bgLight: "bg-blue-100" },
  airbnb: { name: "Airbnb", color: "bg-[#FF5A5F]", textColor: "text-pink-700", bgLight: "bg-pink-100" },
  upcn: { name: "UPCN", color: "bg-[#28A745]", textColor: "text-green-700", bgLight: "bg-green-100" },
  particular: { name: "Particular", color: "bg-[#FFA500]", textColor: "text-orange-700", bgLight: "bg-orange-100" },
  direct: { name: "Directa", color: "bg-[#FFA500]", textColor: "text-orange-700", bgLight: "bg-orange-100" },
  blocked: { name: "Bloqueado", color: "bg-[#6C757D]", textColor: "text-gray-700", bgLight: "bg-gray-100" },
}

interface Booking {
  id: string
  departmentId: string
  guestName: string
  guestEmail?: string
  bookingType: string
  checkIn: Date
  checkOut: Date
  guests: number
  totalAmount: number
  status: string
}

export default function CalendarViews() {
  const [activeView, setActiveView] = useState("timeline")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [originFilter, setOriginFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchQuery, departmentFilter, originFilter])

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings")
      const snapshot = await getDocs(bookingsRef)
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
          id: doc.id,
          ...docData,
          checkIn: docData.checkIn?.toDate ? docData.checkIn.toDate() : new Date(docData.checkIn),
          checkOut: docData.checkOut?.toDate ? docData.checkOut.toDate() : new Date(docData.checkOut),
        } as Booking
      })
      setBookings(data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    if (searchQuery) {
      filtered = filtered.filter((b) => b.guestName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((b) => b.departmentId === departmentFilter)
    }

    if (originFilter !== "all") {
      filtered = filtered.filter((b) => b.bookingType === originFilter)
    }

    setFilteredBookings(filtered)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  }

  const getBookingsForDayAndDept = (date: Date, deptId: string) => {
    const dateStr = date.toISOString().split("T")[0]
    return filteredBookings.filter((booking) => {
      if (booking.departmentId !== deptId) return false
      const checkIn = booking.checkIn.toISOString().split("T")[0]
      const checkOut = booking.checkOut.toISOString().split("T")[0]
      return dateStr >= checkIn && dateStr < checkOut
    })
  }

  const getOriginStyle = (bookingType: string) => {
    return BOOKING_ORIGINS[bookingType as keyof typeof BOOKING_ORIGINS] || BOOKING_ORIGINS.particular
  }

  const calculateStats = () => {
    const totalBookings = filteredBookings.length
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    const thisMonth = filteredBookings.filter((b) => {
      return b.checkIn.getMonth() === currentDate.getMonth() && b.checkIn.getFullYear() === currentDate.getFullYear()
    }).length

    const daysInMonth = getDaysInMonth().length
    const totalPossibleDays = DEPARTMENTS.length * daysInMonth
    const occupiedDays = filteredBookings.reduce((sum, b) => {
      const nights = Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)
    const occupancyRate = Math.round((occupiedDays / totalPossibleDays) * 100)

    return { totalBookings, totalRevenue, thisMonth, occupancyRate }
  }

  const stats = calculateStats()
  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Vistas de Calendario</h2>
          <p className="text-slate-600 mt-1">Explora diferentes visualizaciones de tus reservas</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por huésped..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(BOOKING_ORIGINS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <BarChart className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Vista Timeline - {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header with dates */}
                  <div className="flex mb-2">
                    <div className="w-48 flex-shrink-0 font-semibold p-2">Departamento</div>
                    <div className="flex-1 flex">
                      {days.map((day, idx) => (
                        <div key={idx} className="flex-1 text-center text-xs p-1 border-l">
                          <div className="font-semibold">{day.getDate()}</div>
                          <div className="text-gray-500">{day.toLocaleDateString("es-ES", { weekday: "short" })}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline rows */}
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept.id} className="flex mb-3 border rounded-lg overflow-hidden">
                      <div className="w-48 flex-shrink-0 bg-slate-50 p-3 flex items-center font-medium text-sm">
                        {dept.name}
                      </div>
                      <div className="flex-1 flex relative bg-white">
                        {days.map((day, idx) => (
                          <div key={idx} className="flex-1 border-l relative min-h-[60px]">
                            {getBookingsForDayAndDept(day, dept.id).map((booking) => {
                              const originStyle = getOriginStyle(booking.bookingType)
                              const isStart =
                                day.toISOString().split("T")[0] === booking.checkIn.toISOString().split("T")[0]

                              return isStart ? (
                                <div
                                  key={booking.id}
                                  className={`absolute top-1 left-0 h-12 ${originStyle.color} rounded px-2 py-1 text-white text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
                                  style={{
                                    width: `${Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)) * 100}%`,
                                    zIndex: 10,
                                  }}
                                  title={`${booking.guestName} - ${originStyle.name}`}
                                >
                                  <span className="truncate font-medium">{booking.guestName}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista de Lista - Todas las Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Huésped</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Personas</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
                    .map((booking) => {
                      const dept = DEPARTMENTS.find((d) => d.id === booking.departmentId)
                      const originStyle = getOriginStyle(booking.bookingType)
                      return (
                        <TableRow key={booking.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {booking.checkIn.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                              </div>
                              <div className="text-gray-500 text-xs">
                                → {booking.checkOut.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{dept?.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{booking.guestName}</div>
                              {booking.guestEmail && <div className="text-gray-500 text-xs">{booking.guestEmail}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={originStyle.bgLight}>
                              <span className={originStyle.textColor}>{originStyle.name}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{booking.guests}</TableCell>
                          <TableCell className="font-semibold text-emerald-600">${booking.totalAmount}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard View */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-gray-500 mt-1">En el sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Este Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500 mt-1">Reservas activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Proyectado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ocupación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.occupancyRate}%</div>
                <p className="text-xs text-gray-500 mt-1">Tasa mensual</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEPARTMENTS.map((dept) => {
                    const deptBookings = filteredBookings.filter((b) => b.departmentId === dept.id).length
                    const percentage = stats.totalBookings > 0 ? (deptBookings / stats.totalBookings) * 100 : 0
                    return (
                      <div key={dept.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className="text-sm text-gray-600">{deptBookings} reservas</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reservas por Origen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(BOOKING_ORIGINS).map(([key, origin]) => {
                    const originBookings = filteredBookings.filter((b) => b.bookingType === key).length
                    const percentage = stats.totalBookings > 0 ? (originBookings / stats.totalBookings) * 100 : 0
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{origin.name}</span>
                          <span className="text-sm text-gray-600">{originBookings} reservas</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 ${origin.color} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics View */}
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Próximas Entradas/Salidas</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Próximas 7 días - Check-ins</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {filteredBookings
                            .filter((b) => {
                              const daysUntilCheckIn = Math.ceil(
                                (b.checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                              )
                              return daysUntilCheckIn >= 0 && daysUntilCheckIn <= 7
                            })
                            .slice(0, 5)
                            .map((booking) => (
                              <div key={booking.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <p className="font-medium">{booking.guestName}</p>
                                  <p className="text-xs text-gray-500">
                                    {DEPARTMENTS.find((d) => d.id === booking.departmentId)?.name}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {booking.checkIn.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Próximas 7 días - Check-outs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {filteredBookings
                            .filter((b) => {
                              const daysUntilCheckOut = Math.ceil(
                                (b.checkOut.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                              )
                              return daysUntilCheckOut >= 0 && daysUntilCheckOut <= 7
                            })
                            .slice(0, 5)
                            .map((booking) => (
                              <div key={booking.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <p className="font-medium">{booking.guestName}</p>
                                  <p className="text-xs text-gray-500">
                                    {DEPARTMENTS.find((d) => d.id === booking.departmentId)?.name}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {booking.checkOut.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
