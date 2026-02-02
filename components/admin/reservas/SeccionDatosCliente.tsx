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
import type { ReservaFormData } from "@/types/reserva";
import { PAISES } from "./constantesReserva";

interface SeccionDatosClienteProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
  esReservaMultiple: boolean;
}

export default function SeccionDatosCliente({
  formData,
  setFormData,
  esReservaMultiple,
}: SeccionDatosClienteProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-blue-100 shadow-sm">
      <h3 className="font-semibold text-base md:text-lg text-blue-900 mb-4">
        Datos del Cliente
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor="nombre"
            className="text-blue-900 font-semibold text-sm"
          >
            Nombre Completo *
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Juan Pérez"
            required
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* País */}
        <div className="space-y-2">
          <Label htmlFor="pais" className="text-blue-900 font-semibold text-sm">
            País *
          </Label>
          <Select
            value={formData.pais}
            onValueChange={(value) => setFormData({ ...formData, pais: value })}
          >
            <SelectTrigger className="border-blue-200 focus:border-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAISES.map((pais) => (
                <SelectItem key={pais.code} value={pais.code}>
                  {pais.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label
            htmlFor="numero"
            className="text-blue-900 font-semibold text-sm"
          >
            Teléfono
          </Label>
          <Input
            id="numero"
            value={formData.numero}
            onChange={(e) =>
              setFormData({ ...formData, numero: e.target.value })
            }
            placeholder="+54 11 1234-5678"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        {/* Cantidad de Adultos y Menores - Solo para reserva simple */}
        {!esReservaMultiple && (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="cantidadAdultos"
                className="text-blue-900 font-semibold text-sm"
              >
                Cantidad de Adultos
              </Label>
              <Input
                id="cantidadAdultos"
                type="number"
                value={formData.cantidadAdultos || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cantidadAdultos: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="border-blue-200 focus:border-blue-400"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cantidadMenores"
                className="text-blue-900 font-semibold text-sm"
              >
                Cantidad de Menores
              </Label>
              <Input
                id="cantidadMenores"
                type="number"
                value={formData.cantidadMenores || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cantidadMenores: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="border-blue-200 focus:border-blue-400"
                min={0}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
