"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import ContenidoFiltros from "./ContenidoFiltros";

interface SeccionFiltrosProps {
  filterMes: Date;
  setFilterMes: (date: Date) => void;
  filterDepartamento: string;
  setFilterDepartamento: (value: string) => void;
  filterOrigen: string;
  setFilterOrigen: (value: string) => void;
  filterPais: string;
  setFilterPais: (value: string) => void;
  filterDeposito: string;
  setFilterDeposito: (value: string) => void;
  filterNumeroReservaBooking: string;
  setFilterNumeroReservaBooking: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  cabins: { id: string; name: string }[];
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export default function SeccionFiltros(props: SeccionFiltrosProps) {
  const handlePreviousMonth = () =>
    props.setFilterMes(subMonths(props.filterMes, 1));
  const handleNextMonth = () =>
    props.setFilterMes(addMonths(props.filterMes, 1));

  return (
    <div className="space-y-3">
      {/* Filtros - Modal en todas las pantallas */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-auto border-emerald-200 hover:bg-emerald-50 relative bg-white/80"
          >
            <Search className="h-4 w-4 mr-2" />
            Filtros
            {props.hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtros de Búsqueda</DialogTitle>
          </DialogHeader>
          <ContenidoFiltros {...props} isMobile />
          {props.hasActiveFilters && (
            <div className="pt-2">
              <Button
                onClick={props.clearAllFilters}
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Selector de Mes - Siempre visible */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-emerald-200 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={handlePreviousMonth}
            variant="outline"
            size="sm"
            className="border-emerald-200 hover:bg-emerald-50 h-9 px-3"
          >
            <ChevronLeft className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Anterior</span>
          </Button>
          <div className="text-center flex-1">
            <p className="text-base md:text-lg font-semibold text-emerald-900 capitalize">
              {format(props.filterMes, "MMMM yyyy", { locale: es })}
            </p>
          </div>
          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="sm"
            className="border-emerald-200 hover:bg-emerald-50 h-9 px-3"
          >
            <span className="hidden md:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4 md:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
