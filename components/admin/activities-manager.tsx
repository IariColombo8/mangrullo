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
  MapPin,
  Plus,
  Edit,
  Trash,
  Upload,
  Search,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  Grid3X3,
  List,
  Mountain,
  Waves,
  TreePine,
  Camera,
  Car,
  X,
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

// Categorías de actividades
const ACTIVITY_CATEGORIES = [
  { id: "adventure", name: "Aventura", icon: Mountain, color: "bg-orange-500", lightColor: "bg-orange-100" },
  { id: "nature", name: "Naturaleza", icon: TreePine, color: "bg-green-500", lightColor: "bg-green-100" },
  { id: "water", name: "Acuáticas", icon: Waves, color: "bg-blue-500", lightColor: "bg-blue-100" },
  { id: "cultural", name: "Cultural", icon: Camera, color: "bg-purple-500", lightColor: "bg-purple-100" },
  { id: "transport", name: "Transporte", icon: Car, color: "bg-gray-500", lightColor: "bg-gray-100" },
]

// Niveles de dificultad
const DIFFICULTY_LEVELS = [
  { id: "easy", name: "Fácil", color: "bg-green-500" },
  { id: "moderate", name: "Moderado", color: "bg-yellow-500" },
  { id: "hard", name: "Difícil", color: "bg-red-500" },
]

