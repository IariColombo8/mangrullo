"use client";

import type React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, Download, CheckCircle2 } from "lucide-react";
import type { Reserva } from "@/types/reserva";
import { ORIGENES } from "@/types/reserva";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PAISES = [
  { code: "AR", name: "Argentina", currency: "pesos", symbol: "ARS" },
  { code: "UY", name: "Uruguay", currency: "uruguayos", symbol: "UYU" },
  { code: "BR", name: "Brasil", currency: "dolares", symbol: "USD" },
  { code: "CL", name: "Chile", currency: "dolares", symbol: "USD" },
  { code: "US", name: "Estados Unidos", currency: "dolares", symbol: "USD" },
  { code: "ES", name: "España", currency: "dolares", symbol: "EUR" },
  { code: "FR", name: "Francia", currency: "dolares", symbol: "EUR" },
  { code: "OTHER", name: "Otro", currency: "dolares", symbol: "USD" },
];

const DEPARTAMENTOS = [
  "Los Horneros",
  "Los Zorzales",
  "Los Tordos",
  "Las Calandrias",
];

interface ComprobanteProfesionalProps {
  reserva: Reserva;
  onClose: () => void;
  onEdit: () => void;
}

const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toLocaleString("es-AR");
};

const ComprobanteProfesional: React.FC<ComprobanteProfesionalProps> = ({
  reserva,
  onClose,
  onEdit,
}) => {
  const calculateNights = (inicio: Date, fin: Date) => {
    return Math.ceil(
      (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const noches = calculateNights(
    reserva.fechaInicio as Date,
    reserva.fechaFin as Date,
  );
  const paisData = PAISES.find((p) => p.code === reserva.pais);

  const monedaReserva = reserva.moneda || "AR";
  let simboloMoneda = "$";
  let nombreMoneda = "Pesos Argentinos";

  if (monedaReserva === "AR") {
    simboloMoneda = "ARS $";
    nombreMoneda = "Pesos Argentinos";
  } else if (monedaReserva === "UY") {
    simboloMoneda = "UYU $";
    nombreMoneda = "Pesos Uruguayos";
  } else if (monedaReserva === "USD") {
    simboloMoneda = "USD $";
    nombreMoneda = "Dólares Estadounidenses";
  } else if (monedaReserva === "EUR") {
    simboloMoneda = "EUR €";
    nombreMoneda = "Euros";
  } else {
    const paisMatch = PAISES.find((p) => p.code === monedaReserva);
    if (paisMatch) {
      simboloMoneda = `${paisMatch.symbol} $`;
      nombreMoneda =
        paisMatch.currency.charAt(0).toUpperCase() +
        paisMatch.currency.slice(1);
    }
  }

  const precioNocheMostrar =
    reserva.precioNoche && typeof reserva.precioNoche === "object"
      ? reserva.precioNoche[monedaReserva] || 0
      : 0;

  const createCaptureCanvas = async () => {
    const element = document.getElementById("comprobante-content");
    if (!element) return null;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.padding = "24px";
    wrapper.style.background = "#ffffff";
    wrapper.style.display = "inline-block";
    wrapper.style.boxSizing = "content-box";

    const clone = element.cloneNode(true) as HTMLElement;
    clone.className = clone.className
      .replace(/scale-\[[\d.]+\]/g, "scale-100")
      .replace(/origin-top/g, "");
    clone.style.transform = "none";
    clone.style.transformOrigin = "top left";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0,
        windowWidth: wrapper.scrollWidth,
        windowHeight: wrapper.scrollHeight,
        onclone: (doc) => {
          const style = doc.createElement("style");
          style.textContent = `
            #comprobante-content p,
            #comprobante-content label,
            #comprobante-content h1,
            #comprobante-content h2 {
              position: relative;
              top: -3px;
            }
            #comprobante-content .export-text-up {
              position: relative;
              top: -7px;
            }
          `;
          doc.head.appendChild(style);
        },
      });
      return canvas;
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const handleDownloadImage = async () => {
    try {
      const canvas = await createCaptureCanvas();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `comprobante-${reserva.nombre.replace(/\s+/g, "-")}-${format(new Date(), "dd-MM-yyyy")}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const canvas = await createCaptureCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`comprobante-${reserva.nombre.replace(/\s+/g, "-")}-${format(new Date(), "dd-MM-yyyy")}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-auto">
      <div className="w-full max-w-4xl">
        <div
          id="comprobante-content"
          className="bg-white border-4 border-double border-gray-400 rounded-lg p-3 md:p-6 shadow-2xl w-[118%] -mx-[9%] scale-[0.7] origin-top text-[11px] md:scale-[0.9] md:w-full md:mx-0 md:text-base"
        >
          {/* Header */}
          <div className="flex flex-row items-center justify-between mb-2 pb-2 border-b-2 border-gray-300 gap-2 flex-shrink-0">
            <div className="flex items-center">
              <img
                src="/mangrullo.png"
                alt="El Mangrullo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-800 tracking-wide uppercase">
                El Mangrullo
              </h1>
              <p className="text-xs text-gray-600">Complejo Turístico</p>
            </div>
          </div>

          {/* Título */}
          <div className="bg-gray-200 p-1.5 rounded border-2 border-gray-400 flex-shrink-0">
            <h2 className="text-center text-xs text-gray-900 font-bold uppercase tracking-wide">
              Comprobante de Reserva / Pago
            </h2>
          </div>

          {reserva.estado === "pagado" && (
            <div className="mt-1 bg-green-100 border-2 border-green-500 rounded-lg p-1.5 flex items-center justify-center gap-1 flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-bold text-xs uppercase tracking-wide">
                PAGADO
              </span>
            </div>
          )}

          {/* Datos del huésped */}
          <div className="grid grid-cols-2 gap-3 mb-2 mt-2 flex-shrink-0">
            <div>
              <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                Nombre del huésped:
              </label>
              <div className="border-b-2 border-gray-400 py-0.5 mt-0.5">
                <p className="text-gray-900 font-medium text-xs">
                  {reserva.nombre}
                </p>
              </div>
            </div>
            <div>
              <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                País:
              </label>
              <div className="border-b-2 border-gray-400 py-0.5 mt-0.5">
                <p className="text-gray-900 font-medium text-xs">
                  {paisData?.name || reserva.pais}
                </p>
              </div>
            </div>
          </div>

          {/* Canal de alquiler */}
          <div className="mb-2 flex-shrink-0">
            <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide mb-1 block">
              Canal de alquiler:
            </label>
            <div className="flex gap-3 flex-wrap items-center">
              {ORIGENES.map((origen) => (
                <div key={origen.value} className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-3.5 h-3.5 border border-gray-600 flex items-center justify-center rounded-sm flex-shrink-0",
                      reserva.origen === origen.value && "bg-gray-800",
                    )}
                  >
                    {reserva.origen === origen.value && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700 text-[11px] font-medium leading-none export-text-up">
                    {origen.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {reserva.numeroReservaBooking && reserva.origen === "booking" && (
            <div className="mb-2 flex-shrink-0">
              <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                Número de Reserva Booking:
              </label>
              <div className="border-b-2 border-gray-400 py-0.5 mt-0.5">
                <p className="text-gray-900 font-medium text-xs">
                  {reserva.numeroReservaBooking}
                </p>
              </div>
            </div>
          )}

          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Columna izquierda */}
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-300 space-y-1">
              <div>
                <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide mb-1 block">
                  {reserva.esReservaMultiple
                    ? `Departamentos (${reserva.departamentos?.length}):`
                    : "Departamento/s:"}
                </label>
                {reserva.esReservaMultiple && reserva.departamentos ? (
                  <div className="space-y-1">
                    {reserva.departamentos.map((dept) => {
                      return (
                        <div
                          key={dept.departamento}
                          className="flex items-center gap-1 border-b border-gray-200 pb-1"
                        >
                          <div className="w-3 h-3 border-2 border-gray-700 flex items-center justify-center rounded-sm flex-shrink-0 bg-gray-900">
                            <CheckCircle2 className="w-2 h-2 text-white" />
                          </div>
                          <span className="text-gray-700 text-[10px] font-medium export-text-up">
                            {dept.departamento}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    {DEPARTAMENTOS.map((dept) => {
                      const isSelected =
                        reserva.departamento?.trim() === dept.trim();

                      return (
                        <div key={dept} className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "w-3.5 h-3.5 border border-gray-600 flex items-center justify-center rounded-sm flex-shrink-0",
                              isSelected && "bg-gray-800",
                            )}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="text-gray-700 text-[11px] leading-none export-text-up">
                            {dept}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Fechas en una fila */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                    Fecha de entrada:
                  </label>
                  <div className="border-b border-gray-400 py-0.5 mt-0.5">
                    <p className="text-gray-900 text-[10px] font-medium">
                      {format(reserva.fechaInicio as Date, "dd / MM / yyyy")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                    Fecha de salida:
                  </label>
                  <div className="border-b border-gray-400 py-0.5 mt-0.5">
                    <p className="text-gray-900 text-[10px] font-medium">
                      {format(reserva.fechaFin as Date, "dd / MM / yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cantidad de noches */}
              <div>
                <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                  Cantidad de noches:
                </label>
                <div className="border-b border-gray-400 py-0.5 mt-0.5">
                  <p className="text-gray-900 font-bold text-[10px]">
                    {noches}
                  </p>
                </div>
              </div>

              {reserva.esReservaMultiple && reserva.departamentos ? (
                <div>
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide mb-1 block">
                    Cantidad de personas por departamento:
                  </label>
                  <div className="space-y-0.5">
                    {reserva.departamentos.map((dept) => (
                      <div key={dept.departamento} className="text-[10px]">
                        <span className="font-medium">
                          {dept.departamento}:
                        </span>{" "}
                        {dept.cantidadAdultos} Adultos, {dept.cantidadMenores}{" "}
                        Menores
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                    Cantidad de personas:
                  </label>
                  <div className="border-b border-gray-400 py-0.5 mt-0.5">
                    <p className="text-gray-900 text-[10px]">
                      {reserva.cantidadAdultos || 0} Adultos,{" "}
                      {reserva.cantidadMenores || 0} Menores
                    </p>
                  </div>
                </div>
              )}

              {/* Observaciones dentro del mismo recuadro */}
              {reserva.notas && reserva.notas.trim() !== "" && (
                <div className="pt-1">
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide mb-0.5 block">
                    Observaciones:
                  </label>
                  <div className="border border-gray-300 rounded p-1.5 bg-white">
                    <p className="text-gray-700 text-[10px] leading-relaxed">
                      {reserva.notas}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha */}
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-300 space-y-1">
              <div className="pb-1 border-b border-gray-300">
                <p className="text-[10px] text-gray-600 font-medium">
                  Moneda: {nombreMoneda}
                </p>
              </div>

              {reserva.esReservaMultiple && reserva.departamentos ? (
                <div className="space-y-1.5">
                  <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide block">
                    Precios por departamento:
                  </label>
                  {reserva.departamentos.map((dept) => {
                    const precioNoche = dept.precioNoche[monedaReserva] || 0;
                    return (
                      <div
                        key={dept.departamento}
                        className="border-b border-gray-300 pb-1"
                      >
                        <p className="text-[10px] font-medium text-gray-700 mb-0.5">
                          {dept.departamento}
                        </p>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-600">
                            Precio por noche:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {simboloMoneda} {formatCurrency(precioNoche)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] mt-0.5">
                          <span className="text-gray-600">
                            Total ({noches} noches):
                          </span>
                          <span className="font-bold text-gray-900">
                            {simboloMoneda} {formatCurrency(dept.precioTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                      Precio por noche:
                    </label>
                    <div className="border-b border-gray-400 py-0.5 mt-0.5">
                      <p className="text-gray-900 text-xs font-semibold">
                        {simboloMoneda} {formatCurrency(precioNocheMostrar)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                      Cantidad de noches:
                    </label>
                    <div className="border-b border-gray-400 py-0.5 mt-0.5">
                      <p className="text-gray-900 font-bold text-xs">
                        {noches}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-1 border-t-2 border-gray-400">
                <label className="text-gray-700 font-semibold text-[10px] uppercase tracking-wide">
                  Subtotal:
                </label>
                <div className="mt-0.5 bg-white p-1 rounded border border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold text-[10px]">
                      {simboloMoneda}
                    </span>
                    <span className="text-gray-900 font-bold text-sm">
                      {formatCurrency(reserva.precioTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {reserva.hizoDeposito && (
                <div>
                  <label className="text-green-700 font-semibold text-[10px] uppercase tracking-wide">
                    Seña / Depósito:
                  </label>
                  <div className="mt-0.5 bg-green-50 p-1 rounded border border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-semibold text-[10px]">
                        {simboloMoneda}
                      </span>
                      <span className="text-green-700 font-bold text-sm">
                        {formatCurrency(reserva.montoDeposito)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <label className="text-gray-900 font-bold text-[10px] uppercase tracking-wide">
                  Total a pagar:
                </label>
                <div className="mt-0.5 bg-gray-200 p-1.5 rounded border-2 border-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-xs">
                      {simboloMoneda}
                    </span>
                    <span className="text-gray-900 font-bold text-base">
                      {formatCurrency(
                        reserva.hizoDeposito
                          ? (reserva.precioTotal || 0) -
                              (reserva.montoDeposito || 0)
                          : reserva.precioTotal,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-2 mt-1 text-[10px]">
            <div className="space-y-0.5">
              <p className="text-gray-700 font-semibold">
                Federación - Entre Ríos
              </p>
              <p className="text-gray-600">WhatsApp: +54 9 3456 551-306</p>
              <p className="text-gray-600">
                Instagram: @el_mangrullo_federacion
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-gray-700">
                N° de comprobante:{" "}
                <span className="font-bold text-gray-900">
                  {reserva.id?.substring(0, 8).toUpperCase()}
                </span>
              </p>
              <p className="text-gray-700">
                Fecha de emisión:{" "}
                <span className="font-semibold">
                  {format(new Date(), "dd/MM/yyyy")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Botones - fuera del comprobante */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3 -mt-[180px] sm:-mt-[100px] md:-mt-[50px] scale-[0.85] origin-top md:scale-100">
          <Button
            onClick={onClose}
            variant="outline"
            className="order-1 sm:order-none flex-1 border-gray-300 hover:bg-gray-100 bg-transparent md:h-8 md:text-xs md:px-2"
          >
            Cerrar
          </Button>
          <Button
            onClick={onEdit}
            className="order-2 sm:order-none flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md md:h-8 md:text-xs md:px-2"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={handleDownloadImage}
            className="order-3 sm:order-none flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md md:h-8 md:text-xs md:px-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PNG
          </Button>
          <Button
            onClick={handleDownloadPdf}
            className="order-4 sm:order-none flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md md:h-8 md:text-xs md:px-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteProfesional;
