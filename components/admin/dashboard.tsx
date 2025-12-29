"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Calendar,
  MessageSquare,
  MapPin,
  Settings,
  Menu,
  ArrowLeft,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  User,
  LogOut,
  Eye,
} from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import CabinsManager from "./cabins-manager"
import TestimonialsManager from "./testimonials-manager"
import ReservasManager from "./reservas-manager"
import ActivitiesManager from "./activities-manager"

const SettingsManager = () => (
  <div className="p-6 text-center text-muted-foreground">
    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
    <h3 className="text-lg font-semibold mb-2">Configuración</h3>
    <p>Aquí irá el componente de configuración del sistema...</p>
  </div>
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [reservas, setReservas] = useState<any[]>([])
  const [cabins, setCabins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Cargar reservas
      const reservasSnapshot = await getDocs(collection(db, "reservas"))
      const reservasData = reservasSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate?.() || new Date(data.fechaInicio),
          fechaFin: data.fechaFin?.toDate?.() || new Date(data.fechaFin),
        }
      })

      // Cargar cabañas
      const cabinsSnapshot = await getDocs(collection(db, "cabins"))
      const cabinsData = cabinsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name?.es || data.nameEs || `Cabaña ${doc.id}`,
        }
      })

      setReservas(reservasData)
      setCabins(cabinsData)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const volverPaginaPrincipal = () => {
    window.location.href = "/"
  }

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const reservasActivas = reservas.filter((r) => {
    const inicio = new Date(r.fechaInicio)
    const fin = new Date(r.fechaFin)
    return inicio <= now && fin >= now
  })

  const reservasDelMes = reservas.filter((r) => {
    const fecha = new Date(r.fechaInicio)
    return fecha.getMonth() === thisMonth && fecha.getFullYear() === thisYear
  })

  const ingresosDelMes = reservasDelMes.reduce((sum, r) => sum + (r.precioTotal || 0), 0)

  // Calcular ocupación real
  const totalDias = cabins.length * 30
  const diasOcupados = reservasDelMes.reduce((sum, r) => {
    const nights = Math.ceil(
      ((r.fechaFin as Date).getTime() - (r.fechaInicio as Date).getTime()) / (1000 * 60 * 60 * 24),
    )
    return sum + nights
  }, 0)
  const ocupacion = totalDias > 0 ? Math.round((diasOcupados / totalDias) * 100) : 0

  const statCards = [
    {
      icon: Home,
      count: cabins.length,
      label: "Cabañas Activas",
      color: "text-emerald-600",
      change: "",
      changeType: "neutral",
    },
    {
      icon: Calendar,
      count: reservasActivas.length,
      label: "Reservas Activas",
      color: "text-blue-600",
      change: `${reservasDelMes.length} este mes`,
      changeType: "positive",
    },
    {
      icon: DollarSign,
      count: `$${ingresosDelMes.toLocaleString()}`,
      label: "Ingresos del Mes",
      color: "text-green-600",
      change: format(now, "MMMM", { locale: es }),
      changeType: "positive",
    },
    {
      icon: BarChart3,
      count: `${ocupacion}%`,
      label: "Ocupación",
      color: "text-purple-600",
      change: "del mes actual",
      changeType: ocupacion > 50 ? "positive" : "negative",
    },
  ]

  const tabItems = [
    { value: "overview", icon: BarChart3, label: "Resumen" },
    { value: "cabins", icon: Home, label: "Cabañas", badge: cabins.length.toString() },
    { value: "reservas", icon: Calendar, label: "Reservas", badge: reservasActivas.length.toString() },
    { value: "testimonials", icon: MessageSquare, label: "Testimonios", badge: "8" },
    { value: "activities", icon: MapPin, label: "Actividades" },
    { value: "settings", icon: Settings, label: "Configuración" },
  ]

  const recentBookings = reservas
    .sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime())
    .slice(0, 5)
    .filter((r) => r.fechaInicio && r.fechaFin && r.nombre && r.departamento && r.precioTotal)
    .map((r) => ({
      id: r.id,
      guest: r.nombre,
      cabin: r.departamento,
      checkIn: format(r.fechaInicio as Date, "dd/MM/yyyy"),
      status: (r.fechaInicio as Date) > now ? "confirmada" : "en curso",
      amount: `$${r.precioTotal.toLocaleString()}`,
    }))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Superior */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo y Botón Volver */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={volverPaginaPrincipal}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Sitio</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Home className="size-4" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground">Administración</p>
              </div>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabItems.slice(0, 5).map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.value)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notificaciones */}
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Nueva Reserva */}
            <Button
              size="sm"
              className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setActiveTab("reservas")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>

            {/* Menú Móvil */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 py-4">
                  <h2 className="text-lg font-semibold">Navegación</h2>
                  <nav className="flex flex-col gap-2">
                    {tabItems.map((item) => (
                      <Button
                        key={item.value}
                        variant={activeTab === item.value ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          setActiveTab(item.value)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Administrador</p>
                    <p className="text-xs text-muted-foreground">admin@mangrullo.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        {/* Contenido basado en tab activa */}
        {activeTab === "overview" && (
          <>
            {/* Welcome Card */}
            <Card className="mb-8 border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl font-bold">¡Bienvenido de vuelta!</CardTitle>
                <CardDescription className="text-emerald-50">
                  Aquí tienes un resumen de lo que está pasando en El Mangrullo hoy
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4 px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, index) => (
                    <Card
                      key={index}
                      className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="p-3 bg-gradient-to-br from-white to-gray-50 rounded-full mb-3 shadow-sm">
                          <card.icon className={`h-8 w-8 ${card.color}`} />
                        </div>
                        <p className="text-3xl font-bold mb-1">{card.count}</p>
                        <p className="text-sm text-slate-600 font-medium text-center">{card.label}</p>
                        {card.change && (
                          <div className="flex items-center mt-2 text-xs">
                            {card.changeType === "positive" ? (
                              <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : card.changeType === "negative" ? (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            ) : null}
                            <span
                              className={
                                card.changeType === "positive"
                                  ? "text-emerald-600"
                                  : card.changeType === "negative"
                                    ? "text-red-600"
                                    : "text-slate-600"
                              }
                            >
                              {card.change}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid de Contenido Principal */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
              {/* Reservas Recientes */}
              <Card className="col-span-4 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reservas Recientes</CardTitle>
                      <CardDescription>Últimas reservaciones y su estado</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("reservas")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Cargando reservas...</div>
                  ) : recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay reservas recientes</div>
                  ) : (
                    <div className="space-y-3">
                      {recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors hover:shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {booking.guest
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">{booking.guest}</p>
                              <p className="text-xs text-muted-foreground">{booking.cabin}</p>
                              <p className="text-xs text-muted-foreground">Check-in: {booking.checkIn}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{booking.amount}</p>
                            <Badge
                              variant={booking.status === "confirmada" ? "default" : "secondary"}
                              className="text-xs mt-1"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Acciones Rápidas */}
              <Card className="col-span-3 shadow-md">
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Tareas comunes y atajos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-transparent hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                    variant="outline"
                    onClick={() => setActiveTab("cabins")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Nueva Cabaña
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                    variant="outline"
                    onClick={() => setActiveTab("reservas")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Crear Reserva
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                    variant="outline"
                    onClick={() => setActiveTab("reservas")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Reportes de Reservas
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                    variant="outline"
                    onClick={() => setActiveTab("activities")}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Gestionar Actividades
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas Adicionales */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ocupación de Cabañas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{ocupacion}%</div>
                  <div className="h-3 bg-muted rounded-full mt-3">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${ocupacion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {reservasActivas.length} de {cabins.length} cabañas ocupadas
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Reservas este Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{reservasDelMes.length}</div>
                  <p className="text-sm text-muted-foreground mt-2">{format(now, "MMMM yyyy", { locale: es })}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total de reservas programadas</p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ingresos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${ingresosDelMes.toLocaleString()}</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-muted-foreground">del mes actual</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Basado en {reservasDelMes.length} reservas</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Contenido de otras tabs */}
        {activeTab === "cabins" && <CabinsManager />}
        {activeTab === "reservas" && <ReservasManager />}
        {activeTab === "testimonials" && <TestimonialsManager />}
        {activeTab === "activities" && <ActivitiesManager />}
        {activeTab === "settings" && <SettingsManager />}
      </main>
    </div>
  )
}
