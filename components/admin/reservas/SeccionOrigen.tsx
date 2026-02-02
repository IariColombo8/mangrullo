"use client";

import { Input } from "@/components/ui/input";
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
  OrigenReserva,
  ContactoParticular,
} from "@/types/reserva";
import { ORIGENES, CONTACTOS_PARTICULARES } from "@/types/reserva";

interface SeccionOrigenProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
}

export default function SeccionOrigen({
  formData,
  setFormData,
}: SeccionOrigenProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-purple-100 shadow-sm">
      <h3 className="font-semibold text-base md:text-lg text-purple-900 mb-4">
        Origen de la Reserva
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origen */}
        <div className="space-y-2">
          <Label
            htmlFor="origen"
            className="text-purple-900 font-semibold text-sm"
          >
            Origen *
          </Label>
          <Select
            value={formData.origen}
            onValueChange={(value: OrigenReserva) =>
              setFormData({ ...formData, origen: value })
            }
          >
            <SelectTrigger className="border-purple-200 focus:border-purple-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORIGENES.map((origen) => (
                <SelectItem key={origen.value} value={origen.value}>
                  {origen.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contacto Particular - Solo si origen es "particular" */}
        {formData.origen === "particular" && (
          <div className="space-y-2">
            <Label
              htmlFor="contactoParticular"
              className="text-purple-900 font-semibold text-sm"
            >
              Contacto
            </Label>
            <Select
              value={formData.contactoParticular || ""}
              onValueChange={(value: ContactoParticular) =>
                setFormData({ ...formData, contactoParticular: value })
              }
            >
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {CONTACTOS_PARTICULARES.map((contacto) => (
                  <SelectItem key={contacto} value={contacto}>
                    {contacto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Número de Reserva Booking - Solo si origen es "booking" */}
        {formData.origen === "booking" && (
          <div className="space-y-2">
            <Label
              htmlFor="numeroReservaBooking"
              className="text-purple-900 font-semibold text-sm"
            >
              Nro. Reserva Booking
            </Label>
            <Input
              id="numeroReservaBooking"
              value={formData.numeroReservaBooking}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numeroReservaBooking: e.target.value,
                })
              }
              placeholder="Ej: 1234567890"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
