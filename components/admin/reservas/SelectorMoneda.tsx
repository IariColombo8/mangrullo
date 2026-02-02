"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ReservaFormData,
  PrecioNoche,
  DepartamentoDetalle,
} from "@/types/reserva";
import { PAISES } from "./constantesReserva";
import { calculateNights } from "./utilidadesReserva";

interface SelectorMonedaProps {
  formData: ReservaFormData;
  setFormData: (
    data: ReservaFormData | ((prev: ReservaFormData) => ReservaFormData)
  ) => void;
  esReservaMultiple: boolean;
  departamentosDetalles: Map<string, DepartamentoDetalle>;
  setDepartamentosDetalles: (value: Map<string, DepartamentoDetalle>) => void;
}

export default function SelectorMoneda({
  formData,
  setFormData,
  esReservaMultiple,
  departamentosDetalles,
  setDepartamentosDetalles,
}: SelectorMonedaProps) {
  const handleMonedaChange = (value: string) => {
    const currentPrecioNoche = formData.precioNoche || { pesos: 0 };
    const existingValue = currentPrecioNoche[value as keyof PrecioNoche] || 0;

    setFormData((prev: ReservaFormData) => {
      const newFormData = { ...prev, moneda: value };

      if (esReservaMultiple) {
        const updatedDetalles = new Map<string, DepartamentoDetalle>();
        departamentosDetalles.forEach((detalle, dept) => {
          const currentPrecio =
            detalle.precioNoche[value as keyof PrecioNoche] || 0;
          updatedDetalles.set(dept, {
            ...detalle,
            precioNoche: { ...detalle.precioNoche, [value]: currentPrecio },
            precioTotal:
              currentPrecio * calculateNights(prev.fechaInicio, prev.fechaFin),
          });
        });
        setDepartamentosDetalles(updatedDetalles);
        const totalGeneral = Array.from(updatedDetalles.values()).reduce(
          (sum, d) => sum + d.precioTotal,
          0
        );
        newFormData.precioTotal = totalGeneral;
      } else {
        newFormData.precioNoche = {
          ...currentPrecioNoche,
          [value]: existingValue,
        };
        newFormData.precioTotal =
          prev.precioTotal === 0
            ? existingValue * calculateNights(prev.fechaInicio, prev.fechaFin)
            : prev.precioTotal;
      }
      return newFormData;
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="moneda" className="text-green-900 font-semibold text-sm">
        Moneda
      </Label>
      <Select value={formData.moneda} onValueChange={handleMonedaChange}>
        <SelectTrigger className="border-green-200 focus:border-green-400">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAISES.map((pais) => (
            <SelectItem key={pais.code} value={pais.code}>
              {pais.name} ({pais.currency})
            </SelectItem>
          ))}
          <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
          <SelectItem value="EUR">Euro (EUR)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