export default function ActivitiesManager() {
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    titleEs: "",
    titleEn: "",
    titlePt: "",
    descriptionEs: "",
    descriptionEn: "",
    descriptionPt: "",
    location: "",
    distance: "",
    duration: "",
    difficulty: "easy",
    category: "adventure",
    price: 0,
    maxParticipants: 0,
    image: "",
    infoLink: "",
    included: "",
    requirements: "",
  })

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const activitiesCollection = collection(db, "activities")
      const activitiesSnapshot = await getDocs(query(activitiesCollection, orderBy("createdAt", "desc")))
      const activitiesList = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setActivities(activitiesList)
      setFilteredActivities(activitiesList)
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar actividades
  useEffect(() => {
    let filtered = activities

    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.title?.[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.title?.es?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.title?.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description?.[language]?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((activity) => activity.category === categoryFilter)
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((activity) => activity.difficulty === difficultyFilter)
    }

    setFilteredActivities(filtered)
  }, [searchQuery, categoryFilter, difficultyFilter, activities, language])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentActivity(null)
    setFormData({
      titleEs: "",
      titleEn: "",
      titlePt: "",
      descriptionEs: "",
      descriptionEn: "",
      descriptionPt: "",
      location: "",
      distance: "",
      duration: "",
      difficulty: "easy",
      category: "adventure",
      price: 0,
      maxParticipants: 0,
      image: "",
      infoLink: "",
      included: "",
      requirements: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (activity) => {
    setIsEditing(true)
    setCurrentActivity(activity)
    setFormData({
      titleEs: activity.title?.es || "",
      titleEn: activity.title?.en || "",
      titlePt: activity.title?.pt || "",
      descriptionEs: activity.description?.es || "",
      descriptionEn: activity.description?.en || "",
      descriptionPt: activity.description?.pt || "",
      location: activity.location || "",
      distance: activity.distance || "",
      duration: activity.duration || "",
      difficulty: activity.difficulty || "easy",
      category: activity.category || "adventure",
      price: activity.price || 0,
      maxParticipants: activity.maxParticipants || 0,
      image: activity.image || "",
      infoLink: activity.infoLink || "",
      included: activity.included || "",
      requirements: activity.requirements || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (activity) => {
    setCurrentActivity(activity)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentActivity) return
    setIsLoading(true)
    try {
      await deleteDoc(doc(db, "activities", currentActivity.id))
      setActivities(activities.filter((a) => a.id !== currentActivity.id))
      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
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
      [name]: name === "price" || name === "maxParticipants" ? Number(value) : value,
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

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
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
      const activityData = {
        title: {
          es: formData.titleEs,
          en: formData.titleEn,
          pt: formData.titlePt,
        },
        description: {
          es: formData.descriptionEs,
          en: formData.descriptionEn,
          pt: formData.descriptionPt,
        },
        location: formData.location,
        distance: formData.distance,
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category,
        price: formData.price,
        maxParticipants: formData.maxParticipants,
        image: formData.image,
        infoLink: formData.infoLink,
        included: formData.included,
        requirements: formData.requirements,
        updatedAt: serverTimestamp(),
      }

      if (isEditing && currentActivity) {
        await updateDoc(doc(db, "activities", currentActivity.id), activityData)
        setActivities(
          activities.map((a) =>
            a.id === currentActivity.id
              ? {
                  ...a,
                  ...activityData,
                }
              : a,
          ),
        )
        toast({
          title: "Actividad actualizada",
          description: "La actividad ha sido actualizada exitosamente.",
        })
      } else {
        activityData.createdAt = serverTimestamp()
        const docRef = await addDoc(collection(db, "activities"), activityData)
        setActivities([
          {
            ...activityData,
            id: docRef.id,
          },
          ...activities,
        ])
        toast({
          title: "Actividad agregada",
          description: "La nueva actividad ha sido agregada exitosamente.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving activity:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryInfo = (categoryId) => {
    return ACTIVITY_CATEGORIES.find((cat) => cat.id === categoryId) || ACTIVITY_CATEGORIES[0]
  }

  const getDifficultyInfo = (difficultyId) => {
    return DIFFICULTY_LEVELS.find((diff) => diff.id === difficultyId) || DIFFICULTY_LEVELS[0]
  }

  const ActivityCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )

  const stats = {
    total: activities.length,
    byCategory: ACTIVITY_CATEGORIES.map((cat) => ({
      ...cat,
      count: activities.filter((a) => a.category === cat.id).length,
    })),
    avgPrice:
      activities.length > 0
        ? (activities.reduce((acc, a) => acc + (a.price || 0), 0) / activities.length).toFixed(0)
        : 0,
    totalCapacity: activities.reduce((acc, a) => acc + (a.maxParticipants || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Actividades</h2>
          <p className="text-slate-600 mt-1">Administra todas las actividades y experiencias disponibles</p>
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nueva Actividad
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Actividades</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">${stats.avgPrice}</div>
            <div className="text-sm text-slate-600">Precio Promedio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCapacity}</div>
            <div className="text-sm text-slate-600">Capacidad Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byCategory.reduce((max, cat) => (cat.count > max.count ? cat : max), { count: 0 }).name || "N/A"}
            </div>
            <div className="text-sm text-slate-600">Categoría Popular</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categorías */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Distribución por Categorías</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.byCategory.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`p-2 rounded-full ${cat.color} text-white`}>
                <cat.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">{cat.count}</div>
                <div className="text-sm text-slate-600">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar actividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dificultades</SelectItem>
                {DIFFICULTY_LEVELS.map((diff) => (
                  <SelectItem key={diff.id} value={diff.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${diff.color}`}></div>
                      {diff.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filteredActivities.length} actividades
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

      {/* Lista de Actividades */}
      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {[...Array(6)].map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all"
                ? "No se encontraron actividades"
                : "No hay actividades disponibles"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando la primera actividad al sistema"}
            </p>
            {!searchQuery && categoryFilter === "all" && difficultyFilter === "all" && (
              <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Actividad
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredActivities.map((activity) => {
            const categoryInfo = getCategoryInfo(activity.category)
            const difficultyInfo = getDifficultyInfo(activity.difficulty)

            return (
              <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={activity.image || "/placeholder.svg?height=200&width=400"}
                    alt={activity.title?.[language] || activity.title?.en || "Actividad"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${categoryInfo.lightColor} ${categoryInfo.color.replace("bg-", "text-")} border-0`}
                    >
                      <categoryInfo.icon className="h-3 w-3 mr-1" />
                      {categoryInfo.name}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={`${difficultyInfo.color} text-white border-0`}>{difficultyInfo.name}</Badge>
                  </div>
                  {activity.price > 0 && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/70 text-white border-0">
                        <DollarSign className="h-3 w-3 mr-1" />${activity.price}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 line-clamp-1">
                        {activity.title?.[language] || activity.title?.en || "Sin título"}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-700 text-sm line-clamp-2">
                    {activity.description?.[language] || activity.description?.en || "Sin descripción"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {activity.distance && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-slate-500" />
                        <span>{activity.distance}</span>
                      </div>
                    )}
                    {activity.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span>{activity.duration}</span>
                      </div>
                    )}
                    {activity.maxParticipants > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>Máx. {activity.maxParticipants}</span>
                      </div>
                    )}
                    {activity.infoLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-slate-500" />
                        <a
                          href={activity.infoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-sm"
                        >
                          Más info
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(activity)} disabled={isLoading}>
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(activity)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog para Agregar/Editar Actividad */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditing ? "Editar Actividad" : "Agregar Nueva Actividad"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="media">Imagen</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleEs">Título (Español)</Label>
                      <Input
                        id="titleEs"
                        name="titleEs"
                        value={formData.titleEs}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: Trekking en la Montaña"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleEn">Título (Inglés)</Label>
                      <Input
                        id="titleEn"
                        name="titleEn"
                        value={formData.titleEn}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Mountain Trekking"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titlePt">Título (Portugués)</Label>
                    <Input
                      id="titlePt"
                      name="titlePt"
                      value={formData.titlePt}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Trekking na Montanha"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Dificultad</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map((diff) => (
                            <SelectItem key={diff.id} value={diff.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${diff.color}`}></div>
                                {diff.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          placeholder="Ej: Bariloche"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distance">Distancia</Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="distance"
                          name="distance"
                          value={formData.distance}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Ej: 15 km del lodge"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Ej: 4 horas"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio por persona</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Máximo Participantes</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="maxParticipants"
                          name="maxParticipants"
                          type="number"
                          min="0"
                          value={formData.maxParticipants}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descriptionEs">Descripción (Español)</Label>
                      <Textarea
                        id="descriptionEs"
                        name="descriptionEs"
                        value={formData.descriptionEs}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Describe la actividad en español..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">Descripción (Inglés)</Label>
                      <Textarea
                        id="descriptionEn"
                        name="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Describe the activity in English..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionPt">Descripción (Portugués)</Label>
                      <Textarea
                        id="descriptionPt"
                        name="descriptionPt"
                        value={formData.descriptionPt}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Descreva a atividade em português..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="included">Qué incluye</Label>
                      <Textarea
                        id="included"
                        name="included"
                        value={formData.included}
                        onChange={handleInputChange}
                        className="min-h-[80px]"
                        placeholder="Ej: Guía especializado, equipo de seguridad, refrigerio..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requisitos</Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        className="min-h-[80px]"
                        placeholder="Ej: Buen estado físico, ropa cómoda, calzado deportivo..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="infoLink">Enlace de información adicional</Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="infoLink"
                          name="infoLink"
                          type="url"
                          value={formData.infoLink}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="https://ejemplo.com/mas-info"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Imagen de la Actividad</Label>
                      <p className="text-sm text-slate-600">Sube una imagen representativa (máximo 5MB)</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                      <Input type="file" id="image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Label htmlFor="image" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-700">Haz clic para subir una imagen</p>
                        <p className="text-xs text-slate-500">PNG, JPG hasta 5MB</p>
                      </Label>
                    </div>

                    {formData.image && (
                      <div className="relative">
                        <div className="relative h-64 bg-slate-100 rounded-lg overflow-hidden">
                          <Image
                            src={formData.image || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2"
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
                "Actualizar Actividad"
              ) : (
                "Crear Actividad"
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
              ¿Estás seguro de que quieres eliminar la actividad{" "}
              <span className="font-semibold">
                {currentActivity?.title?.[language] || currentActivity?.title?.en || "esta actividad"}
              </span>
              ?
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
