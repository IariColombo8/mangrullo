"use client";

import { Input } from "@/components/ui/input";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
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
import { Lock, Edit, Trash2 } from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DateRange } from "react-day-picker";

const DEPARTMENTS = [
  { id: "dept1", name: "Departamento Vista Mar" },
  { id: "dept2", name: "Departamento Vista Montaña" },
  { id: "dept3", name: "Departamento Centro" },
  { id: "dept4", name: "Departamento Premium" },
];

interface BlockDatesFormData {
  dateRange: DateRange | undefined;
  selectedDepartments: string[];
  notes: string;
  blockType: "maintenance" | "personal" | "other";
}

interface Booking {
  id: string;
  departmentId: string;
  guestName: string;
  guestEmail?: string;
  bookingType: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  notes?: string;
  status: string;
}

export default function AdvancedBookingManager() {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [blockFormData, setBlockFormData] = useState<BlockDatesFormData>({
    dateRange: undefined,
    selectedDepartments: [],
    notes: "",
    blockType: "maintenance",
  });

  const [editFormData, setEditFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    totalAmount: 0,
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      const snapshot = await getDocs(bookingsRef);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          checkIn: docData.checkIn?.toDate
            ? docData.checkIn.toDate()
            : new Date(docData.checkIn),
          checkOut: docData.checkOut?.toDate
            ? docData.checkOut.toDate()
            : new Date(docData.checkOut),
        } as Booking;
      });
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleBlockDates = async () => {
    if (!blockFormData.dateRange?.from || !blockFormData.dateRange?.to) {
      toast({
        title: "Error",
        description: "Por favor selecciona un rango de fechas",
        variant: "destructive",
      });
      return;
    }

    if (blockFormData.selectedDepartments.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona al menos un departamento",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create blocked bookings for each selected department
      const blockPromises = blockFormData.selectedDepartments.map((deptId) => {
        const blockData = {
          departmentId: deptId,
          guestName: `Bloqueado - ${blockFormData.blockType}`,
          bookingType: "blocked",
          checkIn: blockFormData.dateRange!.from,
          checkOut: blockFormData.dateRange!.to,
          guests: 0,
          totalAmount: 0,
          notes: blockFormData.notes,
          status: "blocked",
          createdAt: serverTimestamp(),
        };
        return addDoc(collection(db, "bookings"), blockData);
      });

      await Promise.all(blockPromises);

      toast({
        title: "Fechas bloqueadas exitosamente",
        description: `Se bloquearon ${blockFormData.selectedDepartments.length} departamento(s)`,
      });

      setIsBlockDialogOpen(false);
      setBlockFormData({
        dateRange: undefined,
        selectedDepartments: [],
        notes: "",
        blockType: "maintenance",
      });
      fetchBookings();
    } catch (error) {
      console.error("Error blocking dates:", error);
      toast({
        title: "Error",
        description: "No se pudieron bloquear las fechas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "bookings", selectedBooking.id));

      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido eliminada exitosamente",
      });

      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBooking = async () => {
    if (!selectedBooking) return;

    const newCheckIn = new Date(editFormData.checkIn);
    const newCheckOut = new Date(editFormData.checkOut);

    if (newCheckOut <= newCheckIn) {
      toast({
        title: "Error",
        description:
          "La fecha de salida debe ser posterior a la fecha de entrada",
        variant: "destructive",
      });
      return;
    }

    // Check for overlapping bookings
    const overlapping = bookings.some((booking) => {
      if (booking.id === selectedBooking.id) return false;
      if (booking.departmentId !== selectedBooking.departmentId) return false;

      return (
        (newCheckIn >= booking.checkIn && newCheckIn < booking.checkOut) ||
        (newCheckOut > booking.checkIn && newCheckOut <= booking.checkOut) ||
        (newCheckIn <= booking.checkIn && newCheckOut >= booking.checkOut)
      );
    });

    if (overlapping) {
      toast({
        title: "Error",
        description:
          "Las nuevas fechas se superponen con otra reserva existente",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guests: editFormData.guests,
        totalAmount: editFormData.totalAmount,
        notes: editFormData.notes,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Reserva actualizada",
        description: "Los cambios se guardaron exitosamente",
      });

      setIsEditDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error editing booking:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      checkIn: booking.checkIn.toISOString().split("T")[0],
      checkOut: booking.checkOut.toISOString().split("T")[0],
      guests: booking.guests,
      totalAmount: booking.totalAmount,
      notes: booking.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
  };

  const toggleDepartmentSelection = (deptId: string) => {
    setBlockFormData((prev) => ({
      ...prev,
      selectedDepartments: prev.selectedDepartments.includes(deptId)
        ? prev.selectedDepartments.filter((id) => id !== deptId)
        : [...prev.selectedDepartments, deptId],
    }));
  };

  const selectAllDepartments = () => {
    setBlockFormData((prev) => ({
      ...prev,
      selectedDepartments: DEPARTMENTS.map((d) => d.id),
    }));
  };

  const deselectAllDepartments = () => {
    setBlockFormData((prev) => ({
      ...prev,
      selectedDepartments: [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión Avanzada de Reservas</h2>
          <p className="text-slate-600">
            Bloquear fechas, editar y cancelar reservas
          </p>
        </div>
        <Button
          onClick={() => setIsBlockDialogOpen(true)}
          className="bg-slate-700 hover:bg-slate-800"
        >
          <Lock className="mr-2 h-4 w-4" />
          Bloquear Fechas
        </Button>
      </div>

      {/* Recent Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{booking.guestName}</p>
                  <p className="text-sm text-slate-600">
                    {
                      DEPARTMENTS.find((d) => d.id === booking.departmentId)
                        ?.name
                    }
                  </p>
                  <p className="text-xs text-slate-500">
                    {booking.checkIn.toLocaleDateString()} -{" "}
                    {booking.checkOut.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(booking)}
                    disabled={booking.bookingType === "blocked"}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openCancelDialog(booking)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Block Dates Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bloquear Fechas</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Date Range Picker */}
            <div>
              <Label>Seleccionar rango de fechas</Label>
              <div className="flex justify-center mt-2">
                <Calendar
                  mode="range"
                  selected={blockFormData.dateRange}
                  onSelect={(range) =>
                    setBlockFormData({ ...blockFormData, dateRange: range })
                  }
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Seleccionar departamentos</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllDepartments}
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllDepartments}
                  >
                    Ninguno
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={dept.id}
                      checked={blockFormData.selectedDepartments.includes(
                        dept.id
                      )}
                      onCheckedChange={() => toggleDepartmentSelection(dept.id)}
                    />
                    <Label
                      htmlFor={dept.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {dept.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Block Type */}
            <div>
              <Label htmlFor="blockType">Motivo del bloqueo</Label>
              <select
                id="blockType"
                className="w-full mt-2 p-2 border rounded-md"
                value={blockFormData.blockType}
                onChange={(e) =>
                  setBlockFormData({
                    ...blockFormData,
                    blockType: e.target.value as
                      | "maintenance"
                      | "personal"
                      | "other",
                  })
                }
              >
                <option value="maintenance">Mantenimiento</option>
                <option value="personal">Uso personal</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Agregar notas sobre el bloqueo..."
                value={blockFormData.notes}
                onChange={(e) =>
                  setBlockFormData({ ...blockFormData, notes: e.target.value })
                }
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBlockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBlockDates}
              disabled={isLoading}
              className="bg-slate-700 hover:bg-slate-800"
            >
              {isLoading ? "Bloqueando..." : "Bloquear Fechas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCheckIn">Fecha de entrada</Label>
                <Input
                  id="editCheckIn"
                  type="date"
                  value={editFormData.checkIn}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      checkIn: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editCheckOut">Fecha de salida</Label>
                <Input
                  id="editCheckOut"
                  type="date"
                  value={editFormData.checkOut}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      checkOut: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGuests">Cantidad de personas</Label>
                <Input
                  id="editGuests"
                  type="number"
                  min="1"
                  value={editFormData.guests}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      guests: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editAmount">Monto total</Label>
                <Input
                  id="editAmount"
                  type="number"
                  min="0"
                  value={editFormData.totalAmount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      totalAmount: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editNotes">Notas</Label>
              <Textarea
                id="editNotes"
                value={editFormData.notes}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditBooking} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cancelación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la reserva de{" "}
              <span className="font-semibold">
                {selectedBooking?.guestName}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Cancelando..." : "Cancelar Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
