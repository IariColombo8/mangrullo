"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import { useLanguage } from "@/context/language-context"
import {
  Edit,
  Trash,
  Plus,
  Upload,
  Wifi,
  Wind,
  Thermometer,
  PawPrint,
  X,
  ImageIcon,
  Users,
  DollarSign,
  MapPin,
  Search,
  Grid3X3,
  List,
} from "lucide-react"

// Firebase imports - TUS IMPORTS ORIGINALES
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function CabinsManager() {
  const [cabins, setCabins] = useState([])
  const [filteredCabins, setFilteredCabins] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCabin, setCurrentCabin] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const { language, t } = useLanguage()
  const { toast } = useToast()
  const MAX_IMAGES = 5

  const [formData, setFormData] = useState({
    nameEs: "",
    nameEn: "",
    namePt: "",
    descriptionEs: "",
    descriptionEn: "",
    descriptionPt: "",
    price: 0,
    capacity: 0,
    images: [],
    amenities: {
      wifi: false,
      ac: false,
      pets: false,
      kitchen: false,
    },
  })

  // TU LÓGICA ORIGINAL DE FIREBASE
  useEffect(() => {
    fetchCabins()
  }, [])

  const fetchCabins = async () => {
    setIsLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "cabins"))
      const cabinsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCabins(cabinsData)
      setFilteredCabins(cabinsData)
    } catch (error) {
      console.error("Error al cargar las cabañas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cabañas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar cabañas basado en búsqueda
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCabins(cabins)
    } else {
      const filtered = cabins.filter(
        (cabin) =>
          cabin.name?.[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cabin.description?.[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cabin.name?.es?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cabin.name?.en?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCabins(filtered)
    }
  }, [searchQuery, cabins, language])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentCabin(null)
    setImages([])
    setFormData({
      nameEs: "",
      nameEn: "",
      namePt: "",
      descriptionEs: "",
      descriptionEn: "",
      descriptionPt: "",
      price: 0,
      capacity: 0,
      images: [],
      amenities: {
        wifi: false,
        ac: false,
        pets: false,
        kitchen: false,
      },
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (cabin) => {
    setIsEditing(true)
    setCurrentCabin(cabin)

    // Preparar imágenes para edición
    const cabinImages = Array.isArray(cabin.images) ? cabin.images : cabin.image ? [cabin.image] : []
    setImages(cabinImages)

    setFormData({
      nameEs: cabin.name?.es || "",
      nameEn: cabin.name?.en || "",
      namePt: cabin.name?.pt || "",
      descriptionEs: cabin.description?.es || "",
      descriptionEn: cabin.description?.en || "",
      descriptionPt: cabin.description?.pt || "",
      price: cabin.price || 0,
      capacity: cabin.capacity || 0,
      images: cabinImages,
      amenities: {
        wifi: cabin.amenities?.includes("wifi") || false,
        ac: cabin.amenities?.includes("ac") || false,
        pets: cabin.amenities?.includes("pets") || false,
        kitchen: cabin.amenities?.includes("kitchen") || false,
      },
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (cabin) => {
    setCurrentCabin(cabin)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentCabin) return

    setIsLoading(true)
    try {
      // Eliminar el documento de Firestore - TU LÓGICA ORIGINAL
      await deleteDoc(doc(db, "cabins", currentCabin.id))

      setCabins(cabins.filter((cabin) => cabin.id !== currentCabin.id))
      toast({
        title: t("admin.cabins.deleteSuccess") || "Cabaña eliminada",
        description: t("admin.cabins.deleteSuccessMessage") || "La cabaña ha sido eliminada exitosamente.",
      })
    } catch (error) {
      console.error("Error al eliminar la cabaña:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cabaña",
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
      [name]: name === "price" || name === "capacity" ? Number(value) : value,
    }))
  }

  const handleAmenityChange = (amenity, checked) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked,
      },
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (images.length + files.length > MAX_IMAGES) {
      toast({
        title: "Límite de imágenes",
        description: `Solo se permiten ${MAX_IMAGES} imágenes por cabaña.`,
        variant: "destructive",
      })
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setImages((prev) => [...prev, base64String])
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64String],
        }))
      }
      reader.readAsDataURL(file)
    })

    // Limpiar el input para permitir subir archivos repetidos
    e.target.value = null
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const amenitiesArray = Object.entries(formData.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key)

      const cabinData = {
        name: {
          es: formData.nameEs,
          en: formData.nameEn,
          pt: formData.namePt,
        },
        description: {
          es: formData.descriptionEs,
          en: formData.descriptionEn,
          pt: formData.descriptionPt,
        },
        images: formData.images, // Guardar array de imágenes
        image: formData.images[0] || "", // Para retrocompatibilidad
        price: formData.price,
        capacity: formData.capacity,
        amenities: amenitiesArray,
        updatedAt: new Date(), // Timestamp para saber cuándo se actualizó
      }

      if (isEditing && currentCabin) {
        // Actualizar cabaña existente - TU LÓGICA ORIGINAL
        await updateDoc(doc(db, "cabins", currentCabin.id), cabinData)
        setCabins(cabins.map((cabin) => (cabin.id === currentCabin.id ? { id: currentCabin.id, ...cabinData } : cabin)))
        toast({
          title: t("admin.cabins.updateSuccess") || "Cabaña actualizada",
          description: t("admin.cabins.updateSuccessMessage") || "La cabaña ha sido actualizada exitosamente.",
        })
      } else {
        // Crear nueva cabaña - TU LÓGICA ORIGINAL
        cabinData.createdAt = new Date() // Añadir timestamp de creación
        const docRef = await addDoc(collection(db, "cabins"), cabinData)
        const newCabin = { id: docRef.id, ...cabinData }
        setCabins([...cabins, newCabin])
        toast({
          title: t("admin.cabins.addSuccess") || "Cabaña agregada",
          description: t("admin.cabins.addSuccessMessage") || "La nueva cabaña ha sido agregada exitosamente.",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al guardar la cabaña:", error)
      toast({
        title: "Error",
        description: isEditing ? "No se pudo actualizar la cabaña" : "No se pudo agregar la cabaña",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener la imagen principal para mostrar en la tarjeta - TU LÓGICA ORIGINAL
  const getMainImage = (cabin) => {
    if (Array.isArray(cabin.images) && cabin.images.length > 0) {
      return cabin.images[0]
    }
    return cabin.image || ""
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "ac":
        return <Thermometer className="h-4 w-4" />
      case "pets":
        return <PawPrint className="h-4 w-4" />
      case "kitchen":
        return <Wind className="h-4 w-4" />
      default:
        return null
    }
  }

  const CabinCardSkeleton = () => (
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
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{t("admin.cabins.title") || "Gestión de Cabañas"}</h2>
          <p className="text-slate-600 mt-1">Gestiona todas las cabañas y alojamientos disponibles</p>
        </div>
        <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.cabins.addNew") || "Agregar Nueva Cabaña"}
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar cabañas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filteredCabins.length} cabañas
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

      {/* Lista de Cabañas */}
      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {[...Array(6)].map((_, i) => (
            <CabinCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCabins.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? "No se encontraron cabañas" : "No hay cabañas disponibles"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Comienza agregando tu primera cabaña al sistema"}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Cabaña
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredCabins.map((cabin) => (
            <Card key={cabin.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-48 overflow-hidden">
                {getMainImage(cabin) ? (
                  <Image
                    src={getMainImage(cabin) || "/placeholder.svg"}
                    alt={cabin.name?.[language] || cabin.name?.en || "Cabaña"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">Sin imagen</p>
                  </div>
                )}
                {Array.isArray(cabin.images) && cabin.images.length > 1 && (
                  <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-0">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {cabin.images.length}
                  </Badge>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-emerald-600 text-white border-0">
                    <DollarSign className="h-3 w-3 mr-1" />${cabin.price}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">
                  {cabin.name?.[language] || cabin.name?.en || "Sin nombre"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {cabin.description?.[language] || cabin.description?.en || "Sin descripción"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-slate-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{cabin.capacity} personas</span>
                  </div>
                  <div className="flex items-center text-emerald-600 font-semibold">
                    <span className="text-lg">${cabin.price}</span>
                    <span className="text-sm text-slate-500 ml-1">/ noche</span>
                  </div>
                </div>

                {cabin.amenities && cabin.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cabin.amenities.slice(0, 4).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1 text-xs">
                        {getAmenityIcon(amenity)}
                        {t(`admin.cabins.amenities.${amenity}`) || amenity}
                      </Badge>
                    ))}
                    {cabin.amenities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{cabin.amenities.length - 4} más
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cabin)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("admin.cabins.edit") || "Editar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cabin)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Agregar/Editar Cabaña */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing
                ? t("admin.cabins.editCabin") || "Editar Cabaña"
                : t("admin.cabins.addCabin") || "Agregar Cabaña"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">{t("admin.cabins.tabs.general") || "General"}</TabsTrigger>
                  <TabsTrigger value="images" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Imágenes
                  </TabsTrigger>
                  <TabsTrigger value="descriptions">
                    {t("admin.cabins.tabs.descriptions") || "Descripciones"}
                  </TabsTrigger>
                  <TabsTrigger value="amenities">{t("admin.cabins.tabs.amenities") || "Amenidades"}</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameEs">{t("admin.cabins.form.nameEs") || "Nombre (Español)"}</Label>
                      <Input
                        id="nameEs"
                        name="nameEs"
                        value={formData.nameEs}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: Cabaña Vista Montaña"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameEn">{t("admin.cabins.form.nameEn") || "Nombre (Inglés)"}</Label>
                      <Input
                        id="nameEn"
                        name="nameEn"
                        value={formData.nameEn}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Mountain View Cabin"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="namePt">{t("admin.cabins.form.namePt") || "Nombre (Portugués)"}</Label>
                    <Input
                      id="namePt"
                      name="namePt"
                      value={formData.namePt}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Cabana Vista da Montanha"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("admin.cabins.form.price") || "Precio por noche"}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="pl-10"
                          placeholder="150"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">{t("admin.cabins.form.capacity") || "Capacidad"}</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="pl-10"
                          placeholder="4"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Imágenes de la Cabaña</Label>
                        <p className="text-sm text-slate-600">
                          Sube hasta {MAX_IMAGES} imágenes. La primera será la imagen principal.
                        </p>
                      </div>
                      <Badge variant="outline">
                        {images.length}/{MAX_IMAGES}
                      </Badge>
                    </div>

                    {images.length < MAX_IMAGES && (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          multiple
                        />
                        <Label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">Haz clic para subir imágenes</p>
                          <p className="text-xs text-slate-500">PNG, JPG hasta 10MB cada una</p>
                        </Label>
                      </div>
                    )}

                    {images.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">No hay imágenes cargadas</p>
                        <p className="text-sm text-slate-500">La primera imagen se usará como principal</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
                          >
                            <Image
                              src={img || "/placeholder.svg"}
                              alt={`Imagen de cabaña ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white border-0">
                                Principal
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="descriptions" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descriptionEs">
                        {t("admin.cabins.form.descriptionEs") || "Descripción (Español)"}
                      </Label>
                      <Textarea
                        id="descriptionEs"
                        name="descriptionEs"
                        value={formData.descriptionEs}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Describe la cabaña en español..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">
                        {t("admin.cabins.form.descriptionEn") || "Descripción (Inglés)"}
                      </Label>
                      <Textarea
                        id="descriptionEn"
                        name="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Describe the cabin in English..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descriptionPt">
                        {t("admin.cabins.form.descriptionPt") || "Descripción (Portugués)"}
                      </Label>
                      <Textarea
                        id="descriptionPt"
                        name="descriptionPt"
                        value={formData.descriptionPt}
                        onChange={handleInputChange}
                        required
                        className="min-h-[100px]"
                        placeholder="Descreva a cabana em português..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-6 pt-6">
                  <div>
                    <Label className="text-base font-medium">Amenidades Disponibles</Label>
                    <p className="text-sm text-slate-600 mb-4">Selecciona las amenidades que ofrece esta cabaña</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="wifi"
                            checked={formData.amenities.wifi}
                            onCheckedChange={(checked) => handleAmenityChange("wifi", checked)}
                          />
                          <Label htmlFor="wifi" className="flex items-center cursor-pointer flex-1">
                            <Wifi className="h-5 w-5 mr-3 text-emerald-600" />
                            <div>
                              <p className="font-medium">{t("admin.cabins.amenities.wifi") || "WiFi"}</p>
                              <p className="text-xs text-slate-500">Internet inalámbrico</p>
                            </div>
                          </Label>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="ac"
                            checked={formData.amenities.ac}
                            onCheckedChange={(checked) => handleAmenityChange("ac", checked)}
                          />
                          <Label htmlFor="ac" className="flex items-center cursor-pointer flex-1">
                            <Thermometer className="h-5 w-5 mr-3 text-emerald-600" />
                            <div>
                              <p className="font-medium">{t("admin.cabins.amenities.ac") || "Aire Acondicionado"}</p>
                              <p className="text-xs text-slate-500">Climatización</p>
                            </div>
                          </Label>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="pets"
                            checked={formData.amenities.pets}
                            onCheckedChange={(checked) => handleAmenityChange("pets", checked)}
                          />
                          <Label htmlFor="pets" className="flex items-center cursor-pointer flex-1">
                            <PawPrint className="h-5 w-5 mr-3 text-emerald-600" />
                            <div>
                              <p className="font-medium">{t("admin.cabins.amenities.pets") || "Mascotas Permitidas"}</p>
                              <p className="text-xs text-slate-500">Se admiten mascotas</p>
                            </div>
                          </Label>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="kitchen"
                            checked={formData.amenities.kitchen}
                            onCheckedChange={(checked) => handleAmenityChange("kitchen", checked)}
                          />
                          <Label htmlFor="kitchen" className="flex items-center cursor-pointer flex-1">
                            <Wind className="h-5 w-5 mr-3 text-emerald-600" />
                            <div>
                              <p className="font-medium">{t("admin.cabins.amenities.kitchen") || "Cocina"}</p>
                              <p className="text-xs text-slate-500">Cocina equipada</p>
                            </div>
                          </Label>
                        </div>
                      </Card>
                    </div>
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
              {t("admin.cabins.cancel") || "Cancelar"}
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
                t("admin.cabins.update") || "Actualizar"
              ) : (
                t("admin.cabins.create") || "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !isLoading && setIsDeleteDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.cabins.confirmDelete") || "Confirmar Eliminación"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.cabins.confirmDeleteMessage", {
                name: currentCabin?.name?.[language] || currentCabin?.name?.en || "esta cabaña",
              }) ||
                `¿Estás seguro de que quieres eliminar ${currentCabin?.name?.[language] || currentCabin?.name?.en || "esta cabaña"}?`}
              <br />
              <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t("admin.cabins.cancel") || "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                t("admin.cabins.delete") || "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
