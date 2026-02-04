"use client";

import { useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReservaFormData, DepartamentoDetalle, Reserva } from "@/types/reserva";
import FormularioReservaMultiple from "./FormularioReservaMultiple";

interface SeccionFechasUbicacionProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
  cabins: { id: string; name: string }[];
  reservas: Reserva[];
  esReservaMultiple: boolean;
  setEsReservaMultiple: (value: boolean) => void;
  departamentosSeleccionados: string[];
  setDepartamentosSeleccionados: (value: string[]) => void;
  departamentosDetalles: Map<string, DepartamentoDetalle>;
  setDepartamentosDetalles: (value: Map<string, DepartamentoDetalle>) => void;
  editingReserva: any;
  checkinPopoverOpen: boolean;
  setCheckinPopoverOpen: (value: boolean) => void;
  checkoutPopoverOpen: boolean;
  setCheckoutPopoverOpen: (value: boolean) => void;
}

export default function SeccionFechasUbicacion(
  props: SeccionFechasUbicacionProps
) {
  useEffect(() => {
    if (!props.esReservaMultiple) {
      props.setEsReservaMultiple(true);
    }
  }, [props.esReservaMultiple, props.setEsReservaMultiple]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-emerald-100 shadow-sm">
      <h3 className="font-semibold text-base md:text-lg text-emerald-900 mb-4 flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
        Fechas y Ubicación
      </h3>

      {!props.editingReserva && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            id="esReservaMultiple"
            checked={true}
            disabled
            className="border-emerald-300"
          />
          <Label
            htmlFor="esReservaMultiple"
            className="font-semibold text-sm text-emerald-900 cursor-pointer"
          >
            Reserva Múltiple
          </Label>
        </div>
      )}

      <FormularioReservaMultiple {...props} />
    </div>
  );
}
