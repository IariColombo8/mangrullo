"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reserva, ReservaFormData, DepartamentoDetalle } from "@/types/reserva"
import { toValidDate } from "../utilidadesReserva"

export function useEstadoReservas() {
  // Datos principales
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cabins, setCabins] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null)
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null)
  const [deleteReserva, setDeleteReserva] = useState<Reserva | null>(null)

  // Popovers de fechas
  const [checkinPopoverOpen, setCheckinPopoverOpen] = useState(false)
  const [checkoutPopoverOpen, setCheckoutPopoverOpen] = useState(false)

  // Filtros
  const [filterDepartamento, setFilterDepartamento] = useState("todos")
  const [filterOrigen, setFilterOrigen] = useState("todos")
  const [filterPais, setFilterPais] = useState("todos")
  const [filterDeposito, setFilterDeposito] = useState("todos")
  const [filterMes, setFilterMes] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterNumeroReservaBooking, setFilterNumeroReservaBooking] = useState("")

  // Vista
  const [viewMode, setViewMode] = useState<"tabla" | "timeline" | "grid">("tabla")

  // Formulario - reserva múltiple
  const [esReservaMultiple, setEsReservaMultiple] = useState(false)
  const [departamentosSeleccionados, setDepartamentosSeleccionados] = useState<string[]>([])
  const [departamentosDetalles, setDepartamentosDetalles] = useState<Map<string, DepartamentoDetalle>>(new Map())

  // Datos del formulario
  const [formData, setFormData] = useState<ReservaFormData>({
    departamento: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    nombre: "",
    pais: "AR",
    numero: "",
    origen: "particular",
    hizoDeposito: false,
    precioNoche: { pesos: 0 },
    precioImpuestos: 0,
    precioGanancia: 0,
    precioTotal: 0,
    moneda: "AR",
    cantidadAdultos: 2,
    cantidadMenores: 0,
    estado: "activa",
    numeroReservaBooking: "",
  })

  // Carga inicial
  useEffect(() => {
    loadCabins()
    loadReservas()
  }, [])

  const loadCabins = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cabins"))
      const data = snapshot.docs.map((doc) => {
        const d = doc.data()
        let name = "Sin nombre"
        if (typeof d.name === "string") name = d.name
        else if (typeof d.name === "object" && d.name !== null) name = d.name.es || d.name.en || d.name.pt || "Sin nombre"
        else if (d.nameEs) name = d.nameEs
        return { id: doc.id, name }
      })
      setCabins(data)
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, departamento: prev.departamento || data[0].name }))
      }
    } catch (error) {
      console.error("Error cargando cabañas:", error)
    }
  }

  const loadReservas = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, "reservas"))
      const data = snapshot.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          ...d,
          fechaInicio: d.fechaInicio?.toDate ? d.fechaInicio.toDate() : toValidDate(d.fechaInicio),
          fechaFin: d.fechaFin?.toDate ? d.fechaFin.toDate() : toValidDate(d.fechaFin),
          fechaCreacion: d.fechaCreacion?.toDate ? d.fechaCreacion.toDate() : toValidDate(d.fechaCreacion),
          fechaDeposito: d.fechaDeposito?.toDate ? d.fechaDeposito.toDate() : toValidDate(d.fechaDeposito),
          estado: d.estado || "activa",
        } as Reserva
      })
      data.sort((a, b) => (b.fechaInicio as Date).getTime() - (a.fechaInicio as Date).getTime())
      setReservas(data)
    } catch (error) {
      console.error("Error loading reservas:", error)
      alert("Error al cargar las reservas: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return {
    // Datos
    reservas, setReservas, cabins, loading, loadReservas,
    // Dialogs
    isDialogOpen, setIsDialogOpen,
    editingReserva, setEditingReserva,
    viewingReserva, setViewingReserva,
    deleteReserva, setDeleteReserva,
    // Popovers
    checkinPopoverOpen, setCheckinPopoverOpen,
    checkoutPopoverOpen, setCheckoutPopoverOpen,
    // Filtros
    filterDepartamento, setFilterDepartamento,
    filterOrigen, setFilterOrigen,
    filterPais, setFilterPais,
    filterDeposito, setFilterDeposito,
    filterMes, setFilterMes,
    searchQuery, setSearchQuery,
    filterNumeroReservaBooking, setFilterNumeroReservaBooking,
    // Vista
    viewMode, setViewMode,
    // Formulario múltiple
    esReservaMultiple, setEsReservaMultiple,
    departamentosSeleccionados, setDepartamentosSeleccionados,
    departamentosDetalles, setDepartamentosDetalles,
    // Formulario datos
    formData, setFormData,
  }
}