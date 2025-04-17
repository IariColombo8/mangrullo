"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { MapPin, Calendar } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase" // Asegúrate de tener configurado tu archivo firebase

// Define la interfaz para las actividades
interface Activity {
  id: string;
  title: {
    es: string;
    en: string;
    pt: string;
  };
  description: {
    es: string;
    en: string;
    pt: string;
  };
  image: string;
  location: string;
  distance: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { language, t } = useLanguage()
  const { user } = useAuth()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const activitiesCollection = collection(db, "activities")
        const activitiesSnapshot = await getDocs(activitiesCollection)
        
        const activitiesData: Activity[] = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Activity, 'id'>)
        }))
        
        setActivities(activitiesData)
        setError(null)
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError("Error al cargar las actividades")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <section id="activities" className="section-padding bg-beige">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("activities.title")}</h2>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Cargando actividades...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="activities" className="section-padding bg-beige">
        <div className="container-custom">
          <h2 className="section-title text-brown">{t("activities.title")}</h2>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
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