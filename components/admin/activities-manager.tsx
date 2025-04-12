"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { MapPin, Calendar, Plus, Edit, Trash, Upload } from "lucide-react"
import { Label } from "@/components/ui/label"

// This would come from your Firebase in a real app
const initialActivities = [
  {
    id: 1,
    title: {
      es: "Termas de Federación",
      en: "Federación Hot Springs",
      pt: "Termas de Federación",
    },
    description: {
      es: "Disfrute de las aguas termales a solo 10 minutos de nuestras cabañas. Las termas de Federación son conocidas por sus propiedades curativas y relajantes.",
      en: "Enjoy the hot springs just 10 minutes from our cabins. Federación hot springs are known for their healing and relaxing properties.",
      pt: "Desfrute das águas termais a apenas 10 minutos de nossas cabanas. As termas de Federación são conhecidas por suas propriedades curativas e relaxantes.",
    },
    image: "/placeholder.svg?height=600&width=800",
    location: "Federación, Entre Ríos",
    distance: "10 min",
  },
  {
    id: 2,
    title: {
      es: "Pesca en el Río Uruguay",
      en: "Fishing in Uruguay River",
      pt: "Pesca no Rio Uruguai",
    },
    description: {
      es: "El Río Uruguay ofrece excelentes oportunidades para la pesca deportiva. Dorados, surubíes y otras especies abundan en estas aguas.",
      en: "The Uruguay River offers excellent opportunities for sport fishing. Golden fish, catfish and other species abound in these waters.",
      pt: "O Rio Uruguai oferece excelentes oportunidades para a pesca esportiva. Dourados, surubis e outras espécies abundam nestas águas.",
    },
    image: "/placeholder.svg?height=600&width=800",
    location: "Río Uruguay",
    distance: "5 min",
  },
  {
    id: 3,
    title: {
      es: "Reserva Natural Chaviyú",
      en: "Chaviyú Nature Reserve",
      pt: "Reserva Natural Chaviyú",
    },
    description: {
      es: "Explore la belleza natural de la reserva Chaviyú, con senderos para caminatas, observación de aves y contacto directo con la naturaleza.",
      en: "Explore the natural beauty of the Chaviyú reserve, with hiking trails, bird watching and direct contact with nature.",
      pt: "Explore a beleza natural da reserva Chaviyú, com trilhas para caminhadas, observação de pássaros e contato direto com a natureza.",
    },
    image: "/placeholder.svg?height=600&width=800",
    location: "Chaviyú, Entre Ríos",
    distance: "15 min",
  },
]

export default function ActivitiesManager() {
  const [activities, setActivities] = useState(initialActivities)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<null | (typeof activities)[0]>(null)
  const [isEditing, setIsEditing] = useState(false)
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
    image: "/placeholder.svg?height=600&width=800",
  })

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
      image: "/placeholder.svg?height=600&width=800",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (activity: (typeof activities)[0]) => {
    setIsEditing(true)
    setCurrentActivity(activity)
    setFormData({
      titleEs: activity.title.es,
      titleEn: activity.title.en,
      titlePt: activity.title.pt,
      descriptionEs: activity.description.es,
      descriptionEn: activity.description.en,
      descriptionPt: activity.description.pt,
      location: activity.location,
      distance: activity.distance,
      image: activity.image,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (activity: (typeof activities)[0]) => {
    setCurrentActivity(activity)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentActivity) {
      setActivities(activities.filter((activity) => activity.id !== currentActivity.id))
      toast({
        title: t("admin.activities.deleteSuccess"),
        description: t("admin.activities.deleteSuccessMessage"),
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newActivity = {
      id: isEditing && currentActivity ? currentActivity.id : Date.now(),
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
      image: formData.image,
      location: formData.location,
      distance: formData.distance,
    }

    if (isEditing && currentActivity) {
      setActivities(activities.map((activity) => (activity.id === currentActivity.id ? newActivity : activity)))
      toast({
        title: t("admin.activities.updateSuccess"),
        description: t("admin.activities.updateSuccessMessage"),
      })
    } else {
      setActivities([...activities, newActivity])
      toast({
        title: t("admin.activities.addSuccess"),
        description: t("admin.activities.addSuccessMessage"),
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.activities.title")}</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90">
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.activities.addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={activity.image || "/placeholder.svg"}
                alt={activity.title[language as keyof typeof activity.title]}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{activity.title[language as keyof typeof activity.title]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{t("admin.activities.distance", { distance: activity.distance })}</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {activity.description[language as keyof typeof activity.description]}
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t("admin.activities.edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(activity)}>
                    <Trash className="h-4 w-4 mr-1" />
                    {t("admin.activities.delete")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Activity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("admin.activities.editActivity") : t("admin.activities.addActivity")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleEs">{t("admin.activities.form.titleEs")}</Label>
                <Input id="titleEs" name="titleEs" value={formData.titleEs} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="titleEn">{t("admin.activities.form.titleEn")}</Label>
                <Input id="titleEn" name="titleEn" value={formData.titleEn} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="titlePt">{t("admin.activities.form.titlePt")}</Label>
              <Input id="titlePt" name="titlePt" value={formData.titlePt} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">{t("admin.activities.form.location")}</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="distance">{t("admin.activities.form.distance")}</Label>
                <Input id="distance" name="distance" value={formData.distance} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="image">{t("admin.activities.form.image")}</Label>
              <div className="flex gap-2">
                <Input id="image" name="image" value={formData.image} onChange={handleInputChange} className="flex-1" />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("admin.activities.form.upload")}
                </Button>
              </div>
              <div className="mt-2 relative h-40 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={formData.image || "/placeholder.svg?height=600&width=800"}
                  alt="Activity preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descriptionEs">{t("admin.activities.form.descriptionEs")}</Label>
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
              <Label htmlFor="descriptionEn">{t("admin.activities.form.descriptionEn")}</Label>
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
              <Label htmlFor="descriptionPt">{t("admin.activities.form.descriptionPt")}</Label>
              <Textarea
                id="descriptionPt"
                name="descriptionPt"
                value={formData.descriptionPt}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("admin.activities.cancel")}
              </Button>
              <Button type="submit" className="bg-green hover:bg-green/90">
                {isEditing ? t("admin.activities.update") : t("admin.activities.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.activities.confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p>
            {t("admin.activities.confirmDeleteMessage", {
              name: currentActivity?.title[language as keyof typeof currentActivity.title],
            })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("admin.activities.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("admin.activities.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
