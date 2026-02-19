"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Car, ExternalLink } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Activity {
  id: string;
  title: string | { es: string; en?: string; pt?: string };
  description: string | { es: string; en?: string; pt?: string };
  image: string;
  location: string;
  distance: string;
  duration?: string;
  category?: string;
  difficulty?: string;
  infoLink?: string;
  included?: string;
  requirements?: string;
}

const getTitle = (activity: Activity) =>
  typeof activity.title === "string"
    ? activity.title
    : activity.title?.es || "Sin título";

const getDescription = (activity: Activity) =>
  typeof activity.description === "string"
    ? activity.description
    : activity.description?.es || "";

const CATEGORY_COLORS: Record<string, string> = {
  adventure: "#f97316",
  nature: "#15803d",
  water: "#3b82f6",
  cultural: "#a855f7",
  transport: "#6b7280",
};

const CATEGORY_NAMES: Record<string, string> = {
  adventure: "Aventura",
  nature: "Naturaleza",
  water: "Acuáticas",
  cultural: "Cultural",
  transport: "Transporte",
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesCollection = collection(db, "activities");
        const activitiesSnapshot = await getDocs(activitiesCollection);
        const activitiesData = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Activity[];
        setActivities(activitiesData);
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <section id="activities" className="section-padding bg-beige">
        <div className="container-custom">
          <h2 className="section-title text-brown">Actividades</h2>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Cargando actividades...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="activities" className="section-padding bg-beige">
      <div className="container-custom">
        <h2 className="section-title text-brown">Actividades</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Descubre las mejores experiencias cerca de El Mangrullo
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => {
                setSelectedActivity(activity);
                setIsDialogOpen(true);
              }}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={activity.image || "/placeholder.svg"}
                  alt={getTitle(activity)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {activity.category && (
                  <Badge
                    style={{
                      backgroundColor: CATEGORY_COLORS[activity.category || ""],
                    }}
                    className="absolute top-2 left-2 text-white border-none text-xs"
                  >
                    {CATEGORY_NAMES[activity.category] || activity.category}
                  </Badge>
                )}
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-brown text-sm md:text-base line-clamp-1 mb-1">
                  {getTitle(activity)}
                </h3>
                <div className="flex items-center text-gray-500 text-xs md:text-sm mb-3">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{activity.location}</span>
                </div>
                <Button className="w-full bg-green hover:bg-green/90 text-xs md:text-sm h-8 md:h-9">
                  Ver más
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal detalle */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
          {selectedActivity && (
            <>
              <div className="relative h-56 md:h-72 w-full">
                <Image
                  src={selectedActivity.image || "/placeholder.svg"}
                  alt={getTitle(selectedActivity)}
                  fill
                  className="object-cover"
                />
                {selectedActivity.category && (
                  <Badge
                    style={{
                      backgroundColor: CATEGORY_COLORS[selectedActivity?.category || ""],
                    }}
                    className="absolute top-2 left-2 text-white border-none text-xs"
                  >
                    {CATEGORY_NAMES[selectedActivity.category] ||
                      selectedActivity.category}
                  </Badge>
                )}
              </div>

              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl text-brown">
                    {getTitle(selectedActivity)}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap gap-3">
                  {selectedActivity.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      <MapPin className="h-4 w-4 text-green" />
                      {selectedActivity.location}
                    </div>
                  )}
                  {selectedActivity.distance && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      <Car className="h-4 w-4 text-green" />
                      {selectedActivity.distance}
                    </div>
                  )}
                  {selectedActivity.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                      <Clock className="h-4 w-4 text-green" />
                      {selectedActivity.duration}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {getDescription(selectedActivity)}
                </p>

                {selectedActivity.included && (
                  <div>
                    <p className="text-sm font-semibold text-brown mb-1">
                      Incluye:
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedActivity.included}
                    </p>
                  </div>
                )}

                {selectedActivity.requirements && (
                  <div>
                    <p className="text-sm font-semibold text-brown mb-1">
                      Requisitos:
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedActivity.requirements}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {selectedActivity.infoLink && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        window.open(selectedActivity.infoLink, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Más información
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-green hover:bg-green/90"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
