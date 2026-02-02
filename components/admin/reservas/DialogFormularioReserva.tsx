"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  ReservaFormData,
  Reserva,
  DepartamentoDetalle,
} from "@/types/reserva";
import SeccionFechasUbicacion from "./SeccionFechasUbicacion";
import SeccionDatosCliente from "./SeccionDatosCliente";
import SeccionOrigen from "./SeccionOrigen";
import SeccionPrecios from "./SeccionPrecios";
import SeccionEstado from "./SeccionEstado";

interface DialogFormularioReservaProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
  editingReserva: Reserva | null;
  cabins: { id: string; name: string }[];
  esReservaMultiple: boolean;
  setEsReservaMultiple: (value: boolean) => void;
  departamentosSeleccionados: string[];
  setDepartamentosSeleccionados: (value: string[]) => void;
  departamentosDetalles: Map<string, DepartamentoDetalle>;
  setDepartamentosDetalles: (value: Map<string, DepartamentoDetalle>) => void;
  checkinPopoverOpen: boolean;
  setCheckinPopoverOpen: (value: boolean) => void;
  checkoutPopoverOpen: boolean;
  setCheckoutPopoverOpen: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function DialogFormularioReserva({
  isOpen,
  onClose,
  formData,
  setFormData,
  editingReserva,
  cabins,
  esReservaMultiple,
  setEsReservaMultiple,
  departamentosSeleccionados,
  setDepartamentosSeleccionados,
  departamentosDetalles,
  setDepartamentosDetalles,
  checkinPopoverOpen,
  setCheckinPopoverOpen,
  checkoutPopoverOpen,
  setCheckoutPopoverOpen,
  onSubmit,
}: DialogFormularioReservaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-gray-600">
            {editingReserva
              ? "Modifica los datos de la reserva existente"
              : "Completa los datos para crear una nueva reserva"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
          <SeccionFechasUbicacion
            formData={formData}
            setFormData={setFormData}
            cabins={cabins}
            esReservaMultiple={esReservaMultiple}
            setEsReservaMultiple={setEsReservaMultiple}
            departamentosSeleccionados={departamentosSeleccionados}
            setDepartamentosSeleccionados={setDepartamentosSeleccionados}
            departamentosDetalles={departamentosDetalles}
            setDepartamentosDetalles={setDepartamentosDetalles}
            editingReserva={editingReserva}
            checkinPopoverOpen={checkinPopoverOpen}
            setCheckinPopoverOpen={setCheckinPopoverOpen}
            checkoutPopoverOpen={checkoutPopoverOpen}
            setCheckoutPopoverOpen={setCheckoutPopoverOpen}
          />

          <SeccionDatosCliente
            formData={formData}
            setFormData={setFormData}
            esReservaMultiple={esReservaMultiple}
          />

          <SeccionOrigen formData={formData} setFormData={setFormData} />

          <SeccionPrecios
            formData={formData}
            setFormData={setFormData}
            esReservaMultiple={esReservaMultiple}
            departamentosDetalles={departamentosDetalles}
            setDepartamentosDetalles={setDepartamentosDetalles}
          />

          <SeccionEstado formData={formData} setFormData={setFormData} />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
            >
              {editingReserva ? "Guardar Cambios" : "Crear Reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
