"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReservaFormData } from "@/types/reserva";

interface CamposPreciosMultipleProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
}

export default function CamposPreciosMultiple({
  formData,
  setFormData,
}: CamposPreciosMultipleProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label
        htmlFor="precioTotalMultiple"
        className="text-green-900 font-semibold text-sm"
      >
        Precio Total de la Reserva Múltiple *
      </Label>
      <Input
        id="precioTotalMultiple"
        type="text"
        value={
          formData.precioTotal
            ? formData.precioTotal.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })
            : ""
        }
        placeholder="0"
        required
        readOnly
        className="border-green-200 focus:border-green-400 bg-gray-50"
      />
    </div>
  );
}
