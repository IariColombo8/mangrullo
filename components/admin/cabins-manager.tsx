"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useLanguage } from "@/context/language-context";
import {
  Edit,
  Trash,
  Plus,
  Upload,
  Wifi,
  Wind,
  Thermometer,
  PawPrint,
  X,
  ImageIcon,
  Users,
  DollarSign,
  MapPin,
  Search,
  Grid3X3,
  List,
  Check,
  Snowflake,
  Droplets,
  Tv,
  UtensilsCrossed,
  Coffee,
  CookingPot,
  Bed,
  Eye,
} from "lucide-react";

// Firebase imports
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

// Tipos de moneda
const CURRENCY_TYPES = {
  USD: { symbol: "$", label: "Dólares (USD)" },
  UYU: { symbol: "$U", label: "Pesos Uruguayos (UYU)" },
};

export default function CabinsManager() {
  const [cabins, setCabins] = useState([]);
  const [filteredCabins, setFilteredCabins] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCabin, setCurrentCabin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const { language } = useLanguage();
  const { toast } = useToast();
  const MAX_IMAGES = 10;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 0,
    images: [],
    floor: "", // "upper" o "lower"
    amenities: {
      balconyView: false, // Balcón con vista al parque y la piscina
      ac: false,
      fridge: false,
      microwave: false,
      kettle: false,
      electricPot: false,
      dishes: false,
      waterHeater: false,
      tv: false,
      wifi: false,
      bedding: false,
      blankets: false,
      towels: false,
    },
  });

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "cabins"));
      const cabinsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCabins(cabinsData);
      setFilteredCabins(cabinsData);
    } catch (error) {
      console.error("Error al cargar los departamentos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los departamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCabins(cabins);
    } else {
      const filtered = cabins.filter((cabin) => {
        const name = getCabinName(cabin).toLowerCase();
        const description = getCabinDescription(cabin).toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || description.includes(query);
      });
      setFilteredCabins(filtered);
    }
  }, [searchQuery, cabins]);

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentCabin(null);
    setImages([]);
    setFormData({
      name: "",
      description: "",
      capacity: 0,
      images: [],
      floor: "",
      amenities: {
        balconyView: false,
        ac: false,
        fridge: false,
        microwave: false,
        kettle: false,
        electricPot: false,
        dishes: false,
        waterHeater: false,
        tv: false,
        wifi: false,
        bedding: false,
        blankets: false,
        towels: false,
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (cabin) => {
    setIsEditing(true);
    setCurrentCabin(cabin);

    const cabinImages = Array.isArray(cabin.images)
      ? cabin.images
      : cabin.image
        ? [cabin.image]
        : [];
    setImages(cabinImages);

    // Manejar ambos formatos: string directo o objeto {es, en, pt}
    const cabinName =
      typeof cabin.name === "string"
        ? cabin.name
        : cabin.name?.es || cabin.name?.en || "";
    const cabinDescription =
      typeof cabin.description === "string"
        ? cabin.description
        : cabin.description?.es || cabin.description?.en || "";

    // Manejar amenities: array antiguo o objeto nuevo
    let amenitiesObj = {
      balconyView: false,
      ac: false,
      fridge: false,
      microwave: false,
      kettle: false,
      electricPot: false,
      dishes: false,
      waterHeater: false,
      tv: false,
      wifi: false,
      bedding: false,
      blankets: false,
      towels: false,
    };

    if (cabin.amenities) {
      if (
        typeof cabin.amenities === "object" &&
        !Array.isArray(cabin.amenities)
      ) {
        amenitiesObj = { ...amenitiesObj, ...cabin.amenities };
      } else if (Array.isArray(cabin.amenities)) {
        // Convertir array antiguo a objeto nuevo
        cabin.amenities.forEach((item) => {
          if (amenitiesObj.hasOwnProperty(item)) {
            amenitiesObj[item] = true;
          }
          // Compatibilidad con valores antiguos
          if (
            item === "balcony" ||
            item === "parkView" ||
            item === "poolView"
          ) {
            amenitiesObj.balconyView = true;
          }
        });
      }
    }

    setFormData({
      name: cabinName,
      description: cabinDescription,
      capacity: cabin.capacity || 0,
      images: cabinImages,
      floor: cabin.floor || "",
      amenities: amenitiesObj,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (cabin) => {
    setCurrentCabin(cabin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentCabin) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "cabins", currentCabin.id));
      setCabins(cabins.filter((cabin) => cabin.id !== currentCabin.id));
      toast({
        title: "Departamento eliminado",
        description: "El departamento ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error al eliminar el departamento:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el departamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "capacity" ? Number(value) : value,
    }));
  };

  const handleAmenityChange = (amenity, checked) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked,
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > MAX_IMAGES) {
      toast({
        title: "Límite de imágenes",
        description: `Solo se permiten ${MAX_IMAGES} imágenes por departamento.`,
        variant: "destructive",
      });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setImages((prev) => [...prev, compressedBase64]);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, compressedBase64],
          }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = null;
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cabinData = {
        name: formData.name,
        description: formData.description,
        images: formData.images,
        image: formData.images[0] || "",
        capacity: formData.capacity,
        floor: formData.floor,
        amenities: formData.amenities,
        updatedAt: new Date(),
      };

      if (isEditing && currentCabin) {
        await updateDoc(doc(db, "cabins", currentCabin.id), cabinData);
        setCabins(
          cabins.map((cabin) =>
            cabin.id === currentCabin.id
              ? { id: currentCabin.id, ...cabinData }
              : cabin,
          ),
        );
        toast({
          title: "Departamento actualizado",
          description: "El departamento ha sido actualizado exitosamente.",
        });
      } else {
        cabinData.createdAt = new Date();
        const docRef = await addDoc(collection(db, "cabins"), cabinData);
        const newCabin = { id: docRef.id, ...cabinData };
        setCabins([...cabins, newCabin]);
        toast({
          title: "Departamento agregado",
          description: "El nuevo departamento ha sido agregado exitosamente.",
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar el departamento:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el departamento"
          : "No se pudo agregar el departamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMainImage = (cabin) => {
    if (Array.isArray(cabin.images) && cabin.images.length > 0) {
      return cabin.images[0];
    }
    return cabin.image || "";
  };

  const getCabinName = (cabin) => {
    if (!cabin) return "Sin nombre";
    if (typeof cabin.name === "string") {
      return cabin.name;
    }
    if (typeof cabin.name === "object" && cabin.name !== null) {
      return cabin.name.es || cabin.name.en || cabin.name.pt || "Sin nombre";
    }
    return "Sin nombre";
  };

  const getCabinDescription = (cabin) => {
    if (!cabin) return "Sin descripción";
    if (typeof cabin.description === "string") {
      return cabin.description;
    }
    if (typeof cabin.description === "object" && cabin.description !== null) {
      return (
        cabin.description.es ||
        cabin.description.en ||
        cabin.description.pt ||
        "Sin descripción"
      );
    }
    return "Sin descripción";
  };

  const getAmenityInfo = (key) => {
    const amenities = {
      balconyView: {
        icon: <Eye className="h-4 w-4" />,
        label: "Balcón con vista al parque y la piscina",
      },
      ac: {
        icon: <Snowflake className="h-4 w-4" />,
        label: "Aire acondicionado",
      },
      fridge: { icon: <Snowflake className="h-4 w-4" />, label: "Heladera" },
      microwave: {
        icon: <UtensilsCrossed className="h-4 w-4" />,
        label: "Microondas",
      },
      kettle: { icon: <Coffee className="h-4 w-4" />, label: "Pava eléctrica" },
      electricPot: {
        icon: <CookingPot className="h-4 w-4" />,
        label: "Olla eléctrica",
      },
      dishes: {
        icon: <UtensilsCrossed className="h-4 w-4" />,
        label: "Vajilla completa",
      },
      waterHeater: {
        icon: <Droplets className="h-4 w-4" />,
        label: "Termotanque",
      },
      tv: { icon: <Tv className="h-4 w-4" />, label: "TV" },
      wifi: { icon: <Wifi className="h-4 w-4" />, label: "WiFi" },
      bedding: { icon: <Bed className="h-4 w-4" />, label: "Sábanas" },
      blankets: { icon: <Bed className="h-4 w-4" />, label: "Frazadas" },
      towels: { icon: <Bed className="h-4 w-4" />, label: "Toallas" },
    };
    return amenities[key] || { icon: null, label: key };
  };

  const CabinCardSkeleton = () => (
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
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Gestión de Departamentos
          </h2>
          <p className="text-slate-600 mt-1">
            Gestiona todos los departamentos disponibles
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nuevo Departamento
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar departamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filteredCabins.length} departamentos
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

      {isLoading && !isDialogOpen && !isDeleteDialogOpen ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {[...Array(6)].map((_, i) => (
            <CabinCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCabins.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery
                ? "No se encontraron departamentos"
                : "No hay departamentos disponibles"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Comienza agregando tu primer departamento"}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddNew}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Departamento
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
        >
          {filteredCabins.map((cabin) => (
            <Card
              key={cabin.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative aspect-square overflow-hidden">
                {getMainImage(cabin) ? (
                  <Image
                    src={getMainImage(cabin) || "/placeholder.svg"}
                    alt={cabin.name || "Departamento"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">Sin imagen</p>
                  </div>
                )}
                {Array.isArray(cabin.images) && cabin.images.length > 1 && (
                  <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-0">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {cabin.images.length}
                  </Badge>
                )}
                {cabin.floor && (
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0">
                    {cabin.floor === "upper" ? "Planta Alta" : "Planta Baja"}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">
                  {getCabinName(cabin)}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {getCabinDescription(cabin)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-slate-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{cabin.capacity} personas</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cabin)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cabin)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !isLoading && setIsDialogOpen(open)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing ? "Editar Departamento" : "Agregar Departamento"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Imágenes
                  </TabsTrigger>
                  <TabsTrigger value="amenities">¿Qué incluye?</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Departamento</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Departamento Vista Parque"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="min-h-[100px]"
                      placeholder="Describe el departamento..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidad</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="pl-10"
                          placeholder="4"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floor">Ubicación</Label>
                      <select
                        id="floor"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="upper">Planta Alta</option>
                        <option value="lower">Planta Baja</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Imágenes del Departamento
                        </Label>
                        <p className="text-sm text-slate-600">
                          Sube hasta {MAX_IMAGES} imágenes. La primera será la
                          imagen principal.
                        </p>
                      </div>
                      <Badge variant="outline">
                        {images.length}/{MAX_IMAGES}
                      </Badge>
                    </div>

                    {images.length < MAX_IMAGES && (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          multiple
                        />
                        <Label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">
                            Haz clic para subir imágenes
                          </p>
                          <p className="text-xs text-slate-500">
                            PNG, JPG hasta 10MB cada una
                          </p>
                        </Label>
                      </div>
                    )}

                    {images.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">
                          No hay imágenes cargadas
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
                          >
                            <Image
                              src={img || "/placeholder.svg"}
                              alt={`Imagen ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white border-0">
                                Principal
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-6 pt-6">
                  <div>
                    <Label className="text-base font-medium">
                      El departamento cuenta con:
                    </Label>
                    <p className="text-sm text-slate-600 mb-4">
                      Selecciona las comodidades disponibles
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-emerald-700">
                          Vista y Espacios
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {["balconyView"].map((key) => {
                            const info = getAmenityInfo(key);
                            return (
                              <Card key={key} className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    id={key}
                                    checked={formData.amenities[key]}
                                    onCheckedChange={(checked) =>
                                      handleAmenityChange(key, checked)
                                    }
                                  />
                                  <Label
                                    htmlFor={key}
                                    className="flex items-center cursor-pointer flex-1"
                                  >
                                    <div className="text-emerald-600 mr-2">
                                      {info.icon}
                                    </div>
                                    <span className="font-medium">
                                      {info.label}
                                    </span>
                                  </Label>
                                  {formData.amenities[key] && (
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-emerald-700">
                          Equipamiento Completo
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            "ac",
                            "fridge",
                            "microwave",
                            "kettle",
                            "electricPot",
                            "dishes",
                            "waterHeater",
                            "tv",
                            "wifi",
                          ].map((key) => {
                            const info = getAmenityInfo(key);
                            return (
                              <Card key={key} className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    id={key}
                                    checked={formData.amenities[key]}
                                    onCheckedChange={(checked) =>
                                      handleAmenityChange(key, checked)
                                    }
                                  />
                                  <Label
                                    htmlFor={key}
                                    className="flex items-center cursor-pointer flex-1"
                                  >
                                    <div className="text-emerald-600 mr-2">
                                      {info.icon}
                                    </div>
                                    <span className="font-medium">
                                      {info.label}
                                    </span>
                                  </Label>
                                  {formData.amenities[key] && (
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-emerald-700">
                          Ropa de Cama Incluida
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {["bedding", "blankets", "towels"].map((key) => {
                            const info = getAmenityInfo(key);
                            return (
                              <Card key={key} className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Switch
                                    id={key}
                                    checked={formData.amenities[key]}
                                    onCheckedChange={(checked) =>
                                      handleAmenityChange(key, checked)
                                    }
                                  />
                                  <Label
                                    htmlFor={key}
                                    className="flex items-center cursor-pointer flex-1"
                                  >
                                    <div className="text-emerald-600 mr-2">
                                      {info.icon}
                                    </div>
                                    <span className="font-medium">
                                      {info.label}
                                    </span>
                                  </Label>
                                  {formData.amenities[key] && (
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : isEditing ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isLoading && setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar {getCabinName(currentCabin)}
              ?
              <br />
              <span className="text-red-600 font-medium">
                Esta acción no se puede deshacer.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
