"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { MapPin, Calendar, Plus, Edit, Trash, Upload, ExternalLink } from "lucide-react"
import { Label } from "@/components/ui/label"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase" 

export default function ActivitiesManager() {
  const [activities, setActivities] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    distance: "",
    image: "",
    infoLink: "",
  })

  // Fetch activities from Firebase
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const activitiesCollection = collection(db, "activities")
        const activitiesSnapshot = await getDocs(activitiesCollection)
        
        const activitiesData = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setActivities(activitiesData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las actividades.",
          variant: "destructive"
        })
        setLoading(false)
      }
    }

    fetchActivities()
  }, [toast])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentActivity(null)
    setFormData({
      title: "",
      description: "",
      location: "",
      distance: "",
      image: "",
      infoLink: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (activity) => {
    setIsEditing(true)
    setCurrentActivity(activity)
    setFormData({
      title: activity.title?.es || activity.title || "",
      description: activity.description?.es || activity.description || "",
      location: activity.location || "",
      distance: activity.distance || "",
      image: activity.image || "",
      infoLink: activity.infoLink || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (activity) => {
    setCurrentActivity(activity)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (currentActivity) {
      try {
        setLoading(true)
        await deleteDoc(doc(db, "activities", currentActivity.id))
        
        setActivities(activities.filter((activity) => activity.id !== currentActivity.id))
        toast({
          title: "Éxito",
          description: "Actividad eliminada correctamente.",
        })
        setLoading(false)
      } catch (error) {
        console.error("Error deleting activity:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la actividad.",
          variant: "destructive"
        })
        setLoading(false)
      }
    }
    setIsDeleteDialogOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const activityData = {
      title: {
        es: formData.title
      },
      description: {
        es: formData.description
      },
      image: formData.image,
      location: formData.location,
      distance: formData.distance,
      infoLink: formData.infoLink,
    }

    try {
      if (isEditing && currentActivity) {
        // Update existing document
        const activityRef = doc(db, "activities", currentActivity.id)
        await updateDoc(activityRef, activityData)
        
        setActivities(activities.map((activity) => 
          activity.id === currentActivity.id ? { ...activityData, id: currentActivity.id } : activity
        ))
        
        toast({
          title: "Éxito",
          description: "Actividad actualizada correctamente.",
        })
      } else {
        // Add new document
        const docRef = await addDoc(collection(db, "activities"), activityData)
        
        setActivities([...activities, { ...activityData, id: docRef.id }])
        
        toast({
          title: "Éxito",
          description: "Actividad creada correctamente.",
        })
      }
    } catch (error) {
      console.error("Error saving activity:", error)
      toast({
        title: "Error",
        description: isEditing 
          ? "No se pudo actualizar la actividad." 
          : "No se pudo crear la actividad.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setIsDialogOpen(false)
    }
  }

  const getDisplayValue = (activity, field) => {
    // Si el valor es un objeto con idiomas, intenta obtener el valor en el idioma actual
    if (activity[field] && typeof activity[field] === 'object') {
      return activity[field][language] || activity[field].es || ''
    }
    // Si es un valor directo, devuélvelo
    return activity[field] || ''
  }

  // Función para limitar el tamaño de la previsualización de imagen
  const getImagePreview = (imageData) => {
    if (!imageData) return "/placeholder.svg?height=600&width=800"
    return imageData
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">Actividades</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90" disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir nueva
        </Button>
      </div>

      {loading && <p className="text-center py-10">Cargando actividades...</p>}

      {!loading && activities.length === 0 && (
        <p className="text-center py-10">No hay actividades. ¡Agrega una nueva actividad!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={getImagePreview(activity.image)}
                alt={getDisplayValue(activity, 'title')}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{getDisplayValue(activity, 'title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{activity.distance}</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {getDisplayValue(activity, 'description')}
                </p>
                
                {activity.infoLink && (
                  <div className="flex items-center text-blue-600 hover:text-blue-800">
                    <a href={activity.infoLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>Más información</span>
                    </a>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(activity)} disabled={loading}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(activity)} disabled={loading}>
                    <Trash className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Activity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !loading && setIsDialogOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar actividad" : "Añadir actividad"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="distance">Distancia</Label>
                <Input id="distance" name="distance" value={formData.distance} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="infoLink">Enlace para más información</Label>
              <Input 
                id="infoLink" 
                name="infoLink" 
                type="url" 
                value={formData.infoLink} 
                onChange={handleInputChange} 
                placeholder="https://ejemplo.com/mas-informacion"
              />
              <p className="text-xs text-gray-500 mt-1">Añade un enlace para que los usuarios puedan obtener más información</p>
            </div>

            <div>
              <Label htmlFor="imageUpload">Imagen</Label>
              <div className="flex gap-2">
                <Input 
                  id="imageUpload" 
                  name="imageUpload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
              </div>
              {formData.image && (
                <div className="mt-2 relative h-40 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={formData.image}
                    alt="Activity preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green hover:bg-green/90" 
                disabled={loading}
              >
                {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !loading && setIsDeleteDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p>
            ¿Estás seguro que deseas eliminar la actividad "{getDisplayValue(currentActivity || {}, 'title')}"?
            Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}