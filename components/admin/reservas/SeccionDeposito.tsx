"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReservaFormData } from "@/types/reserva";

interface SeccionDepositoProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
}

export default function SeccionDeposito({
  formData,
  setFormData,
}: SeccionDepositoProps) {
  const handleMontoDeposito = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, montoDeposito: numValue });
    }
  };

  const saldo = formData.precioTotal - (formData.montoDeposito || 0);

  return (
    <div className="pt-4 mt-4 border-t border-green-100">
      {/* Checkbox depósito */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hizoDeposito"
          checked={formData.hizoDeposito}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, hizoDeposito: checked as boolean })
          }
          className="border-green-300"
        />
        <Label
          htmlFor="hizoDeposito"
          className="font-semibold cursor-pointer text-green-900 text-sm"
        >
          ¿Hizo depósito?
        </Label>
      </div>

      {/* Campos visibles solo si hizo depósito */}
      {formData.hizoDeposito && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label
              htmlFor="montoDeposito"
              className="text-green-900 font-semibold text-sm"
            >
              Monto del Depósito (Seña)
            </Label>
            <Input
              id="montoDeposito"
              type="text"
              value={
                formData.montoDeposito
                  ? formData.montoDeposito.toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
                  : ""
              }
              onChange={handleMontoDeposito}
              placeholder="0"
              className="border-green-200 focus:border-green-400"
            />
            <p className="text-xs text-green-700 font-medium">
              Saldo: ${" "}
              {saldo.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Fecha del depósito */}
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold text-sm">
              Fecha del Depósito
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 hover:bg-green-50 bg-white text-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                  {formData.fechaDeposito
                    ? format(formData.fechaDeposito, "dd/MM/yyyy")
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.fechaDeposito}
                  onSelect={(date) =>
                    date && setFormData({ ...formData, fechaDeposito: date })
                  }
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
