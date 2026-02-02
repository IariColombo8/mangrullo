"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { calculateNights } from "./utilidadesReserva";

export default function FormularioReservaSimple({
  formData,
  setFormData,
  cabins,
  checkinPopoverOpen,
  setCheckinPopoverOpen,
  checkoutPopoverOpen,
  setCheckoutPopoverOpen,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-emerald-900 font-semibold text-sm">
          Departamento *
        </Label>
        <Select
          value={formData.departamento}
          onValueChange={(value) =>
            setFormData({ ...formData, departamento: value })
          }
        >
          <SelectTrigger className="border-emerald-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cabins.map((cabin: any) => (
              <SelectItem key={cabin.id} value={cabin.name}>
                {cabin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-emerald-900 font-semibold text-sm">
          Fecha de Entrada *
        </Label>
        <Popover open={checkinPopoverOpen} onOpenChange={setCheckinPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent text-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.fechaInicio
                ? format(formData.fechaInicio, "dd/MM/yyyy")
                : "Selecciona"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.fechaInicio}
              onSelect={(date) => {
                if (date) {
                  setFormData({ ...formData, fechaInicio: date });
                  setCheckinPopoverOpen(false);
                }
              }}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-emerald-900 font-semibold text-sm">
          Fecha de Salida *
        </Label>
        <Popover
          open={checkoutPopoverOpen}
          onOpenChange={setCheckoutPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-emerald-200 hover:bg-emerald-50 bg-transparent text-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.fechaFin
                ? format(formData.fechaFin, "dd/MM/yyyy")
                : "Selecciona"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.fechaFin}
              onSelect={(date) => {
                if (date) {
                  setFormData({ ...formData, fechaFin: date });
                  setCheckoutPopoverOpen(false);
                }
              }}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-600 font-semibold text-sm">Noches</Label>
        <div className="flex items-center h-10 px-4 border-2 border-emerald-300 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
          <span className="text-lg md:text-xl font-bold text-emerald-700">
            {calculateNights(formData.fechaInicio, formData.fechaFin)}
          </span>
        </div>
      </div>
    </div>
  );
}
