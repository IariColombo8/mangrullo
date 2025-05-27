"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Star,
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Upload,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Grid3X3,
  List,
} from "lucide-react"

// Firebase imports - TUS IMPORTS ORIGINALES
import { db } from "../../lib/firebase"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([])
  const [filteredTestimonials, setFilteredTestimonials] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    textEs: "",
    textEn: "",
    textPt: "",
    image: "",
  })

  // TU LÓGICA ORIGINAL DE FIREBASE
  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const testimonialsCollection = collection(db, "testimonials")
      const testimonialsSnapshot = await getDocs(testimonialsCollection)
      const testimonialsList = testimonialsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTestimonials(testimonialsList)
      setFilteredTestimonials(testimonialsList)
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los testimonios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar testimonios
  useEffect(() => {
    let filtered = testimonials

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.text?.[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.text?.es?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.text?.en?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((testimonial) => testimonial.status === statusFilter)
    }

    // Filtro por calificación
    if (ratingFilter !== "all") {
      filtered = filtered.filter((testimonial) => testimonial.rating === Number.parseInt(ratingFilter))
    }

    setFilteredTestimonials(filtered)
  }, [searchQuery, statusFilter, ratingFilter, testimonials, language])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentTestimonial(null)
    setFormData({
      name: "",
      location: "",
      rating: 5,
      textEs: "",
      textEn: "",
      textPt: "",
      image: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (testimonial) => {
    setIsEditing(true)
    setCurrentTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      location: testimonial.location,
      rating: testimonial.rating,
      textEs: testimonial.text?.es || "",
      textEn: testimonial.text?.en || "",
      textPt: testimonial.text?.pt || "",
      image: testimonial.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (testimonial) => {
    setCurrentTestimonial(testimonial)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentTestimonial) return
    setIsLoading(true)
    try {
      await deleteDoc(doc(db, "testimonials", currentTestimonial.id))
      setTestimonials(testimonials.filter((t) => t.id !== currentTestimonial.id))
      toast({
        title: t("admin.testimonials.deleteSuccess") || "Testimonio eliminado",
        description: t("admin.testimonials.deleteSuccessMessage") || "El testimonio ha sido eliminado exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el testimonio",
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
      [name]: name === "rating" ? Number(value) : value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.match("image.*")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        })
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 2MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const testimonialData = {
        name: formData.name,
        location: formData.location,
        rating: formData.rating,
        text: {
          es: formData.textEs,
          en: formData.textEn,
          pt: formData.textPt,
        },
        image: formData.image,
        status: "approved",
        updatedAt: serverTimestamp(),
      }

      if (isEditing && currentTestimonial) {
        await updateDoc(doc(db, "testimonials", currentTestimonial.id), testimonialData)
        setTestimonials(
          testimonials.map((t) =>
            t.id === currentTestimonial.id
              ? {
                  ...t,
                  ...testimonialData,
                  id: currentTestimonial.id,
                }
              : t,
          ),
        )
        toast({
          title: t("admin.testimonials.updateSuccess") || "Testimonio actualizado",
          description:
            t("admin.testimonials.updateSuccessMessage") || "El testimonio ha sido actualizado exitosamente.",
        })
      } else {
        testimonialData.createdAt = serverTimestamp()
        const docRef = await addDoc(collection(db, "testimonials"), testimonialData)
        setTestimonials([
          ...testimonials,
          {
            ...testimonialData,
            id: docRef.id,
            createdAt: new Date(),
          },
        ])
        toast({
          title: t("admin.testimonials.addSuccess") || "Testimonio agregado",
          description:
            t("admin.testimonials.addSuccessMessage") || "El nuevo testimonio ha sido agregado exitosamente.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving testimonial:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el testimonio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (testimonial, newStatus) => {
    try {
      setIsLoading(true)
      const testimonialRef = doc(db, "testimonials", testimonial.id)
      await updateDoc(testimonialRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      })
      setTestimonials(
        testimonials.map((t) =>
          t.id === testimonial.id
            ? {
                ...t,
                status: newStatus,
                updatedAt: new Date(),
              }
            : t,
        ),
      )
      toast({
        title:
          newStatus === "approved"
            ? t("admin.testimonials.approveSuccess") || "Testimonio aprobado"
            : t("admin.testimonials.rejectSuccess") || "Testimonio rechazado",
        description:
          newStatus === "approved"
            ? t("admin.testimonials.approveSuccessMessage") || "El testimonio ha sido aprobado."
            : t("admin.testimonials.rejectSuccessMessage") || "El testimonio ha sido rechazado.",
      })
    } catch (error) {
      console.error("Error updating testimonial status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del testimonio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const TestimonialCardSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
    avgRating:
      testimonials.length > 0
        ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
        : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {t("admin.testimonials.title") || "Gestión de Testimonios"}
          </h2>
          <p className="text-slate-600 mt-1">Administra las reseñas y testimonios de los huéspedes</p>
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.testimonials.addNew") || "Agregar Testimonio"}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-slate-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-slate-600">Aprobados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-slate-600">Rechazados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.avgRating}</div>
            <div className="text-sm text-slate-600">Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar testimonios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Calificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las calificaciones</SelectItem>
                <SelectItem value="5">5 estrellas</SelectItem>
                <SelectItem value="4">4 estrellas</SelectItem>
                <SelectItem value="3">3 estrellas</SelectItem>
                <SelectItem value="2">2 estrellas</SelectItem>
                <SelectItem value="1">1 estrella</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {filteredTestimonials.length} testimonios
            </Badge>

            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Testimonios */}
      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {[...Array(6)].map((_, i) => (
            <TestimonialCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery || statusFilter !== "all" || ratingFilter !== "all"
                ? "No se encontraron testimonios"
                : "No hay testimonios disponibles"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || statusFilter !== "all" || ratingFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando el primer testimonio al sistema"}
            </p>
            {!searchQuery && statusFilter === "all" && ratingFilter === "all" && (
              <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Testimonio
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.image || "/placeholder.svg?height=48&width=48"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(testimonial.status)} border`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(testimonial.status)}
                      <span className="capitalize">
                        {testimonial.status === "pending"
                          ? "Pendiente"
                          : testimonial.status === "approved"
                            ? "Aprobado"
                            : "Rechazado"}
                      </span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-2">({testimonial.rating}/5)</span>
                </div>

                <p className="text-slate-700 line-clamp-3">
                  {testimonial.text?.[language] || testimonial.text?.en || "No hay descripción disponible"}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)} disabled={isLoading}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>

                  {testimonial.status === "pending" ? (
                    <>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                        onClick={() => handleStatusChange(testimonial, "approved")}
                        disabled={isLoading}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(testimonial, "rejected")}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Agregar/Editar Testimonio */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing
                ? t("admin.testimonials.editTestimonial") || "Editar Testimonio"
                : t("admin.testimonials.addTestimonial") || "Agregar Testimonio"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Información General</TabsTrigger>
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="image">Imagen</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Cliente</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="pl-10"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="pl-10"
                          placeholder="Ej: Buenos Aires, Argentina"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Calificación</Label>
                    <Select
                      value={formData.rating.toString()}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: Number.parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`}
                                  />
                                ))}
                              </div>
                              <span>
                                {rating} estrella{rating !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="textEs">Testimonio en Español</Label>
                      <Textarea
                        id="textEs"
                        name="textEs"
                        value={formData.textEs}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Escribe el testimonio en español..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textEn">Testimonio en Inglés</Label>
                      <Textarea
                        id="textEn"
                        name="textEn"
                        value={formData.textEn}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Write the testimonial in English..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textPt">Testimonio en Portugués</Label>
                      <Textarea
                        id="textPt"
                        name="textPt"
                        value={formData.textPt}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Escreva o depoimento em português..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Foto del Cliente</Label>
                      <p className="text-sm text-slate-600">Sube una foto del cliente (opcional, máximo 2MB)</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                      <Input type="file" id="image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Label htmlFor="image" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-700">Haz clic para subir una imagen</p>
                        <p className="text-xs text-slate-500">PNG, JPG hasta 2MB</p>
                      </Label>
                    </div>

                    {formData.image && (
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src={formData.image || "/placeholder.svg"}
                            alt="Preview"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Vista previa de la imagen</p>
                          <p className="text-sm text-slate-600">La imagen se mostrará en el testimonio</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Quitar
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                "Actualizar"
              ) : (
                "Crear"
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
              ¿Estás seguro de que quieres eliminar el testimonio de{" "}
              <span className="font-semibold">{currentTestimonial?.name}</span>?
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
