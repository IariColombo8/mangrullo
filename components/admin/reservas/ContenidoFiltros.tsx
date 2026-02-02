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

interface ContenidoFiltrosProps {
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
  isMobile?: boolean;
}

export default function ContenidoFiltros(props: ContenidoFiltrosProps) {
  return (
    <div
      className={`space-y-3 ${
        props.isMobile ? "" : "grid grid-cols-4 gap-x-4 gap-y-3"
      }`}
    >
      {/* Departamento */}
      <div className="space-y-1.5">
        <Label
          htmlFor="departamento"
          className="text-xs font-medium text-emerald-800"
        >
          Departamento
        </Label>
        <Select
          value={props.filterDepartamento}
          onValueChange={props.setFilterDepartamento}
        >
          <SelectTrigger id="departamento" className="h-9 text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {props.cabins.map((cabin) => (
              <SelectItem key={cabin.id} value={cabin.name}>
                {cabin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Origen */}
      <div className="space-y-1.5">
        <Label
          htmlFor="origen"
          className="text-xs font-medium text-emerald-800"
        >
          Origen
        </Label>
        <Select
          value={props.filterOrigen}
          onValueChange={props.setFilterOrigen}
        >
          <SelectTrigger id="origen" className="h-9 text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Booking">Booking</SelectItem>
            <SelectItem value="Airbnb">Airbnb</SelectItem>
            <SelectItem value="Directo">Directo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* País */}
      <div className="space-y-1.5">
        <Label htmlFor="pais" className="text-xs font-medium text-emerald-800">
          País
        </Label>
        <Select value={props.filterPais} onValueChange={props.setFilterPais}>
          <SelectTrigger id="pais" className="h-9 text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Argentina">Argentina</SelectItem>
            <SelectItem value="Brasil">Brasil</SelectItem>
            <SelectItem value="Chile">Chile</SelectItem>
            <SelectItem value="Uruguay">Uruguay</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Depósito */}
      <div className="space-y-1.5">
        <Label
          htmlFor="deposito"
          className="text-xs font-medium text-emerald-800"
        >
          Depósito
        </Label>
        <Select
          value={props.filterDeposito}
          onValueChange={props.setFilterDeposito}
        >
          <SelectTrigger id="deposito" className="h-9 text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="si">Sí</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nro. Reserva Booking - Full width */}
      <div className={`space-y-1.5 ${props.isMobile ? "" : "col-span-2"}`}>
        <Label
          htmlFor="booking"
          className="text-xs font-medium text-emerald-800"
        >
          Nro. Reserva Booking
        </Label>
        <Input
          id="booking"
          placeholder="Booking ID..."
          value={props.filterNumeroReservaBooking}
          onChange={(e) => props.setFilterNumeroReservaBooking(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      {/* Buscar - Full width */}
      <div className={`space-y-1.5 ${props.isMobile ? "" : "col-span-2"}`}>
        <Label
          htmlFor="buscar"
          className="text-xs font-medium text-emerald-800"
        >
          Buscar
        </Label>
        <Input
          id="buscar"
          placeholder="Nombre o teléfono..."
          value={props.searchQuery}
          onChange={(e) => props.setSearchQuery(e.target.value)}
          className="h-9 text-sm"
        />
      </div>
      
    </div>
  );
}
