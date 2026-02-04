"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ReservaFormData, DepartamentoDetalle } from "@/types/reserva";
import SelectorMoneda from "./SelectorMoneda";
import CamposPreciosSimple from "./CamposPreciosSimple";
import CamposPreciosMultiple from "./CamposPreciosMultiple";
import SeccionDeposito from "./SeccionDeposito";
import { calculateNights } from "./utilidadesReserva";

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
  const [pagaEnMonedaSeleccionada, setPagaEnMonedaSeleccionada] = useState(true);
  const [monedaPago, setMonedaPago] = useState("AR");
  const [tipoCambio, setTipoCambio] = useState<number | null>(null);
  const [cargandoCambio, setCargandoCambio] = useState(false);

  const nights = useMemo(
    () => calculateNights(formData.fechaInicio, formData.fechaFin),
    [formData.fechaInicio, formData.fechaFin],
  );

  useEffect(() => {
    if (esReservaMultiple) {
      const total = Array.from(departamentosDetalles.values()).reduce(
        (sum, d) => sum + (d.precioTotal || 0),
        0,
      );
      if (formData.precioTotal !== total) {
        setFormData({ ...formData, precioTotal: total });
      }
    } else {
      const currency = formData.moneda as keyof typeof formData.precioNoche;
      const precioNoche = formData.precioNoche?.[currency] || 0;
      const total = precioNoche * nights;
      if (formData.precioTotal !== total) {
        setFormData({ ...formData, precioTotal: total });
      }
    }
  }, [esReservaMultiple, departamentosDetalles, formData, nights, setFormData]);

  useEffect(() => {
    if (formData.moneda === "AR") {
      setPagaEnMonedaSeleccionada(true);
      setMonedaPago("AR");
    }
  }, [formData.moneda]);

  useEffect(() => {
    const needsConversion = formData.moneda !== "AR" && !pagaEnMonedaSeleccionada && monedaPago === "AR";
    if (!needsConversion) {
      setTipoCambio(null);
      return;
    }

    const fetchCambio = async () => {
      setCargandoCambio(true);
      try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${formData.moneda}&symbols=ARS`);
        const data = await res.json();
        const rate = data?.rates?.ARS;
        setTipoCambio(typeof rate === "number" ? rate : null);
      } catch {
        setTipoCambio(null);
      } finally {
        setCargandoCambio(false);
      }
    };

    fetchCambio();
  }, [formData.moneda, pagaEnMonedaSeleccionada, monedaPago]);

  const totalEnPesos =
    tipoCambio && formData.precioTotal ? formData.precioTotal * tipoCambio : null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-green-100 shadow-sm">
      <h3 className="font-semibold text-base md:text-lg text-green-900 mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
        Precios y Pagos
      </h3>

      <div className="space-y-4">
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
          <CamposPreciosMultiple formData={formData} setFormData={setFormData} />
        )}

        {formData.moneda !== "AR" && (
          <div className="space-y-3 rounded-lg border border-green-100 bg-white/60 p-3">
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold text-sm">
                ¿Paga en {formData.moneda === "USD" ? "dólar" : formData.moneda}?
              </Label>
              <Select
                value={pagaEnMonedaSeleccionada ? "si" : "no"}
                onValueChange={(value) => setPagaEnMonedaSeleccionada(value === "si")}
              >
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!pagaEnMonedaSeleccionada && (
              <div className="space-y-2">
                <Label className="text-green-900 font-semibold text-sm">¿En qué paga?</Label>
                <Select value={monedaPago} onValueChange={setMonedaPago}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AR">Pesos Argentinos (ARS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!pagaEnMonedaSeleccionada && monedaPago === "AR" && (
              <div className="text-sm text-gray-700">
                {cargandoCambio && <span>Buscando cotización...</span>}
                {!cargandoCambio && tipoCambio && (
                  <div className="space-y-1">
                    <div>
                      Cotización: 1 {formData.moneda} = {tipoCambio.toLocaleString("es-AR")} ARS
                    </div>
                    <div className="font-semibold text-green-700">
                      Total estimado: ARS{" "}
                      {totalEnPesos?.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                {!cargandoCambio && !tipoCambio && (
                  <span>No se pudo obtener la cotización.</span>
                )}
              </div>
            )}
          </div>
        )}

        <SeccionDeposito formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
}
