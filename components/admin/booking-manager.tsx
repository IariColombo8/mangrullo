"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/context/language-context"
import {
  CalendarIcon,
  Plus,
  Search,
  Users,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wifi,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

// Firebase imports
import { db } from "../../lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"

// Definir los 4 departamentos
const DEPARTMENTS = [
  {
    id: "dept1",
    name: "Departamento Vista Mar",
    color: "bg-blue-500",
    lightColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    id: "dept2",
    name: "Departamento Vista Montaña",
    color: "bg-green-500",
    lightColor: "bg-green-100",
    textColor: "text-green-700",
  },
  {
    id: "dept3",
    name: "Departamento Centro",
    color: "bg-purple-500",
    lightColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    id: "dept4",
    name: "Departamento Premium",
    color: "bg-orange-500",
    lightColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
]

const BOOKING_TYPES = [
  { id: "airbnb", name: "Airbnb", color: "bg-pink-500", lightColor: "bg-pink-100", textColor: "text-pink-700" },
  {
    id: "direct",
    name: "Reserva Directa",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  {
    id: "maintenance",
    name: "Mantenimiento",
    color: "bg-gray-500",
    lightColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  { id: "blocked", name: "Bloqueado", color: "bg-red-500", lightColor: "bg-red-100", textColor: "text-red-700" },
]

export default function BookingsManager() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncStatus, setSyncStatus] = useState("success") // success, error, warning
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    departmentId: "",
    bookingType: "direct",
    checkIn: "",
    checkOut: "",
    guests: 1,
    totalAmount: 0,
    notes: "",
    status: "confirmed",
  })

  useEffect(() => {
    fetchBookings()
    // Simular última sincronización
    setLastSync(new Date(Date.now() - 30 * 60 * 1000)) // 30 minutos atrás
  }, [])

  // Configurar la semana inicial al lunes actual
  useEffect(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    setSelectedWeekStart(monday)
  }, [])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const bookingsCollection = collection(db, "bookings")
      const bookingsSnapshot = await getDocs(query(bookingsCollection, orderBy("checkIn", "asc")))
      const bookingsList = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate ? doc.data().checkIn.toDate() : new Date(doc.data().checkIn),
        checkOut: doc.data().checkOut?.toDate ? doc.data().checkOut.toDate() : new Date(doc.data().checkOut),
      }))
      setBookings(bookingsList)
      setFilteredBookings(bookingsList)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar reservas
  useEffect(() => {
    let filtered = bookings

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((booking) => booking.departmentId === departmentFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((booking) => booking.bookingType === typeFilter)
    }

    setFilteredBookings(filtered)
  }, [searchQuery, departmentFilter, typeFilter, bookings])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentBooking(null)
    setFormData({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      departmentId: "",
      bookingType: "direct",
      checkIn: "",
      checkOut: "",
      guests: 1,
      totalAmount: 0,
      notes: "",
      status: "confirmed",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (booking) => {
    setIsEditing(true)
    setCurrentBooking(booking)
    setFormData({
      guestName: booking.guestName || "",
      guestEmail: booking.guestEmail || "",
      guestPhone: booking.guestPhone || "",
      departmentId: booking.departmentId || "",
      bookingType: booking.bookingType || "direct",
      checkIn: booking.checkIn ? booking.checkIn.toISOString().split("T")[0] : "",
      checkOut: booking.checkOut ? booking.checkOut.toISOString().split("T")[0] : "",
      guests: booking.guests || 1,
      totalAmount: booking.totalAmount || 0,
      notes: booking.notes || "",
      status: booking.status || "confirmed",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (booking) => {
    setCurrentBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentBooking) return
    setIsLoading(true)
    try {
      await deleteDoc(doc(db, "bookings", currentBooking.id))
      setBookings(bookings.filter((b) => b.id !== currentBooking.id))
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "guests" || name === "totalAmount" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const bookingData = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        departmentId: formData.departmentId,
        bookingType: formData.bookingType,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        guests: formData.guests,
        totalAmount: formData.totalAmount,
        notes: formData.notes,
        status: formData.status,
        updatedAt: serverTimestamp(),
      }

      if (isEditing && currentBooking) {
        await updateDoc(doc(db, "bookings", currentBooking.id), bookingData)
        setBookings(
          bookings.map((b) =>
            b.id === currentBooking.id
              ? {
                  ...b,
                  ...bookingData,
                  checkIn: new Date(formData.checkIn),
                  checkOut: new Date(formData.checkOut),
                }
              : b,
          ),
        )
        toast({
          title: "Reserva actualizada",
          description: "La reserva ha sido actualizada exitosamente.",
        })
      } else {
        bookingData.createdAt = serverTimestamp()
        const docRef = await addDoc(collection(db, "bookings"), bookingData)
        setBookings([
          ...bookings,
          {
            ...bookingData,
            id: docRef.id,
            checkIn: new Date(formData.checkIn),
            checkOut: new Date(formData.checkOut),
          },
        ])
        toast({
          title: "Reserva agregada",
          description: "La nueva reserva ha sido agregada exitosamente.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving booking:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Sincronización con Airbnb (simulada)
  const handleAirbnbSync = async () => {
    setIsSyncing(true)
    try {
      // Simular llamada a API de Airbnb
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular algunas reservas nuevas de Airbnb
      const newAirbnbBookings = [
        {
          guestName: "John Smith",
          guestEmail: "john@email.com",
          departmentId: "dept1",
          bookingType: "airbnb",
          checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          guests: 2,
          totalAmount: 450,
          status: "confirmed",
          notes: "Sincronizado desde Airbnb",
          createdAt: serverTimestamp(),
        },
      ]

      // Agregar a Firestore (simulado)
      for (const booking of newAirbnbBookings) {
        const docRef = await addDoc(collection(db, "bookings"), booking)
        setBookings((prev) => [...prev, { ...booking, id: docRef.id }])
      }

      setLastSync(new Date())
      setSyncStatus("success")
      toast({
        title: "Sincronización exitosa",
        description: `Se sincronizaron ${newAirbnbBookings.length} nuevas reservas de Airbnb.`,
      })
    } catch (error) {
      setSyncStatus("error")
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar con Airbnb. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Obtener reservas para una fecha específica y departamento
  const getBookingsForDepartmentAndDate = (departmentId, date) => {
    const dateStr = date.toISOString().split("T")[0]
    return filteredBookings.filter((booking) => {
      const checkIn = booking.checkIn.toISOString().split("T")[0]
      const checkOut = booking.checkOut.toISOString().split("T")[0]
      return booking.departmentId === departmentId && dateStr >= checkIn && dateStr <= checkOut
    })
  }

  // Generar días del mes actual para el calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  // Generar días de la semana seleccionada
  const generateWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart)
      date.setDate(selectedWeekStart.getDate() + i)
      days.push(date)
    }
    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateWeek = (direction) => {
    setSelectedWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction * 7)
      return newDate
    })
  }

  const selectDateFromCalendar = (date) => {
    const monday = new Date(date)
    monday.setDate(date.getDate() - date.getDay() + 1)
    setSelectedWeekStart(monday)
  }

  const getDepartmentInfo = (departmentId) => {
    return DEPARTMENTS.find((dept) => dept.id === departmentId) || DEPARTMENTS[0]
  }

  const getBookingTypeInfo = (bookingType) => {
    return BOOKING_TYPES.find((type) => type.id === bookingType) || BOOKING_TYPES[0]
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const stats = {
    total: bookings.length,
    thisWeek: bookings.filter((b) => {
      const weekStart = new Date(selectedWeekStart)
      const weekEnd = new Date(selectedWeekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return b.checkIn >= weekStart && b.checkIn <= weekEnd
    }).length,
    airbnb: bookings.filter((b) => b.bookingType === "airbnb").length,
    direct: bookings.filter((b) => b.bookingType === "direct").length,
    revenue: bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
  }

  const weekDays = generateWeekDays()
  const calendarDays = generateCalendarDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Reservas</h2>
          <p className="text-slate-600 mt-1">Calendario y vista semanal de los 4 departamentos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAirbnbSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
            {isSyncing ? "Sincronizando..." : "Sync Airbnb"}
          </Button>
          <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Reservas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
            <div className="text-sm text-slate-600">Esta Semana</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.airbnb}</div>
            <div className="text-sm text-slate-600">Airbnb</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.direct}</div>
            <div className="text-sm text-slate-600">Directas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Ingresos</div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Sincronización */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <span className="font-medium">Estado de Sincronización</span>
            </div>
            {lastSync && (
              <span className="text-sm text-slate-600">Última sincronización: {lastSync.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Airbnb conectado
            </Badge>
          </div>
        </div>
      </Card>

      {/* Layout Principal: Calendario + Vista Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendario Mensual - Izquierda */}
        <Card className="lg:col-span-4 p-6">
          <div className="space-y-4">
            {/* Header del calendario */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendario */}
            <div className="grid grid-cols-7 gap-1">
              {/* Headers de días */}
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-slate-600">
                  {day}
                </div>
              ))}

              {/* Días del calendario */}
              {calendarDays.map((dayInfo, index) => {
                const isToday = dayInfo.date.toDateString() === new Date().toDateString() && dayInfo.isCurrentMonth
                const isSelected = dayInfo.date.toDateString() === selectedWeekStart.toDateString()
                const hasBookings = DEPARTMENTS.some(
                  (dept) => getBookingsForDepartmentAndDate(dept.id, dayInfo.date).length > 0,
                )

                return (
                  <button
                    key={index}
                    onClick={() => selectDateFromCalendar(dayInfo.date)}
                    className={`
                      p-2 text-sm rounded hover:bg-slate-100 transition-colors relative
                      ${dayInfo.isCurrentMonth ? "text-slate-900" : "text-slate-400"}
                      ${isToday ? "bg-emerald-100 text-emerald-700 font-semibold" : ""}
                      ${isSelected ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500" : ""}
                    `}
                  >
                    {dayInfo.date.getDate()}
                    {hasBookings && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Leyenda */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium text-slate-700">Tipos de Reserva</h4>
              <div className="grid grid-cols-2 gap-2">
                {BOOKING_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${type.color}`}></div>
                    <span className="text-xs text-slate-600">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Vista Semanal - Derecha */}
        <Card className="lg:col-span-8 p-6">
          <div className="space-y-4">
            {/* Header de la vista semanal */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Semana del {selectedWeekStart.toLocaleDateString("es-ES")}</h3>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const monday = new Date(today)
                    monday.setDate(today.getDate() - today.getDay() + 1)
                    setSelectedWeekStart(monday)
                  }}
                >
                  Esta Semana
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Headers de días de la semana */}
            <div className="grid grid-cols-8 gap-2">
              <div className="p-2 text-sm font-medium text-slate-600">Departamento</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-2 text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {day.toLocaleDateString("es-ES", { weekday: "short" })}
                  </div>
                  <div className="text-xs text-slate-600">{day.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Filas de departamentos */}
            <div className="space-y-2">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.id} className="grid grid-cols-8 gap-2 min-h-[80px]">
                  {/* Nombre del departamento */}
                  <div className={`p-3 rounded-lg ${dept.lightColor} ${dept.textColor} flex items-center`}>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <div className="font-medium text-sm">{dept.name}</div>
                        <div className="text-xs opacity-75">ID: {dept.id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Días de la semana para este departamento */}
                  {weekDays.map((day, dayIndex) => {
                    const dayBookings = getBookingsForDepartmentAndDate(dept.id, day)
                    const isToday = day.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          p-2 border-2 border-dashed border-slate-200 rounded-lg min-h-[80px] 
                          hover:border-slate-300 transition-colors
                          ${isToday ? "bg-emerald-50 border-emerald-200" : ""}
                        `}
                      >
                        {dayBookings.length > 0 ? (
                          <div className="space-y-1">
                            {dayBookings.map((booking) => {
                              const typeInfo = getBookingTypeInfo(booking.bookingType)
                              return (
                                <div
                                  key={booking.id}
                                  className={`
                                    p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity
                                    ${typeInfo.lightColor} ${typeInfo.textColor} border border-current
                                  `}
                                  onClick={() => handleEdit(booking)}
                                  title={`${booking.guestName} - ${typeInfo.name}`}
                                >
                                  <div className="font-medium truncate">{booking.guestName}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Users className="h-3 w-3" />
                                    <span>{booking.guests}</span>
                                    {booking.totalAmount > 0 && (
                                      <>
                                        <DollarSign className="h-3 w-3 ml-1" />
                                        <span>${booking.totalAmount}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400">
                            <button
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  departmentId: dept.id,
                                  checkIn: day.toISOString().split("T")[0],
                                  checkOut: new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                                }))
                                handleAddNew()
                              }}
                              className="text-xs hover:text-slate-600 transition-colors"
                            >
                              + Agregar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros rápidos */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar reservas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {BOOKING_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {filteredBookings.length} reservas
            </Badge>
          </div>
        </div>
      </Card>

      {/* Dialog para Agregar/Editar Reserva */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditing ? "Editar Reserva" : "Agregar Nueva Reserva"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del Huésped */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información del Huésped</h3>

                  <div className="space-y-2">
                    <Label htmlFor="guestName">Nombre Completo</Label>
                    <Input
                      id="guestName"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestEmail">Email</Label>
                    <Input
                      id="guestEmail"
                      name="guestEmail"
                      type="email"
                      value={formData.guestEmail}
                      onChange={handleInputChange}
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestPhone">Teléfono</Label>
                    <Input
                      id="guestPhone"
                      name="guestPhone"
                      value={formData.guestPhone}
                      onChange={handleInputChange}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Número de Huéspedes</Label>
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Información de la Reserva */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información de la Reserva</h3>

                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Departamento</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, departmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${dept.color}`}></div>
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingType">Tipo de Reserva</Label>
                    <Select
                      value={formData.bookingType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, bookingType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOKING_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${type.color}`}></div>
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in</Label>
                      <Input
                        id="checkIn"
                        name="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        name="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Monto Total</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        id="totalAmount"
                        name="totalAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                  placeholder="Información adicional sobre la reserva..."
                />
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : isEditing ? (
                "Actualizar Reserva"
              ) : (
                "Crear Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !isLoading && setIsDeleteDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la reserva de{" "}
              <span className="font-semibold">{currentBooking?.guestName}</span>?
              <br />
              <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
