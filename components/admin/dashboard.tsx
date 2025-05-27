"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Users,
  Eye,
  Star,
  User,
  LogOut,
} from "lucide-react"

// Importar los componentes
import CabinsManager from "./cabins-manager"
import TestimonialsManager from "./testimonials-manager"
import BookingsManager from "./booking-manager"
import ActivitiesManager from "./activities-manager"

// Simulando el hook de idioma
const useLanguage = () => ({
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      "admin.dashboard.welcome": "¡Bienvenido de vuelta!",
      "admin.dashboard.description": "Aquí tienes un resumen de lo que está pasando en tu lodge hoy.",
      "admin.dashboard.cabins": "Cabañas",
      "admin.dashboard.bookings": "Reservas",
      "admin.dashboard.testimonials": "Testimonios",
      "admin.dashboard.activities": "Actividades",
      "admin.tabs.cabins": "Cabañas",
      "admin.tabs.bookings": "Reservas",
      "admin.tabs.testimonials": "Testimonios",
      "admin.tabs.activities": "Actividades",
      "admin.tabs.settings": "Configuración",
    }
    return translations[key] || key
  },
})

// Componentes simulados para las otras secciones
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
  const { t } = useLanguage()

  const volverPaginaPrincipal = () => {
    // Aquí puedes usar tu router preferido
    window.location.href = "/"
  }

  const statCards = [
    {
      icon: Home,
      count: 12,
      label: "Cabañas Activas",
      color: "text-emerald-600",
      change: "+2",
      changeType: "positive",
    },
    {
      icon: Calendar,
      count: 34,
      label: "Reservas Activas",
      color: "text-blue-600",
      change: "+12%",
      changeType: "positive",
    },
    {
      icon: DollarSign,
      count: "$12,450",
      label: "Ingresos del Mes",
      color: "text-green-600",
      change: "+8%",
      changeType: "positive",
    },
    {
      icon: BarChart3,
      count: "87%",
      label: "Ocupación",
      color: "text-purple-600",
      change: "-3%",
      changeType: "negative",
    },
  ]

  const tabItems = [
    { value: "overview", icon: BarChart3, label: "Resumen" },
    { value: "cabins", icon: Home, label: t("admin.tabs.cabins"), badge: "12" },
    { value: "bookings", icon: Calendar, label: t("admin.tabs.bookings"), badge: "34" },
    { value: "testimonials", icon: MessageSquare, label: t("admin.tabs.testimonials"), badge: "8" },
    { value: "activities", icon: MapPin, label: t("admin.tabs.activities") },
    { value: "settings", icon: Settings, label: t("admin.tabs.settings") },
  ]

  const recentBookings = [
    {
      id: "1",
      guest: "Juan Pérez",
      cabin: "Cabaña Vista Montaña",
      checkIn: "2024-01-15",
      status: "confirmada",
      amount: "$450",
    },
    {
      id: "2",
      guest: "María García",
      cabin: "Casa del Lago",
      checkIn: "2024-01-18",
      status: "pendiente",
      amount: "$320",
    },
    {
      id: "3",
      guest: "Carlos López",
      cabin: "Refugio del Bosque",
      checkIn: "2024-01-20",
      status: "confirmada",
      amount: "$280",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Superior */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo y Botón Volver */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={volverPaginaPrincipal} className="flex items-center gap-2">
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
            <Button size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>

            {/* Menú Móvil */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
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
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Administrador</p>
                    <p className="text-xs text-muted-foreground">admin@lodge.com</p>
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
            <Card className="mb-8 border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl font-bold">{t("admin.dashboard.welcome")}</CardTitle>
                <CardDescription className="text-emerald-50">{t("admin.dashboard.description")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4 px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <card.icon className={`h-8 w-8 ${card.color} mb-3`} />
                        <p className="text-2xl font-bold">{card.count}</p>
                        <p className="text-sm text-slate-500">{card.label}</p>
                        <div className="flex items-center mt-2 text-xs">
                          {card.changeType === "positive" ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className={card.changeType === "positive" ? "text-emerald-600" : "text-red-600"}>
                            {card.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid de Contenido Principal */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
              {/* Reservas Recientes */}
              <Card className="col-span-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reservas Recientes</CardTitle>
                      <CardDescription>Últimas reservaciones y su estado</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {booking.guest
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{booking.guest}</p>
                            <p className="text-xs text-muted-foreground">{booking.cabin}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.amount}</p>
                          <Badge
                            variant={booking.status === "confirmada" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Acciones Rápidas */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Tareas comunes y atajos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("cabins")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Nueva Cabaña
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("bookings")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Crear Reserva
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Huéspedes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas Adicionales */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ocupación de Cabañas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <div className="h-2 bg-muted rounded-full mt-2">
                    <div className="h-2 bg-emerald-500 rounded-full w-[87%]"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">10 de 12 cabañas ocupadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Calificación Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 mr-1 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Basado en 127 reseñas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Crecimiento Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">+12%</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Aumento de ingresos</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Contenido de otras tabs */}
        {activeTab === "cabins" && <CabinsManager />}
        {activeTab === "bookings" && <BookingsManager />}
        {activeTab === "testimonials" && <TestimonialsManager />}
        {activeTab === "activities" && <ActivitiesManager />}
        {activeTab === "settings" && <SettingsManager />}
      </main>
    </div>
  )
}
