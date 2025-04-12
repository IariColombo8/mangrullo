"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { Star, Plus, Edit, Trash, Check, X, Upload } from "lucide-react"

// This would come from your Firebase in a real app
const initialTestimonials = [
  {
    id: 1,
    name: "María Rodríguez",
    location: "Buenos Aires, Argentina",
    rating: 5,
    text: {
      es: "Pasamos unas vacaciones increíbles en El Mangrullo. Las cabañas son hermosas y el entorno natural es espectacular. Volveremos pronto!",
      en: "We had an amazing vacation at El Mangrullo. The cabins are beautiful and the natural environment is spectacular. We will be back soon!",
      pt: "Passamos férias incríveis em El Mangrullo. As cabanas são lindas e o ambiente natural é espetacular. Voltaremos em breve!",
    },
    image: "/placeholder.svg?height=100&width=100",
    status: "approved",
  },
  {
    id: 2,
    name: "John Smith",
    location: "New York, USA",
    rating: 5,
    text: {
      es: "Una experiencia única en contacto con la naturaleza. Las cabañas son muy cómodas y el personal es muy amable. Recomendado!",
      en: "A unique experience in contact with nature. The cabins are very comfortable and the staff is very friendly. Recommended!",
      pt: "Uma experiência única em contato com a natureza. As cabanas são muito confortáveis e a equipe é muito simpática. Recomendado!",
    },
    image: "/placeholder.svg?height=100&width=100",
    status: "approved",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    location: "Porto Alegre, Brasil",
    rating: 4,
    text: {
      es: "Excelente lugar para descansar y disfrutar de la naturaleza. Las termas cercanas son un plus. Muy recomendable.",
      en: "Excellent place to rest and enjoy nature. The nearby hot springs are a plus. Highly recommended.",
      pt: "Excelente lugar para descansar e desfrutar da natureza. As termas próximas são um diferencial. Muito recomendável.",
    },
    image: "/placeholder.svg?height=100&width=100",
    status: "approved",
  },
  {
    id: 4,
    name: "Ana García",
    location: "Córdoba, Argentina",
    rating: 5,
    text: {
      es: "Lugar hermoso y tranquilo. Las cabañas son muy cómodas y limpias. El personal es muy atento. Volveremos!",
      en: "Beautiful and quiet place. The cabins are very comfortable and clean. The staff is very attentive. We will be back!",
      pt: "Lugar lindo e tranquilo. As cabanas são muito confortáveis e limpas. A equipe é muito atenciosa. Voltaremos!",
    },
    image: "/placeholder.svg?height=100&width=100",
    status: "pending",
  },
]

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<null | (typeof testimonials)[0]>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    textEs: "",
    textEn: "",
    textPt: "",
    image: "/placeholder.svg?height=100&width=100",
  })

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
      image: "/placeholder.svg?height=100&width=100",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (testimonial: (typeof testimonials)[0]) => {
    setIsEditing(true)
    setCurrentTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      location: testimonial.location,
      rating: testimonial.rating,
      textEs: testimonial.text.es,
      textEn: testimonial.text.en,
      textPt: testimonial.text.pt,
      image: testimonial.image,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (testimonial: (typeof testimonials)[0]) => {
    setCurrentTestimonial(testimonial)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentTestimonial) {
      setTestimonials(testimonials.filter((t) => t.id !== currentTestimonial.id))
      toast({
        title: t("admin.testimonials.deleteSuccess"),
        description: t("admin.testimonials.deleteSuccessMessage"),
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newTestimonial = {
      id: isEditing && currentTestimonial ? currentTestimonial.id : Date.now(),
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
    }

    if (isEditing && currentTestimonial) {
      setTestimonials(testimonials.map((t) => (t.id === currentTestimonial.id ? newTestimonial : t)))
      toast({
        title: t("admin.testimonials.updateSuccess"),
        description: t("admin.testimonials.updateSuccessMessage"),
      })
    } else {
      setTestimonials([...testimonials, newTestimonial])
      toast({
        title: t("admin.testimonials.addSuccess"),
        description: t("admin.testimonials.addSuccessMessage"),
      })
    }

    setIsDialogOpen(false)
  }

  const handleStatusChange = (testimonial: (typeof testimonials)[0], newStatus: string) => {
    setTestimonials(testimonials.map((t) => (t.id === testimonial.id ? { ...t, status: newStatus } : t)))

    toast({
      title: newStatus === "approved" ? t("admin.testimonials.approveSuccess") : t("admin.testimonials.rejectSuccess"),
      description:
        newStatus === "approved"
          ? t("admin.testimonials.approveSuccessMessage")
          : t("admin.testimonials.rejectSuccessMessage"),
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.testimonials.title")}</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90">
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.testimonials.addNew")}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("admin.testimonials.pendingReviews")}</h3>

          <div className="space-y-4">
            {testimonials.filter((t) => t.status === "pending").length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t("admin.testimonials.noPendingReviews")}</p>
            ) : (
              testimonials
                .filter((t) => t.status === "pending")
                .map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{testimonial.name}</h4>
                              <p className="text-sm text-gray-500">{testimonial.location}</p>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              {t("admin.testimonials.pending")}
                            </Badge>
                          </div>

                          <div className="flex my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>

                          <p className="text-gray-700 mt-2">
                            {testimonial.text[language as keyof typeof testimonial.text]}
                          </p>

                          <div className="flex justify-end mt-4 space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                              <Edit className="h-4 w-4 mr-1" />
                              {t("admin.testimonials.edit")}
                            </Button>
                            <Button
                              className="bg-green hover:bg-green/90"
                              size="sm"
                              onClick={() => handleStatusChange(testimonial, "approved")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {t("admin.testimonials.approve")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(testimonial, "rejected")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {t("admin.testimonials.reject")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t("admin.testimonials.approvedReviews")}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials
              .filter((t) => t.status === "approved")
              .map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-sm text-gray-500">{testimonial.location}</p>
                          </div>
                          <Badge className="bg-green">{t("admin.testimonials.approved")}</Badge>
                        </div>

                        <div className="flex my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 mt-2 line-clamp-3">
                          {testimonial.text[language as keyof typeof testimonial.text]}
                        </p>

                        <div className="flex justify-end mt-4 space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                            <Edit className="h-4 w-4 mr-1" />
                            {t("admin.testimonials.edit")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(testimonial)}>
                            <Trash className="h-4 w-4 mr-1" />
                            {t("admin.testimonials.delete")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Testimonial Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("admin.testimonials.editTestimonial") : t("admin.testimonials.addTestimonial")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.testimonials.form.name")}
                </label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.testimonials.form.location")}
                </label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.testimonials.form.rating")}
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= formData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.testimonials.form.image")}
              </label>
              <div className="flex gap-2">
                <Input id="image" name="image" value={formData.image} onChange={handleInputChange} className="flex-1" />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("admin.testimonials.form.upload")}
                </Button>
              </div>
              <div className="mt-2 flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={formData.image || "/placeholder.svg?height=100&width=100"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm text-gray-500">{t("admin.testimonials.form.imagePreview")}</span>
              </div>
            </div>

            <div>
              <label htmlFor="textEs" className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.testimonials.form.textEs")}
              </label>
              <Textarea
                id="textEs"
                name="textEs"
                value={formData.textEs}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="textEn" className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.testimonials.form.textEn")}
              </label>
              <Textarea
                id="textEn"
                name="textEn"
                value={formData.textEn}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="textPt" className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.testimonials.form.textPt")}
              </label>
              <Textarea
                id="textPt"
                name="textPt"
                value={formData.textPt}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("admin.testimonials.cancel")}
              </Button>
              <Button type="submit" className="bg-green hover:bg-green/90">
                {isEditing ? t("admin.testimonials.update") : t("admin.testimonials.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.testimonials.confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p>
            {t("admin.testimonials.confirmDeleteMessage", {
              name: currentTestimonial?.name,
            })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("admin.testimonials.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("admin.testimonials.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
