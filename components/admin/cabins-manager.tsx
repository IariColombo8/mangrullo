"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { Edit, Trash, Plus, Upload, Wifi, Wind, Thermometer, PawPrint, X, Image as ImageIcon } from "lucide-react"

// Firebase imports
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function CabinsManager() {
  const [cabins, setCabins] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCabin, setCurrentCabin] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
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

  // Cargar cabañas de Firebase al iniciar
  useEffect(() => {
    fetchCabins()
  }, [])

  const fetchCabins = async () => {
    setIsLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "cabins"))
      const cabinsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCabins(cabinsData)
    } catch (error) {
      console.error("Error al cargar las cabañas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cabañas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    const cabinImages = Array.isArray(cabin.images) ? cabin.images : 
                        cabin.image ? [cabin.image] : []
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
      // Eliminar el documento de Firestore
      await deleteDoc(doc(db, "cabins", currentCabin.id))
      
      setCabins(cabins.filter((cabin) => cabin.id !== currentCabin.id))
      toast({
        title: t("admin.cabins.deleteSuccess"),
        description: t("admin.cabins.deleteSuccessMessage"),
      })
    } catch (error) {
      console.error("Error al eliminar la cabaña:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la cabaña",
        variant: "destructive"
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
        variant: "destructive"
      })
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setImages(prev => [...prev, base64String])
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
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
    
    setFormData(prev => ({
      ...prev,
      images: newImages
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
        // Actualizar cabaña existente
        await updateDoc(doc(db, "cabins", currentCabin.id), cabinData)
        setCabins(cabins.map((cabin) => (cabin.id === currentCabin.id ? { id: currentCabin.id, ...cabinData } : cabin)))
        toast({
          title: t("admin.cabins.updateSuccess"),
          description: t("admin.cabins.updateSuccessMessage"),
        })
      } else {
        // Crear nueva cabaña
        cabinData.createdAt = new Date() // Añadir timestamp de creación
        const docRef = await addDoc(collection(db, "cabins"), cabinData)
        const newCabin = { id: docRef.id, ...cabinData }
        setCabins([...cabins, newCabin])
        toast({
          title: t("admin.cabins.addSuccess"),
          description: t("admin.cabins.addSuccessMessage"),
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al guardar la cabaña:", error)
      toast({
        title: "Error",
        description: isEditing ? "No se pudo actualizar la cabaña" : "No se pudo agregar la cabaña",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener la imagen principal para mostrar en la tarjeta
  const getMainImage = (cabin) => {
    if (Array.isArray(cabin.images) && cabin.images.length > 0) {
      return cabin.images[0];
    }
    return cabin.image || "";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.cabins.title")}</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.cabins.addNew")}
        </Button>
      </div>

      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div className="flex justify-center items-center p-12">
          <p>Cargando cabañas...</p>
        </div>
      ) : cabins.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-dashed">
          <p>No hay cabañas disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cabins.map((cabin) => (
            <Card key={cabin.id} className="overflow-hidden">
              <div className="relative h-48">
                {getMainImage(cabin) ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={getMainImage(cabin)}
                      alt={cabin.name[language] || cabin.name.en}
                      fill
                      className="object-cover"
                    />
                    {Array.isArray(cabin.images) && cabin.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {cabin.images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">Sin imagen</p>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{cabin.name[language] || cabin.name.en}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 line-clamp-2">
                    {cabin.description[language] || cabin.description.en}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green font-bold">${cabin.price}</span>
                      <span className="text-sm text-gray-500 ml-1">{t("admin.cabins.perNight")}</span>
                    </div>
                    <span className="text-sm text-gray-600">{t("admin.cabins.capacity", { count: cabin.capacity })}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cabin.amenities && cabin.amenities.map((amenity) => (
                      <div key={amenity} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {t(`admin.cabins.amenities.${amenity}`)}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(cabin)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t("admin.cabins.edit")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(cabin)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      {t("admin.cabins.delete")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Cabin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? t("admin.cabins.editCabin") : t("admin.cabins.addCabin")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">{t("admin.cabins.tabs.general")}</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
                <TabsTrigger value="descriptions">{t("admin.cabins.tabs.descriptions")}</TabsTrigger>
                <TabsTrigger value="amenities">{t("admin.cabins.tabs.amenities")}</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameEs">{t("admin.cabins.form.nameEs")}</Label>
                    <Input id="nameEs" name="nameEs" value={formData.nameEs} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="nameEn">{t("admin.cabins.form.nameEn")}</Label>
                    <Input id="nameEn" name="nameEn" value={formData.nameEn} onChange={handleInputChange} required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="namePt">{t("admin.cabins.form.namePt")}</Label>
                  <Input id="namePt" name="namePt" value={formData.namePt} onChange={handleInputChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">{t("admin.cabins.form.price")}</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">{t("admin.cabins.form.capacity")}</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="images">Imágenes ({images.length}/{MAX_IMAGES})</Label>
                    {images.length < MAX_IMAGES && (
                      <div>
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          multiple
                        />
                        <Label htmlFor="images" className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer text-sm transition-colors">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imágenes
                        </Label>
                      </div>
                    )}
                  </div>
                  
                  {images.length === 0 ? (
                    <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-8 text-center">
                      <p className="text-gray-500">No hay imágenes cargadas. La primera imagen se usará como principal.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                          <Image
                            src={img}
                            alt={`Imagen de cabaña ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-green/80 text-white text-xs px-2 py-0.5 rounded">
                              Principal
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="descriptions" className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="descriptionEs">{t("admin.cabins.form.descriptionEs")}</Label>
                  <Textarea
                    id="descriptionEs"
                    name="descriptionEs"
                    value={formData.descriptionEs}
                    onChange={handleInputChange}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionEn">{t("admin.cabins.form.descriptionEn")}</Label>
                  <Textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={handleInputChange}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionPt">{t("admin.cabins.form.descriptionPt")}</Label>
                  <Textarea
                    id="descriptionPt"
                    name="descriptionPt"
                    value={formData.descriptionPt}
                    onChange={handleInputChange}
                    required
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wifi"
                      checked={formData.amenities.wifi}
                      onCheckedChange={(checked) => handleAmenityChange("wifi", checked)}
                    />
                    <Label htmlFor="wifi" className="flex items-center cursor-pointer">
                      <Wifi className="h-4 w-4 mr-2 text-green" />
                      {t("admin.cabins.amenities.wifi")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ac"
                      checked={formData.amenities.ac}
                      onCheckedChange={(checked) => handleAmenityChange("ac", checked)}
                    />

                    <Label htmlFor="ac" className="flex items-center cursor-pointer">
                      <Thermometer className="h-4 w-4 mr-2 text-green" />
                      {t("admin.cabins.amenities.ac")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pets"
                      checked={formData.amenities.pets}
                      onCheckedChange={(checked) => handleAmenityChange("pets", checked)}
                    />
                    <Label htmlFor="pets" className="flex items-center cursor-pointer">
                      <PawPrint className="h-4 w-4 mr-2 text-green" />
                      {t("admin.cabins.amenities.pets")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="kitchen"
                      checked={formData.amenities.kitchen}
                      onCheckedChange={(checked) => handleAmenityChange("kitchen", checked)}
                    />
                    <Label htmlFor="kitchen" className="flex items-center cursor-pointer">
                      <Wind className="h-4 w-4 mr-2 text-green" />
                      {t("admin.cabins.amenities.kitchen")}
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => !isLoading && setIsDialogOpen(false)}
                disabled={isLoading}
              >
                {t("admin.cabins.cancel")}
              </Button>
              <Button 
                type="submit" 
                className="bg-green hover:bg-green/90"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : isEditing ? t("admin.cabins.update") : t("admin.cabins.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !isLoading && setIsDeleteDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.cabins.confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p>
            {t("admin.cabins.confirmDeleteMessage", {
              name: currentCabin?.name[language] || currentCabin?.name?.en || "esta cabaña",
            })}
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => !isLoading && setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              {t("admin.cabins.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : t("admin.cabins.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}