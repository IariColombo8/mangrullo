"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReservaFormData, PrecioNoche } from "@/types/reserva";
import { calculateNights } from "./utilidadesReserva";

interface CamposPreciosSimpleProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
}

const parseNumericInput = (raw: string): number => {
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return cleaned === "" ? 0 : parseFloat(cleaned);
};

const formatNum = (value: number | undefined | null): string => {
  if (!value) return "";
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export default function CamposPreciosSimple({
  formData,
  setFormData,
}: CamposPreciosSimpleProps) {
  const currency = formData.moneda as keyof PrecioNoche;
  const precioNocheVal = formData.precioNoche[currency] || 0;
  const nights = calculateNights(formData.fechaInicio, formData.fechaFin);

  const handlePrecioNoche = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseNumericInput(e.target.value);
    if (!isNaN(numValue)) {
      setFormData({
        ...formData,
        precioNoche: { ...formData.precioNoche, [currency]: numValue },
        precioTotal: numValue * nights,
      });
    }
  };

  const handleSimpleNumeric =
    (field: "precioImpuestos" | "precioGanancia") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseNumericInput(e.target.value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, [field]: numValue });
      }
    };

  return (
    <>
      {/* Precio por Noche */}
      <div className="space-y-2">
        <Label
          htmlFor="precioNoche"
          className="text-green-900 font-semibold text-sm"
        >
          Precio por Noche ({formData.moneda})
        </Label>
        <Input
          id="precioNoche"
          type="text"
          value={formatNum(precioNocheVal)}
          onChange={handlePrecioNoche}
          placeholder="0"
          className="border-green-200 focus:border-green-400"
        />
        <p className="text-xs text-gray-500">
          {nights} noche(s) × ${" "}
          {precioNocheVal.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Precio Total */}
      <div className="space-y-2">
        <Label
          htmlFor="precioTotal"
          className="text-green-900 font-semibold text-sm"
        >
          Precio Total *
        </Label>
        <Input
          id="precioTotal"
          type="text"
          value={formatNum(formData.precioTotal)}
          placeholder="0"
          required
        readOnly
        className="border-green-200 focus:border-green-400 bg-gray-50"
        />
      </div>

      {/* Impuestos */}
      <div className="space-y-2">
        <Label
          htmlFor="precioImpuestos"
          className="text-green-900 font-semibold text-sm"
        >
          Impuestos
        </Label>
        <Input
          id="precioImpuestos"
          type="text"
          value={formatNum(formData.precioImpuestos)}
          onChange={handleSimpleNumeric("precioImpuestos")}
          placeholder="0"
          className="border-green-200 focus:border-green-400"
        />
      </div>

      {/* Ganancia */}
      <div className="space-y-2">
        <Label
          htmlFor="precioGanancia"
          className="text-green-900 font-semibold text-sm"
        >
          Ganancia
        </Label>
        <Input
          id="precioGanancia"
          type="text"
          value={formatNum(formData.precioGanancia)}
          onChange={handleSimpleNumeric("precioGanancia")}
          placeholder="0"
          className="border-green-200 focus:border-green-400"
        />
      </div>
    </>
  );
}
