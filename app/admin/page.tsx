"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { LanguageProvider } from "@/context/language-context"
import ReservasManager, {
  type ReservasManagerRef,
} from "@/components/admin/reservas/reserva-manager";
import CabinsManager from "@/components/admin/cabins-manager"
import TestimonialsManager from "@/components/admin/testimonials-manager"
import ActivitiesManager from "@/components/admin/activities-manager"
import GuestsDatabaseManager from "@/components/admin/guests-database-manager"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Calendar, MessageSquare, MapPin, Settings, Menu, Users, Plus } from "lucide-react"

const SettingsManager = () => (
  <div className="p-6 text-center text-muted-foreground">
    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
    <h3 className="text-lg font-semibold mb-2">Configuración</h3>
    <p>Aquí irá el componente de configuración del sistema...</p>
  </div>
)

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("reservas")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const reservasManagerRef = useRef<ReservasManagerRef>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const tabItems = [
    { value: "cabins", icon: Home, label: "Cabañas" },
    { value: "reservas", icon: Calendar, label: "Reservas" },
    { value: "guests", icon: Users, label: "Huéspedes" },
    { value: "testimonials", icon: MessageSquare, label: "Testimonios" },
    { value: "activities", icon: MapPin, label: "Actividades" },
    { value: "settings", icon: Settings, label: "Configuración" },
  ]

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-16 items-center justify-between px-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(item.value)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                onClick={() => {
                  setActiveTab("reservas")
                  setTimeout(() => {
                    reservasManagerRef.current?.openNewDialog()
                  }, 100)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Reserva</span>
                <span className="sm:hidden">Nueva</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden bg-transparent">
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
                        </Button>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Tab Title for Mobile */}
            <div className="md:hidden flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              {tabItems.find((item) => item.value === activeTab) && (
                <>
                  {(() => {
                    const ActiveIcon = tabItems.find((item) => item.value === activeTab)?.icon
                    return ActiveIcon ? <ActiveIcon className="h-4 w-4" /> : null
                  })()}
                  <span className="font-semibold">{tabItems.find((item) => item.value === activeTab)?.label}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="container py-6 px-4">
          {activeTab === "cabins" && <CabinsManager />}
          {activeTab === "reservas" && <ReservasManager ref={reservasManagerRef} />}
          {activeTab === "guests" && <GuestsDatabaseManager />}
          {activeTab === "testimonials" && <TestimonialsManager />}
          {activeTab === "activities" && <ActivitiesManager />}
          {activeTab === "settings" && <SettingsManager />}
        </main>
      </div>
    </LanguageProvider>
  )
}
