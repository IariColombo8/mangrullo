"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Users,
  Search,
  AlertCircle,
  RefreshCw,
  Loader2,
  Info,
  MessageCircle,
  Home,
  Baby,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Departamento, Reserva } from "@/types/reserva"
import { DEPARTAMENTOS } from "@/types/reserva"
import type { DateRange } from "react-day-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CabinInfo {
  id: string
  name: any
  description: any
  capacity: number
  price: number
  image: string
  amenities?: string[]
  gallery?: string[]
}

export default function PublicAvailabilitySearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hasError, setHasError] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [availableDepartments, setAvailableDepartments] = useState<Departamento[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [selectedCabinInfo, setSelectedCabinInfo] = useState<CabinInfo | null>(null)
  const [cabinInfoModal, setCabinInfoModal] = useState(false)
  const [cabinsData, setCabinsData] = useState<CabinInfo[]>([])
  const [whatsappModal, setWhatsappModal] = useState(false)
  const [userName, setUserName] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  const nights =
    dateRange?.from && dateRange?.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const cabinsCollection = collection(db, "cabins")
        const cabinsSnapshot = await getDocs(cabinsCollection)
        const cabinsList = cabinsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CabinInfo[]
        setCabinsData(cabinsList)
      } catch (error) {
        console.error("Error al cargar cabañas:", error)
      }
    }
    fetchCabins()
  }, [])

  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "object") return field.es || field.en || field.pt || Object.values(field)[0] || ""
    return field
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!dateRange?.from) {
      newErrors.dateFrom = "Por favor selecciona la fecha de entrada"
    }

    if (!dateRange?.to) {
      newErrors.dateTo = "Por favor selecciona la fecha de salida"
    }

    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      newErrors.dateRange = "La fecha de salida debe ser posterior a la fecha de entrada"
    }

    if (adults < 1) {
      newErrors.adults = "Debe haber al menos 1 adulto"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkOverlap = (departamento: Departamento, fechaInicio: Date, fechaFin: Date): boolean => {
    return cabinsData.some((cabin) => {
      const cabinName = getLocalizedText(cabin.name)
      if (cabinName !== departamento) return false

      // Buscar reservas que afecten a este departamento
      return false // Placeholder, se verificará contra las reservas cargadas
    })
  }

  const handleSearch = async () => {
    setErrors({})
    setHasError(false)

    if (!validateForm()) {
      return
    }

    setIsSearching(true)
    setSearchPerformed(false)

    try {
      const reservasRef = collection(db, "reservas")
      const q = query(reservasRef, where("fechaFin", ">=", Timestamp.fromDate(dateRange!.from!)))
      const snapshot = await getDocs(q)

      const occupiedDepts = new Set<Departamento>()

      snapshot.forEach((doc) => {
        const data = doc.data() as Reserva
        
        // Ignorar reservas canceladas o no presentadas
        if (data.estado === "cancelada" || data.estado === "no_presentado") {
          return
        }

        const reservaStart = data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate() : new Date(data.fechaInicio)
        const reservaEnd = data.fechaFin instanceof Timestamp ? data.fechaFin.toDate() : new Date(data.fechaFin)

        const rStart = reservaStart.getTime()
        const rEnd = reservaEnd.getTime()
        const newStart = dateRange!.from!.getTime()
        const newEnd = dateRange!.to!.getTime()

        // Check for overlap: new range starts before existing range ends AND new range ends after existing range starts
        const hasOverlap = newStart < rEnd && newEnd > rStart

        if (hasOverlap) {
          // Check if this reservation uses the same departamento
          if (data.esReservaMultiple && data.departamentos) {
            data.departamentos.forEach((d) => {
              occupiedDepts.add(d.departamento)
            })
          } else {
            occupiedDepts.add(data.departamento)
          }
        }
      })

      // Get available departments from cabins data
      const allDepartments = cabinsData.map((cabin) => getLocalizedText(cabin.name)).filter(Boolean)
      const available = allDepartments.filter((dept) => !occupiedDepts.has(dept))
      
      setAvailableDepartments(available)
      setSearchPerformed(true)
    } catch (error) {
      console.error("Error al buscar disponibilidad:", error)
      setHasError(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleViewDetails = (departmentName: string) => {
    const cabin = cabinsData.find((c) => getLocalizedText(c.name) === departmentName)
    if (cabin) {
      setSelectedCabinInfo(cabin)
      setCabinInfoModal(true)
    }
  }

  const handleOpenWhatsAppModal = () => {
    setWhatsappModal(true)
  }

  const handleSendWhatsApp = () => {
    if (!userName.trim()) {
      setErrors({ ...errors, userName: "Por favor ingresa tu nombre" })
      return
    }
    if (selectedDepartments.length === 0) {
      setErrors({ ...errors, department: "Por favor selecciona al menos un departamento" })
      return
    }

    const checkInStr = dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : ""
    const checkOutStr = dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : ""
    
    const deptsText = selectedDepartments.length === 1 
      ? `el departamento ${selectedDepartments[0]}`
      : `los departamentos: ${selectedDepartments.join(", ")}`

    const message = encodeURIComponent(
      `Hola, mi nombre es ${userName}.\nQuisiera consultar disponibilidad para ${deptsText}.\n\n📅 Entrada: ${checkInStr}\n📅 Salida: ${checkOutStr}\n🌙 Noches: ${nights}\n👥 Adultos: ${adults}\n👶 Niños: ${children}\n\n¿Está disponible?`,
    )

    window.open(`https://wa.me/5493456551306?text=${message}`, "_blank")
    setWhatsappModal(false)
    setUserName("")
    setSelectedDepartments([])
  }

  const getRecommendedDepartments = () => {
    const totalGuests = adults + children
    const capacities: { [key: string]: number } = {
      "Los Horneros": 4,
      "Los Zorzales": 4,
      "Las Calandrias": 5,
      "Los Tordos": 5,
    }

    if (totalGuests <= 4) {
      return availableDepartments.filter(dept => capacities[dept] === 4)
    } else if (totalGuests === 5) {
      return availableDepartments.filter(dept => capacities[dept] === 5)
    } else if (totalGuests <= 9) {
      return availableDepartments.slice(0, 2)
    } else if (totalGuests <= 14) {
      return availableDepartments.slice(0, 3)
    } else {
      return availableDepartments
    }
  }

  const handleReset = () => {
    setDateRange(undefined)
    setAdults(1)
    setChildren(0)
    setErrors({})
    setSearchPerformed(false)
    setAvailableDepartments([])
    setHasError(false)
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return "📶"
      case "ac":
        return "❄️"
      case "pets":
        return "🐾"
      case "kitchen":
        return "🍳"
      default:
        return "✓"
    }
  }

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return "WiFi"
      case "ac":
        return "Aire Acondicionado"
      case "pets":
        return "Mascotas Permitidas"
      case "kitchen":
        return "Cocina"
      default:
        return amenity
    }
  }

  // Manejar selección de fechas en el calendario
  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    // Cerrar el calendario cuando ambas fechas estén seleccionadas
    if (range?.from && range?.to) {
      setCalendarOpen(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg relative z-50"
          >
            <CalendarIcon className="mr-2 h-5 w-5" />
            Consultar Disponibilidad
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Buscar Disponibilidad
            </DialogTitle>
            <DialogDescription className="text-base">
              Completa los datos para verificar qué departamentos están disponibles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                Fechas de Estadía <span className="text-red-500">*</span>
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !dateRange && "text-muted-foreground",
                      (errors.dateFrom || errors.dateTo || errors.dateRange) && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-emerald-600" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: es })
                      )
                    ) : (
                      "Selecciona entrada y salida"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    numberOfMonths={1}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {errors.dateFrom && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateFrom}
                </p>
              )}
              {errors.dateTo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateTo}
                </p>
              )}
              {errors.dateRange && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateRange}
                </p>
              )}
            </div>

            {nights > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg p-4">
                <p className="text-emerald-700 font-bold text-center text-lg flex items-center justify-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Total: {nights} {nights === 1 ? "noche" : "noches"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Adultos <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    max="20"
                    value={adults}
                    onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                    className={cn("pl-10 h-12 text-base", errors.adults && "border-red-500")}
                  />
                </div>
                {errors.adults && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.adults}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="children" className="text-base font-semibold flex items-center gap-2">
                  <Baby className="h-4 w-4 text-emerald-600" />
                  Niños
                </Label>
                <div className="relative">
                  <Baby className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    max="20"
                    value={children}
                    onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6 font-semibold shadow-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Buscando disponibilidad...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Consultar Disponibilidad
                </>
              )}
            </Button>

            {hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error de conexión. Por favor intenta nuevamente.
                  <Button variant="outline" size="sm" onClick={handleSearch} className="mt-2 w-full bg-transparent">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {searchPerformed && !hasError && (
              <div className="space-y-4 mt-6">
                {availableDepartments.length === 0 ? (
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-700">No hay disponibilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-2">
                        No hay departamentos disponibles para las fechas seleccionadas.
                      </p>
                      <p className="text-sm text-gray-600">
                        Por favor intenta con otras fechas o contáctanos para más opciones.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50">
                      <CardHeader>
                        <CardTitle className="text-xl text-emerald-700 flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Departamentos disponibles
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 mb-4">
                          Estos departamentos están disponibles para tus fechas. Haz clic en "Ver Detalles" para más
                          información:
                        </p>
                        {availableDepartments.map((dept) => (
                          <div
                            key={dept}
                            className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <span className="font-bold text-gray-800 text-lg flex items-center gap-2">
                              <Home className="h-5 w-5 text-emerald-600" />
                              {dept}
                            </span>
                            <Button
                              onClick={() => handleViewDetails(dept)}
                              variant="outline"
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                              size="sm"
                            >
                              <Info className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Button
                      onClick={handleOpenWhatsAppModal}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 font-semibold shadow-lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Consultar por WhatsApp
                    </Button>
                  </>
                )}

                <Button onClick={handleReset} variant="outline" className="w-full bg-white border-2">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpiar formulario / Nueva búsqueda
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cabinInfoModal} onOpenChange={setCabinInfoModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              {selectedCabinInfo ? getLocalizedText(selectedCabinInfo.name) : ""}
            </DialogTitle>
            <DialogDescription>Información detallada del departamento</DialogDescription>
          </DialogHeader>

          {selectedCabinInfo && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="gallery">Galería</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedCabinInfo.image || "/placeholder.svg"}
                      alt={getLocalizedText(selectedCabinInfo.name)}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Descripción</h3>
                      <p className="text-gray-700">{getLocalizedText(selectedCabinInfo.description)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Capacidad</p>
                        <p className="text-xl font-bold text-emerald-700">{selectedCabinInfo.capacity} personas</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Precio por noche</p>
                        <p className="text-xl font-bold text-emerald-700">${selectedCabinInfo.price}</p>
                      </div>
                    </div>

                    {selectedCabinInfo.amenities && selectedCabinInfo.amenities.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Comodidades</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCabinInfo.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-700">
                              <span className="text-xl">{getAmenityIcon(amenity)}</span>
                              <span>{getAmenityLabel(amenity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="gallery" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCabinInfo.gallery && selectedCabinInfo.gallery.length > 0 ? (
                      selectedCabinInfo.gallery.map((img, index) => (
                        <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`Foto ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No hay imágenes adicionales disponibles
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={whatsappModal} onOpenChange={setWhatsappModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Completar Datos
            </DialogTitle>
            <DialogDescription>
              Completa tus datos para enviar la consulta por WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-base font-semibold">
                Tu Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="userName"
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value)
                  setErrors({ ...errors, userName: "" })
                }}
                className={cn("h-12 text-base", errors.userName && "border-red-500")}
              />
              {errors.userName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.userName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Selecciona Departamento(s) <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Recomendado para {adults + children} persona(s): {getRecommendedDepartments().length > 0 ? getRecommendedDepartments().join(", ") : "Cualquiera de los disponibles"}
              </p>
              <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                {availableDepartments.map((dept) => {
                  const cabinData = cabinsData.find(c => getLocalizedText(c.name) === dept)
                  const capacity = cabinData?.capacity || 4
                  const isRecommended = getRecommendedDepartments().includes(dept)
                  
                  return (
                    <label
                      key={dept}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors",
                        selectedDepartments.includes(dept) && "bg-emerald-50 border-emerald-500",
                        isRecommended && !selectedDepartments.includes(dept) && "border-emerald-300 bg-emerald-50/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([...selectedDepartments, dept])
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept))
                          }
                          setErrors({ ...errors, department: "" })
                        }}
                        className="h-5 w-5 text-emerald-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{dept}</span>
                          {isRecommended && (
                            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">Capacidad: {capacity} personas</span>
                      </div>
                    </label>
                  )
                })}
              </div>
              {errors.department && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.department}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-emerald-800">Resumen de tu consulta:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>📅 Entrada: {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : ""}</p>
                <p>📅 Salida: {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : ""}</p>
                <p>🌙 Noches: {nights}</p>
                <p>👥 Adultos: {adults}</p>
                <p>👶 Niños: {children}</p>
              </div>
            </div>

            <Button
              onClick={handleSendWhatsApp}
              className="w-full text-lg py-6 font-semibold shadow-lg bg-[#25D366] hover:bg-[#20BA5A] text-white border-0"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Enviar Consulta por WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}