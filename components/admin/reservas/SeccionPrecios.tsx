"use client";

import { DollarSign } from "lucide-react";
import type { ReservaFormData, DepartamentoDetalle } from "@/types/reserva";
import SelectorMoneda from "./SelectorMoneda";
import CamposPreciosSimple from "./CamposPreciosSimple";
import CamposPreciosMultiple from "./CamposPreciosMultiple";
import SeccionDeposito from "./SeccionDeposito";

interface SeccionPreciosProps {
  formData: ReservaFormData;
  setFormData: (data: ReservaFormData) => void;
  esReservaMultiple: boolean;
  departamentosDetalles: Map<string, DepartamentoDetalle>;
  setDepartamentosDetalles: (value: Map<string, DepartamentoDetalle>) => void;
}

export default function SeccionPrecios({
  formData,
  setFormData,
  esReservaMultiple,
  departamentosDetalles,
  setDepartamentosDetalles,
}: SeccionPreciosProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-green-100 shadow-sm">
      <h3 className="font-semibold text-base md:text-lg text-green-900 mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
        Precios y Pagos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectorMoneda
          formData={formData}
          setFormData={setFormData}
          esReservaMultiple={esReservaMultiple}
          departamentosDetalles={departamentosDetalles}
          setDepartamentosDetalles={setDepartamentosDetalles}
        />

        {!esReservaMultiple ? (
          <CamposPreciosSimple formData={formData} setFormData={setFormData} />
        ) : (
          <CamposPreciosMultiple
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>

      <SeccionDeposito formData={formData} setFormData={setFormData} />
    </div>
  );
}
