"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Edit,
  Trash,
  Search,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  Grid3X3,
  List,
  Mountain,
  Waves,
  TreePine,
  Camera,
  Car,
  X,
} from "lucide-react";

// Firebase imports
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const ACTIVITY_CATEGORIES = [
  {
    id: "adventure",
    name: "Aventura",
    icon: Mountain,
    color: "bg-orange-500",
    lightColor: "bg-orange-100",
  },
  {
    id: "nature",
    name: "Naturaleza",
    icon: TreePine,
    color: "bg-green-500",
    lightColor: "bg-green-100",
  },
  {
    id: "water",
    name: "Acuáticas",
    icon: Waves,
    color: "bg-blue-500",
    lightColor: "bg-blue-100",
  },
  {
    id: "cultural",
    name: "Cultural",
    icon: Camera,
    color: "bg-purple-500",
    lightColor: "bg-purple-100",
  },
  {
    id: "transport",
    name: "Transporte",
    icon: Car,
    color: "bg-gray-500",
    lightColor: "bg-gray-100",
  },
];

const DIFFICULTY_LEVELS = [
  { id: "easy", name: "Fácil", color: "bg-green-500" },
  { id: "moderate", name: "Moderado", color: "bg-yellow-500" },
  { id: "hard", name: "Difícil", color: "bg-red-500" },
];

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  duration: string;
  difficulty: string;
  category: string;
  price: number;
  maxParticipants: number;
  image: string;
  infoLink: string;
  included: string;
  requirements: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    distance: "",
    duration: "",
    difficulty: "easy",
    category: "adventure",
    price: 0,
    maxParticipants: 0,
    image: "",
    infoLink: "",
    included: "",
    requirements: "",
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      console.log("[v0] Fetching activities from Firestore...");
      const activitiesCollection = collection(db, "activities");
      const activitiesQuery = query(
        activitiesCollection,
        orderBy("createdAt", "desc"),
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      console.log("[v0] Activities snapshot size:", activitiesSnapshot.size);

      const activitiesList = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Activity[];

      console.log("[v0] Activities loaded:", activitiesList.length);
      setActivities(activitiesList);
      setFilteredActivities(activitiesList);
    } catch (error) {
      console.error("[v0] Error fetching activities:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = activities;

    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.location
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          activity.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.category === categoryFilter,
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.difficulty === difficultyFilter,
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, categoryFilter, difficultyFilter, activities]);

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentActivity(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      distance: "",
      duration: "",
      difficulty: "easy",
      category: "adventure",
      price: 0,
      maxParticipants: 0,
      image: "",
      infoLink: "",
      included: "",
      requirements: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setIsEditing(true);
    setCurrentActivity(activity);
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      location: activity.location || "",
      distance: activity.distance || "",
      duration: activity.duration || "",
      difficulty: activity.difficulty || "easy",
      category: activity.category || "adventure",
      price: activity.price || 0,
      maxParticipants: activity.maxParticipants || 0,
      image: activity.image || "",
      infoLink: activity.infoLink || "",
      included: activity.included || "",
      requirements: activity.requirements || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setCurrentActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentActivity) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "activities", currentActivity.id));
      setActivities(activities.filter((a) => a.id !== currentActivity.id));
      toast({
        title: "Actividad eliminada",
        description: "La actividad ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "maxParticipants" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const activityData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        distance: formData.distance,
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category,
        price: formData.price,
        maxParticipants: formData.maxParticipants,
        image: formData.image,
        infoLink: formData.infoLink,
        included: formData.included,
        requirements: formData.requirements,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && currentActivity) {
        await updateDoc(
          doc(db, "activities", currentActivity.id),
          activityData,
        );
        setActivities(
          activities.map((a) =>
            a.id === currentActivity.id
              ? {
                  ...a,
                  ...activityData,
                }
              : a,
          ),
        );
        toast({
          title: "Actividad actualizada",
          description: "La actividad ha sido actualizada exitosamente.",
        });
      } else {
        const docRef = await addDoc(collection(db, "activities"), {
          ...activityData,
          createdAt: serverTimestamp(),
        });
        setActivities([
          {
            ...activityData,
            id: docRef.id,
          } as Activity,
          ...activities,
        ]);
        toast({
          title: "Actividad agregada",
          description: "La nueva actividad ha sido agregada exitosamente.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return (
      ACTIVITY_CATEGORIES.find((cat) => cat.id === categoryId) ||
      ACTIVITY_CATEGORIES[0]
    );
  };

  const getDifficultyInfo = (difficultyId: string) => {
    return (
      DIFFICULTY_LEVELS.find((diff) => diff.id === difficultyId) ||
      DIFFICULTY_LEVELS[0]
    );
  };

  const ActivityCardSkeleton = () => (
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
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    total: activities.length,
    byCategory: ACTIVITY_CATEGORIES.map((cat) => ({
      ...cat,
      count: activities.filter((a) => a.category === cat.id).length,
    })),
    avgPrice:
      activities.length > 0
        ? (
            activities.reduce((acc, a) => acc + (a.price || 0), 0) /
            activities.length
          ).toFixed(0)
        : 0,
    totalCapacity: activities.reduce(
      (acc, a) => acc + (a.maxParticipants || 0),
      0,
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Gestión de Actividades
          </h2>
          <p className="text-slate-600 mt-1">
            Administra todas las actividades y experiencias disponibles
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nueva Actividad
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {stats.total}
            </div>
            <div className="text-sm text-slate-600">Total Actividades</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              ${stats.avgPrice}
            </div>
            <div className="text-sm text-slate-600">Precio Promedio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCapacity}
            </div>
            <div className="text-sm text-slate-600">Capacidad Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byCategory.reduce(
                (max, cat) => (cat.count > max.count ? cat : max),
                { count: 0 },
              ).name || "N/A"}
            </div>
            <div className="text-sm text-slate-600">Categoría Popular</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categorías */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Distribución por Categorías
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.byCategory.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <div className={`p-2 rounded-full ${cat.color} text-white`}>
                <cat.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">{cat.count}</div>
                <div className="text-sm text-slate-600">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar actividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dificultades</SelectItem>
                {DIFFICULTY_LEVELS.map((diff) => (
                  <SelectItem key={diff.id} value={diff.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${diff.color}`}
                      ></div>
                      {diff.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filteredActivities.length} actividades
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

      {/* Lista de Actividades */}
      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-5" : "grid-cols-1"}`}
        >
          {[...Array(6)].map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ||
              categoryFilter !== "all" ||
              difficultyFilter !== "all"
                ? "No se encontraron actividades"
                : "No hay actividades disponibles"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery ||
              categoryFilter !== "all" ||
              difficultyFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando la primera actividad al sistema"}
            </p>
            {!searchQuery &&
              categoryFilter === "all" &&
              difficultyFilter === "all" && (
                <Button
                  onClick={handleAddNew}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Actividad
                </Button>
              )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5" : "grid-cols-1"}`}
        >
          {filteredActivities.map((activity) => {
            const categoryInfo = getCategoryInfo(activity.category);
            const difficultyInfo = getDifficultyInfo(activity.difficulty);

            return (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={
                      activity.image || "/placeholder.svg?height=200&width=400"
                    }
                    alt={activity.title || "Actividad"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${categoryInfo.color} text-white border-none`}
                    >
                      <categoryInfo.icon className="h-3 w-3 mr-1" />
                      {categoryInfo.name}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${difficultyInfo.color} text-white border-none`}
                    >
                      {difficultyInfo.name}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{activity.location}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                    {activity.description}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEdit(activity)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDelete(activity)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    {activity.infoLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(activity.infoLink, "_blank")}
                        disabled={isLoading}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog para agregar/editar actividad */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Actividad" : "Agregar Nueva Actividad"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Trekking al Cerro Champaquí"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Descripción detallada de la actividad..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Villa Alpina"
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distancia</Label>
                  <Input
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 15 km"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 6 horas"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio (USD)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">
                    Máximo de Participantes
                  </Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select
                    name="difficulty"
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((diff) => (
                        <SelectItem key={diff.id} value={diff.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${diff.color}`}
                            ></div>
                            {diff.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="infoLink">
                    Link de Información (opcional)
                  </Label>
                  <Input
                    id="infoLink"
                    name="infoLink"
                    type="url"
                    value={formData.infoLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="included">Qué incluye</Label>
                <Textarea
                  id="included"
                  name="included"
                  value={formData.included}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ej: Guía, transporte, almuerzo..."
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ej: Buen estado físico, ropa deportiva..."
                />
              </div>

              <div>
                <Label htmlFor="image">Imagen</Label>
                <div className="space-y-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {formData.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La actividad será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
