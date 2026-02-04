"use client";

import { useEffect, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import type { PrecioNoche, Reserva } from "@/types/reserva";
import { calculateNights, checkOverlap } from "./utilidadesReserva";

export default function FormularioReservaMultiple({
  formData,
  setFormData,
  cabins,
  reservas,
  editingReserva,
  departamentosSeleccionados,
  setDepartamentosSeleccionados,
  departamentosDetalles,
  setDepartamentosDetalles,
  checkinPopoverOpen,
  setCheckinPopoverOpen,
  checkoutPopoverOpen,
  setCheckoutPopoverOpen,
}: any) {
  const hasValidDates =
    formData.fechaInicio &&
    formData.fechaFin &&
    formData.fechaFin > formData.fechaInicio;

  const availableCabins = useMemo(() => {
    if (!hasValidDates) return [];
    return cabins.filter((cabin: any) => {
      return !checkOverlap(
        (reservas || []) as Reserva[],
        cabin.name,
        formData.fechaInicio,
        formData.fechaFin,
        editingReserva?.id
      );
    });
  }, [cabins, reservas, formData.fechaInicio, formData.fechaFin, hasValidDates, editingReserva]);

  useEffect(() => {
    if (!hasValidDates) return;
    const availableNames = new Set(availableCabins.map((c: any) => c.name));
    const filtered = departamentosSeleccionados.filter((d: string) => availableNames.has(d));
    if (filtered.length !== departamentosSeleccionados.length) {
      setDepartamentosSeleccionados(filtered);
      const newDetalles = new Map(departamentosDetalles);
      Array.from(newDetalles.keys()).forEach((key) => {
        if (!availableNames.has(key)) newDetalles.delete(key);
      });
      setDepartamentosDetalles(newDetalles);
    }
  }, [availableCabins, hasValidDates, departamentosSeleccionados, departamentosDetalles, setDepartamentosSeleccionados, setDepartamentosDetalles]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-emerald-200">
        <div className="space-y-2">
          <Label className="text-emerald-900 font-semibold text-sm">
            Fecha de Entrada *
          </Label>
          <Popover
            open={checkinPopoverOpen}
            onOpenChange={setCheckinPopoverOpen}
          >
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
      </div>

      <div className="space-y-2">
        <Label className="text-emerald-900 font-semibold text-sm">
          Selecciona Departamentos ({departamentosSeleccionados.length}/4) *
        </Label>
        {!hasValidDates && (
          <div className="p-3 text-sm text-gray-600 border border-emerald-200 rounded-lg bg-white/50">
            Selecciona fecha de entrada y salida para ver disponibilidad.
          </div>
        )}
        {hasValidDates && availableCabins.length === 0 && (
          <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50/40">
            En esta fecha no hay departamentos disponibles.
          </div>
        )}
        {hasValidDates && availableCabins.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-emerald-200 rounded-lg bg-white/50">
            {availableCabins.map((cabin: any) => {
              const isSelected = departamentosSeleccionados.includes(cabin.name);
              const isDisabled =
                !isSelected && departamentosSeleccionados.length >= 4;

              return (
                <div
                  key={cabin.id}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-md transition-colors",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !isDisabled && "hover:bg-emerald-50"
                  )}
                >
                  <Checkbox
                    id={`cabin-${cabin.id}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => {
                      if (isDisabled) return;
                      if (checked) {
                        setDepartamentosSeleccionados([
                          ...departamentosSeleccionados,
                          cabin.name,
                        ]);
                      } else {
                        setDepartamentosSeleccionados(
                          departamentosSeleccionados.filter(
                            (d: string) => d !== cabin.name
                          )
                        );
                        const newDetalles = new Map(departamentosDetalles);
                        newDetalles.delete(cabin.name);
                        setDepartamentosDetalles(newDetalles);
                      }
                    }}
                    className="border-emerald-300"
                  />
                  <Label
                    htmlFor={`cabin-${cabin.id}`}
                    className={cn(
                      "text-sm font-medium cursor-pointer",
                      isDisabled && "cursor-not-allowed"
                    )}
                  >
                    {cabin.name}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {departamentosSeleccionados.map((dept: string) => {
          const detalle = departamentosDetalles.get(dept) || {
            departamento: dept,
            cantidadAdultos: 1,
            cantidadMenores: 0,
            precioNoche: { [formData.moneda || "AR"]: 0 },
            precioTotal: 0,
          };
          return (
            <div
              key={dept}
              className="border border-emerald-200 p-4 rounded-lg bg-white/50"
            >
              <h4 className="font-semibold text-base text-emerald-900 mb-3">
                {dept}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-emerald-800">Adultos</Label>
                  <Input
                    type="number"
                    value={detalle.cantidadAdultos}
                    onChange={(e) => {
                      const newDetalles = new Map(departamentosDetalles);
                      newDetalles.set(dept, {
                        ...detalle,
                        cantidadAdultos: Number(e.target.value),
                      });
                      setDepartamentosDetalles(newDetalles);
                    }}
                    min={1}
                    className="border-emerald-300 text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-emerald-800">Menores</Label>
                  <Input
                    type="number"
                    value={detalle.cantidadMenores}
                    onChange={(e) => {
                      const newDetalles = new Map(departamentosDetalles);
                      newDetalles.set(dept, {
                        ...detalle,
                        cantidadMenores: Number(e.target.value),
                      });
                      setDepartamentosDetalles(newDetalles);
                    }}
                    min={0}
                    className="border-emerald-300 text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-emerald-800">
                    Precio/Noche ({formData.moneda})
                  </Label>
                  <Input
                    type="number"
                    value={
                      detalle.precioNoche[
                        formData.moneda as keyof PrecioNoche
                      ] || 0
                    }
                    onChange={(e) => {
                      const currentCurrency =
                        formData.moneda as keyof PrecioNoche;
                      const newDetalles = new Map(departamentosDetalles);
                      const updatedDetalle = {
                        ...detalle,
                        precioNoche: {
                          ...detalle.precioNoche,
                          [currentCurrency]: Number(e.target.value),
                        },
                      };
                      updatedDetalle.precioTotal =
                        (Number(e.target.value) || 0) *
                        calculateNights(
                          formData.fechaInicio,
                          formData.fechaFin
                        );
                      newDetalles.set(dept, updatedDetalle);
                      setDepartamentosDetalles(newDetalles);
                    }}
                    min={0}
                    className="border-emerald-300 text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-emerald-800">
                    Precio Total
                  </Label>
                  <Input
                    type="number"
                    value={detalle.precioTotal}
                    readOnly
                    className="border-emerald-300 text-sm h-9 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
