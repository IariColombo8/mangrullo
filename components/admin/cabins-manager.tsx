"use client"

import type React from "react"

import { useState } from "react"
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
import { Edit, Trash, Plus, Upload, Wifi, Wind, Thermometer, PawPrint } from "lucide-react"

// This would come from your Firebase in a real app
const initialCabins = [
  {
    id: 1,
    name: {
      es: "Cabaña Río",
      en: "River Cabin",
      pt: "Cabana Rio",
    },
    description: {
      es: "Hermosa cabaña con vista al río, perfecta para parejas o familias pequeñas.",
      en: "Beautiful cabin with river view, perfect for couples or small families.",
      pt: "Linda cabana com vista para o rio, perfeita para casais ou famílias pequenas.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 120,
    capacity: 4,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
  {
    id: 2,
    name: {
      es: "Cabaña Bosque",
      en: "Forest Cabin",
      pt: "Cabana Floresta",
    },
    description: {
      es: "Rodeada de naturaleza, esta cabaña ofrece tranquilidad y confort.",
      en: "Surrounded by nature, this cabin offers tranquility and comfort.",
      pt: "Rodeada pela natureza, esta cabana oferece tranquilidade e conforto.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 140,
    capacity: 6,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
  {
    id: 3,
    name: {
      es: "Cabaña Lago",
      en: "Lake Cabin",
      pt: "Cabana Lago",
    },
    description: {
      es: "Con acceso directo al lago, ideal para los amantes de la pesca y la naturaleza.",
      en: "With direct access to the lake, ideal for fishing and nature lovers.",
      pt: "Com acesso direto ao lago, ideal para os amantes da pesca e da natureza.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 160,
    capacity: 8,
    amenities: ["wifi", "ac", "kitchen"],
  },
  {
    id: 4,
    name: {
      es: "Cabaña Montaña",
      en: "Mountain Cabin",
      pt: "Cabana Montanha",
    },
    description: {
      es: "Ubicada en lo alto, con vistas panorámicas y todas las comodidades.",
      en: "Located at the top, with panoramic views and all amenities.",
      pt: "Localizada no alto, com vistas panorâmicas e todas as comodidades.",
    },
    image: "/placeholder.svg?height=600&width=800",
    price: 180,
    capacity: 10,
    amenities: ["wifi", "ac", "pets", "kitchen"],
  },
]

export default function CabinsManager() {
  const [cabins, setCabins] = useState(initialCabins)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCabin, setCurrentCabin] = useState<null | (typeof cabins)[0]>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { language, t } = useLanguage()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nameEs: "",
    nameEn: "",
    namePt: "",
    descriptionEs: "",
    descriptionEn: "",
    descriptionPt: "",
    price: 0,
    capacity: 0,
    image: "",
    amenities: {
      wifi: false,
      ac: false,
      pets: false,
      kitchen: false,
    },
  })

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrentCabin(null)
    setFormData({
      nameEs: "",
      nameEn: "",
      namePt: "",
      descriptionEs: "",
      descriptionEn: "",
      descriptionPt: "",
      price: 0,
      capacity: 0,
      image: "/placeholder.svg?height=600&width=800",
      amenities: {
        wifi: false,
        ac: false,
        pets: false,
        kitchen: false,
      },
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (cabin: (typeof cabins)[0]) => {
    setIsEditing(true)
    setCurrentCabin(cabin)
    setFormData({
      nameEs: cabin.name.es,
      nameEn: cabin.name.en,
      namePt: cabin.name.pt,
      descriptionEs: cabin.description.es,
      descriptionEn: cabin.description.en,
      descriptionPt: cabin.description.pt,
      price: cabin.price,
      capacity: cabin.capacity,
      image: cabin.image,
      amenities: {
        wifi: cabin.amenities.includes("wifi"),
        ac: cabin.amenities.includes("ac"),
        pets: cabin.amenities.includes("pets"),
        kitchen: cabin.amenities.includes("kitchen"),
      },
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (cabin: (typeof cabins)[0]) => {
    setCurrentCabin(cabin)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentCabin) {
      setCabins(cabins.filter((cabin) => cabin.id !== currentCabin.id))
      toast({
        title: t("admin.cabins.deleteSuccess"),
        description: t("admin.cabins.deleteSuccessMessage"),
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" ? Number(value) : value,
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amenitiesArray = Object.entries(formData.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key)

    const newCabin = {
      id: isEditing && currentCabin ? currentCabin.id : Date.now(),
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
      image: formData.image,
      price: formData.price,
      capacity: formData.capacity,
      amenities: amenitiesArray,
    }

    if (isEditing && currentCabin) {
      setCabins(cabins.map((cabin) => (cabin.id === currentCabin.id ? newCabin : cabin)))
      toast({
        title: t("admin.cabins.updateSuccess"),
        description: t("admin.cabins.updateSuccessMessage"),
      })
    } else {
      setCabins([...cabins, newCabin])
      toast({
        title: t("admin.cabins.addSuccess"),
        description: t("admin.cabins.addSuccessMessage"),
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown">{t("admin.cabins.title")}</h2>
        <Button onClick={handleAddNew} className="bg-green hover:bg-green/90">
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.cabins.addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabins.map((cabin) => (
          <Card key={cabin.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={cabin.image || "/placeholder.svg"}
                alt={cabin.name[language as keyof typeof cabin.name]}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{cabin.name[language as keyof typeof cabin.name]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 line-clamp-2">
                  {cabin.description[language as keyof typeof cabin.description]}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-green font-bold">${cabin.price}</span>
                    <span className="text-sm text-gray-500 ml-1">{t("admin.cabins.perNight")}</span>
                  </div>
                  <span className="text-sm text-gray-600">{t("admin.cabins.capacity", { count: cabin.capacity })}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cabin.amenities.map((amenity) => (
                    <div key={amenity} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {t(`admin.cabins.amenities.${amenity}`)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cabin)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t("admin.cabins.edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cabin)}>
                    <Trash className="h-4 w-4 mr-1" />
                    {t("admin.cabins.delete")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Cabin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? t("admin.cabins.editCabin") : t("admin.cabins.addCabin")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">{t("admin.cabins.tabs.general")}</TabsTrigger>
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

                <div>
                  <Label htmlFor="image">{t("admin.cabins.form.image")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("admin.cabins.form.upload")}
                    </Button>
                  </div>
                  <div className="mt-2 relative h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={formData.image || "/placeholder.svg?height=600&width=800"}
                      alt="Cabin preview"
                      fill
                      className="object-cover"
                    />
                  </div>
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
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("admin.cabins.cancel")}
              </Button>
              <Button type="submit" className="bg-green hover:bg-green/90">
                {isEditing ? t("admin.cabins.update") : t("admin.cabins.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.cabins.confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p>
            {t("admin.cabins.confirmDeleteMessage", {
              name: currentCabin?.name[language as keyof typeof currentCabin.name],
            })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("admin.cabins.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("admin.cabins.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
