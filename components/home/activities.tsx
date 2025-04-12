"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { MapPin, Calendar, Plus } from "lucide-react"

// This would come from your Firebase in a real app
const activities = [
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
    image: "termas.jpg",
    location: "Federación, Entre Ríos",
    distance: "4 min",
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
    image: "pesca.jpg",
    location: "Río Uruguay",
    distance: "8 min",
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
    image: "chaviyu.jpg",
    location: "Chaviyú, Entre Ríos",
    distance: "30 min",
  },
]

export default function Activities() {
  const [selectedActivity, setSelectedActivity] = useState<null | (typeof activities)[0]>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { language, t } = useLanguage()
  const { user } = useAuth()

  const handleActivityClick = (activity: (typeof activities)[0]) => {
    setSelectedActivity(activity)
    setIsDialogOpen(true)
  }

  return (
    <section id="activities" className="section-padding bg-beige">
      <div className="container-custom">
        <h2 className="section-title text-brown">{t("activities.title")}</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">{t("activities.subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="relative h-48">
                <Image
                  src={activity.image || "/placeholder.svg"}
                  alt={activity.title[language as keyof typeof activity.title]}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-brown mb-2">
                  {activity.title[language as keyof typeof activity.title]}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{t("activities.distance", { distance: activity.distance })}</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {activity.description[language as keyof typeof activity.description]}
                </p>
              </div>
            </div>
          ))}

          {/* Add Activity Button (Admin only) */}
          {user && (
            <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white/80 transition-colors">
              <div className="bg-green/10 text-green rounded-full p-4 mb-4">
                <Plus size={24} />
              </div>
              <h3 className="text-xl font-bold text-brown mb-2">{t("activities.addNew")}</h3>
              <p className="text-gray-600 text-center">{t("activities.addNewDescription")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-brown">
                  {selectedActivity.title[language as keyof typeof selectedActivity.title]}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedActivity.image || "/placeholder.svg"}
                    alt={selectedActivity.title[language as keyof typeof selectedActivity.title]}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1 text-green" />
                    <span>{selectedActivity.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-1 text-green" />
                    <span>{t("activities.distance", { distance: selectedActivity.distance })}</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600">
                    {selectedActivity.description[language as keyof typeof selectedActivity.description]}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-green hover:bg-green/90" onClick={() => setIsDialogOpen(false)}>
                    {t("activities.close")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
