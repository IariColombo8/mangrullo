"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label" 
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { Star, Plus, Edit, Trash, Check, X, Upload } from "lucide-react"

import { db } from "@/lib/firebase"
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore"

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const testimonialsCollection = collection(db, "testimonials")
      const testimonialsSnapshot = await getDocs(testimonialsCollection)
      const testimonialsList = testimonialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTestimonials(testimonialsList)
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los testimonios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        title: t("admin.testimonials.deleteSuccess"),
        description: t("admin.testimonials.deleteSuccessMessage"),
      })
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el testimonio",
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
      [name]: name === "rating" ? Number(value) : value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.match('image.*')) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive"
        })
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 2MB",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
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
        setTestimonials(testimonials.map((t) => 
          t.id === currentTestimonial.id ? { 
            ...t, 
            ...testimonialData,
            id: currentTestimonial.id 
          } : t
        ))
        toast({
          title: t("admin.testimonials.updateSuccess"),
          description: t("admin.testimonials.updateSuccessMessage"),
        })
      } else {
        testimonialData.createdAt = serverTimestamp()
        const docRef = await addDoc(collection(db, "testimonials"), testimonialData)
        setTestimonials([...testimonials, { 
          ...testimonialData, 
          id: docRef.id,
          createdAt: new Date()
        }])
        toast({
          title: t("admin.testimonials.addSuccess"),
          description: t("admin.testimonials.addSuccessMessage"),
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving testimonial:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el testimonio",
        variant: "destructive"
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
        updatedAt: serverTimestamp()
      })
      setTestimonials(testimonials.map((t) => 
        t.id === testimonial.id ? { 
          ...t, 
          status: newStatus,
          updatedAt: new Date()
        } : t
      ))
      toast({
        title: newStatus === "approved" 
          ? t("admin.testimonials.approveSuccess") 
          : t("admin.testimonials.rejectSuccess"),
        description: newStatus === "approved"
          ? t("admin.testimonials.approveSuccessMessage")
          : t("admin.testimonials.rejectSuccessMessage"),
      })
    } catch (error) {
      console.error("Error updating testimonial status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del testimonio",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.testimonials.title")}</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90">
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.testimonials.addNew")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sección de testimonios pendientes */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t("admin.testimonials.pendingReviews")}</h3>
            {testimonials.filter((t) => t.status === "pending").length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">{t("admin.testimonials.noPendingReviews")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials
                  .filter((t) => t.status === "pending")
                  .map((testimonial) => (
                    <TestimonialCard 
                      key={testimonial.id}
                      testimonial={testimonial}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      language={language}
                      t={t}
                      isPending={true}
                    />
                  ))}
              </div>
            )}
          </section>

          {/* Sección de testimonios aprobados */}
          <section>
            <h3 className="text-lg font-semibold mb-4">{t("admin.testimonials.approvedReviews")}</h3>
            {testimonials.filter((t) => t.status === "approved").length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">{t("admin.testimonials.noApprovedReviews")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials
                  .filter((t) => t.status === "approved")
                  .map((testimonial) => (
                    <TestimonialCard 
                      key={testimonial.id}
                      testimonial={testimonial}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      language={language}
                      t={t}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Diálogo para añadir/editar testimonios */}
      <TestimonialDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        t={t}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={currentTestimonial?.name}
        t={t}
      />
    </div>
  )
}

// Componente de tarjeta de testimonio
function TestimonialCard({ testimonial, onEdit, onDelete, onStatusChange, language, t, isPending = false }) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={testimonial.image || "/placeholder-user.jpg"}
              alt={testimonial.name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
              <Badge 
                variant={isPending ? "outline" : "default"} 
                className={isPending ? "text-yellow-600 border-yellow-600" : "bg-green"}
              >
                {isPending ? t("admin.testimonials.pending") : t("admin.testimonials.approved")}
              </Badge>
            </div>

            <div className="flex my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
            </div>

            <p className="text-gray-700 mt-2">
              {testimonial.text?.[language] || testimonial.text?.en || "No description available"}
            </p>

            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(testimonial)}
                className="h-8"
              >
                <Edit className="h-3 w-3 mr-1" />
                {t("admin.testimonials.edit")}
              </Button>
              
              {isPending ? (
                <>
                  <Button
                    className="bg-green hover:bg-green/90 h-8"
                    size="sm"
                    onClick={() => onStatusChange(testimonial, "approved")}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {t("admin.testimonials.approve")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onStatusChange(testimonial, "rejected")}
                    className="h-8"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t("admin.testimonials.reject")}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(testimonial)}
                  className="h-8"
                >
                  <Trash className="h-3 w-3 mr-1" />
                  {t("admin.testimonials.delete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de diálogo para formulario de testimonio
function TestimonialDialog({ isOpen, onOpenChange, formData, onInputChange, onImageUpload, onSubmit, isEditing, t }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("admin.testimonials.editTestimonial") : t("admin.testimonials.addTestimonial")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("admin.testimonials.form.name")}</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={onInputChange} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="location">{t("admin.testimonials.form.location")}</Label>
              <Input 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={onInputChange} 
                required 
              />
            </div>
          </div>



          <div>
            <Label htmlFor="image">{t("admin.testimonials.form.image")}</Label>
            <div className="flex flex-col gap-2">
              <Input 
                type="file" 
                id="image" 
                accept="image/*" 
                onChange={onImageUpload} 
                className="flex-1" 
              />
              {formData.image && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-500">{t("admin.testimonials.form.imagePreview")}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="textEs">{t("admin.testimonials.form.textEs")}</Label>
            <Textarea
              id="textEs"
              name="textEs"
              value={formData.textEs}
              onChange={onInputChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="textEn">{t("admin.testimonials.form.textEn")}</Label>
            <Textarea
              id="textEn"
              name="textEn"
              value={formData.textEn}
              onChange={onInputChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="textPt">{t("admin.testimonials.form.textPt")}</Label>
            <Textarea
              id="textPt"
              name="textPt"
              value={formData.textPt}
              onChange={onInputChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.testimonials.cancel")}
            </Button>
            <Button type="submit" className="bg-green hover:bg-green/90">
              {isEditing ? t("admin.testimonials.update") : t("admin.testimonials.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente de diálogo de confirmación para eliminar
function DeleteDialog({ isOpen, onOpenChange, onConfirm, itemName, t }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.testimonials.confirmDelete")}</DialogTitle>
        </DialogHeader>
        <p>
          {t("admin.testimonials.confirmDeleteMessage", {
            name: itemName || "este testimonio",
          })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.testimonials.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("admin.testimonials.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}