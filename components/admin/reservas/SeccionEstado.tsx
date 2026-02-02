"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReservaFormData } from "@/types/reserva";
import { ESTADOS_RESERVA } from "./constantesReserva";

interface SeccionEstadoProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
}

export default function SeccionEstado({
  formData,
  setFormData,
}: SeccionEstadoProps) {
  return (
    <>
      {/* Notas */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
        <Label
          htmlFor="notas"
          className="text-gray-900 font-semibold text-sm md:text-base"
        >
          Notas
        </Label>
        <Textarea
          id="notas"
          value={formData.notas || ""}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Información adicional sobre la reserva..."
          rows={3}
          className="mt-2 border-gray-300 focus:border-gray-400"
        />
      </div>

      {/* Estado de la Reserva */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-amber-200 shadow-sm">
        <h3 className="font-semibold text-base md:text-lg text-amber-900 mb-4">
          Estado de la Reserva
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ESTADOS_RESERVA.map((estado) => (
            <button
              key={estado.value}
              type="button"
              onClick={() => setFormData({ ...formData, estado: estado.value })}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                formData.estado === estado.value
                  ? `${estado.color} text-white border-transparent shadow-md`
                  : "bg-white border-gray-200 text-gray-700 hover:border-amber-300"
              )}
            >
              {estado.label}
            </button>
          ))}
        </div>
        {(formData.estado === "cancelada" ||
          formData.estado === "no_presentado") && (
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">
            Esta reserva aparecerá en la sección de "Canceladas / No
            presentados" del cronograma.
          </p>
        )}
        {formData.estado === "pagado" && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded">
            El comprobante mostrará que esta reserva está PAGADA.
          </p>
        )}
      </div>
    </>
  );
}
