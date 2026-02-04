"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Sparkles } from "lucide-react";

import ComprobanteProfesional from "./ComprobanteProfesional";
import CheckInsOutsHoy from "./check-ins-outs-hoy";
import DashboardMetrics from "./dashboard-metrics";
import ReservasViewTabs from "./reservas-view-tabs";
import SeccionFiltros from "./SeccionFiltros";
import DialogFormularioReserva from "./DialogFormularioReserva";

import { formatCurrency } from "./utilidadesReserva";
import { useEstadoReservas } from "./hooks/useEstadoReservas";
import { useMetricas } from "./hooks/useMetricas";
import { useFiltrados } from "./hooks/useFiltrados";
import { useAcciones } from "./hooks/useAcciones";
import { useFeriados } from "./hooks/useFeriados";

export interface ReservasManagerRef {
  openNewDialog: () => void;
}

const ReservasManager = forwardRef<ReservasManagerRef>((props, ref) => {
  const estado = useEstadoReservas();
  const metricas = useMetricas({
    reservas: estado.reservas,
    cabins: estado.cabins,
    filterMes: estado.filterMes,
  });
  const feriados = useFeriados(estado.filterMes);
  const { filteredReservas, hasActiveFilters, clearAllFilters } =
    useFiltrados(estado);
  const acciones = useAcciones(estado, filteredReservas);

  useImperativeHandle(ref, () => ({ openNewDialog: acciones.openNewDialog }));

  if (estado.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-semibold text-emerald-900">
            Cargando reservas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <DashboardMetrics
        departamentosAlquiladosHoy={metricas.departamentosAlquiladosHoy}
        ocupacionHoy={metricas.ocupacionHoy}
        proximosCheckIns={metricas.proximosCheckIns}
        proximosCheckOuts={metricas.proximosCheckOuts}
        reservasPendientes={metricas.reservasPendientes}
        ingresosDelMes={metricas.ingresosDelMes}
        totalReservas={metricas.stats.totalReservas}
        totalIngresos={metricas.stats.totalIngresos}
        ocupacionTotal={metricas.stats.ocupacionTotal}
        filterMes={estado.filterMes}
        now={metricas.now}
        formatCurrency={formatCurrency}
      />

      <CheckInsOutsHoy
        reservas={estado.reservas}
        onReservaClick={(r) => estado.setViewingReserva(r)}
      />

      <div className="hidden md:flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reservas</h2>
          <p className="text-muted-foreground">
            Gestiona todas las reservas del hotel
          </p>
        </div>
        <Button
          onClick={acciones.openNewDialog}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
        </Button>
      </div>

      <div className="md:hidden flex justify-end mb-4">
        <Button
          onClick={acciones.openNewDialog}
          size="sm"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
        </Button>
      </div>

      <SeccionFiltros
        filterMes={estado.filterMes}
        setFilterMes={estado.setFilterMes}
        filterDepartamento={estado.filterDepartamento}
        setFilterDepartamento={estado.setFilterDepartamento}
        filterOrigen={estado.filterOrigen}
        setFilterOrigen={estado.setFilterOrigen}
        filterPais={estado.filterPais}
        setFilterPais={estado.setFilterPais}
        filterDeposito={estado.filterDeposito}
        setFilterDeposito={estado.setFilterDeposito}
        filterNumeroReservaBooking={estado.filterNumeroReservaBooking}
        setFilterNumeroReservaBooking={estado.setFilterNumeroReservaBooking}
        searchQuery={estado.searchQuery}
        setSearchQuery={estado.setSearchQuery}
        cabins={estado.cabins}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      />

      <ReservasViewTabs
        viewMode={estado.viewMode}
        onViewModeChange={estado.setViewMode}
        filteredReservas={filteredReservas}
        cabins={estado.cabins}
        filterMes={estado.filterMes}
        setViewingReserva={estado.setViewingReserva}
        openEditDialog={acciones.openEditDialog}
        setDeleteReserva={estado.setDeleteReserva}
        isFeriado={feriados.isFeriado}
        getFeriadoLabel={feriados.getFeriadoLabel}
        monthFeriados={feriados.monthFeriados}
        addCustomHoliday={feriados.addCustomHoliday}
        removeCustomHoliday={feriados.removeCustomHoliday}
        filterDepartamento={estado.filterDepartamento}
        setFilterDepartamento={estado.setFilterDepartamento}
        filterOrigen={estado.filterOrigen}
        setFilterOrigen={estado.setFilterOrigen}
        filterDeposito={estado.filterDeposito}
        setFilterDeposito={estado.setFilterDeposito}
        searchQuery={estado.searchQuery}
        setSearchQuery={estado.setSearchQuery}
        setFilterMes={estado.setFilterMes}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        filterNumeroReservaBooking={estado.filterNumeroReservaBooking}
        setFilterNumeroReservaBooking={estado.setFilterNumeroReservaBooking}
      />


      <DialogFormularioReserva
        isOpen={estado.isDialogOpen}
        onClose={() => estado.setIsDialogOpen(false)}
        formData={estado.formData}
        setFormData={estado.setFormData}
        editingReserva={estado.editingReserva}
        cabins={estado.cabins}
        reservas={estado.reservas}
        esReservaMultiple={estado.esReservaMultiple}
        setEsReservaMultiple={estado.setEsReservaMultiple}
        departamentosSeleccionados={estado.departamentosSeleccionados}
        setDepartamentosSeleccionados={estado.setDepartamentosSeleccionados}
        departamentosDetalles={estado.departamentosDetalles}
        setDepartamentosDetalles={estado.setDepartamentosDetalles}
        checkinPopoverOpen={estado.checkinPopoverOpen}
        setCheckinPopoverOpen={estado.setCheckinPopoverOpen}
        checkoutPopoverOpen={estado.checkoutPopoverOpen}
        setCheckoutPopoverOpen={estado.setCheckoutPopoverOpen}
        onSubmit={acciones.handleSubmit}
      />

      {estado.viewingReserva && (
        <Dialog
          open={!!estado.viewingReserva}
          onOpenChange={() => estado.setViewingReserva(null)}
        >
          <DialogContent className="w-[92vw] max-w-sm sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-1 sm:p-6">
            <DialogHeader>
              <DialogTitle className="sr-only">
                Detalles de la Reserva
              </DialogTitle>
            </DialogHeader>
            <ComprobanteProfesional
              reserva={estado.viewingReserva}
              onClose={() => estado.setViewingReserva(null)}
              onEdit={() => {
                const r = estado.viewingReserva!;
                estado.setViewingReserva(null);
                acciones.openEditDialog(r);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!estado.deleteReserva}
        onOpenChange={() => estado.setDeleteReserva(null)}
      >
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl md:text-2xl text-red-700">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm md:text-base text-gray-600">
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              reserva de{" "}
              <span className="font-semibold text-gray-900">
                {estado.deleteReserva?.nombre}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-gray-300 w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={acciones.handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-full sm:w-auto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ReservasManager.displayName = "ReservasManager";

export default ReservasManager;
