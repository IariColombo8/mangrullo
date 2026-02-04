"use client"

import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Reserva, ReservaFormData, DepartamentoDetalle } from "@/types/reserva"
import { checkOverlap, cleanDataForFirestore, toValidDate } from "../utilidadesReserva"

interface EstadoAcciones {
  reservas: Reserva[]
  cabins: { id: string; name: string }[]
  formData: ReservaFormData
  setFormData: (data: ReservaFormData) => void
  editingReserva: Reserva | null
  setEditingReserva: (r: Reserva | null) => void
  isDialogOpen: boolean
  setIsDialogOpen: (v: boolean) => void
  esReservaMultiple: boolean
  setEsReservaMultiple: (v: boolean) => void
  departamentosSeleccionados: string[]
  setDepartamentosSeleccionados: (v: string[]) => void
  departamentosDetalles: Map<string, DepartamentoDetalle>
  setDepartamentosDetalles: (v: Map<string, DepartamentoDetalle>) => void
  deleteReserva: Reserva | null
  setDeleteReserva: (r: Reserva | null) => void
  loadReservas: () => Promise<void>
}

export function useAcciones(estado: EstadoAcciones, _filteredReservas: Reserva[]) {
  const resetForm = () => {
    estado.setFormData({
      departamento: estado.cabins[0]?.name || "",
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
      montoDeposito: 0,
      fechaDeposito: undefined,
      estado: "activa",
      numeroReservaBooking: "",
    })
    estado.setEsReservaMultiple(true)
    estado.setDepartamentosSeleccionados([])
    estado.setDepartamentosDetalles(new Map())
  }

  const openNewDialog = () => {
    estado.setEditingReserva(null)
    resetForm()
    estado.setIsDialogOpen(true)
  }

  const openEditDialog = (reserva: Reserva) => {
    estado.setEditingReserva(reserva)

    estado.setEsReservaMultiple(true)
    if (reserva.esReservaMultiple && reserva.departamentos) {
      estado.setDepartamentosSeleccionados(reserva.departamentos.map((d) => d.departamento))
      const newMap = new Map<string, DepartamentoDetalle>()
      reserva.departamentos.forEach((d) => newMap.set(d.departamento, d))
      estado.setDepartamentosDetalles(newMap)
    } else {
      estado.setDepartamentosSeleccionados([reserva.departamento])
      const newMap = new Map<string, DepartamentoDetalle>()
      newMap.set(reserva.departamento, {
        departamento: reserva.departamento,
        cantidadAdultos: reserva.cantidadAdultos || 2,
        cantidadMenores: reserva.cantidadMenores || 0,
        precioNoche: reserva.precioNoche || { pesos: 0 },
        precioTotal: reserva.precioTotal || 0,
      })
      estado.setDepartamentosDetalles(newMap)
    }

    estado.setFormData({
      departamento: reserva.departamento, fechaInicio: reserva.fechaInicio as Date, fechaFin: reserva.fechaFin as Date,
      nombre: reserva.nombre, pais: reserva.pais, numero: reserva.numero, origen: reserva.origen,
      contactoParticular: reserva.contactoParticular, hizoDeposito: reserva.hizoDeposito, montoDeposito: reserva.montoDeposito,
      precioNoche: reserva.precioNoche || { pesos: 0 }, precioImpuestos: reserva.precioImpuestos,
      precioGanancia: reserva.precioGanancia, precioTotal: reserva.precioTotal, notas: reserva.notas,
      moneda: reserva.moneda || "AR", cantidadAdultos: reserva.cantidadAdultos || 2, cantidadMenores: reserva.cantidadMenores || 0,
      fechaDeposito: reserva.fechaDeposito ? toValidDate(reserva.fechaDeposito) : undefined,
      estado: reserva.estado || "activa", numeroReservaBooking: reserva.numeroReservaBooking || "",
    })
    estado.setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { formData, esReservaMultiple, departamentosSeleccionados, departamentosDetalles, editingReserva, reservas } = estado

    // Validaciones
    if (esReservaMultiple) {
      if (departamentosSeleccionados.length < 1 || departamentosSeleccionados.length > 4) {
        alert("Debe seleccionar entre 1 y 4 departamentos para una reserva múltiple"); return
      }
      if (!formData.nombre) { alert("Por favor completa el Nombre del huésped"); return }
      for (const dept of departamentosSeleccionados) {
        if (!departamentosDetalles.get(dept)) { alert(`Falta completar los detalles del departamento ${dept}`); return }
      }
    } else {
      if (!formData.nombre || !formData.departamento) { alert("Por favor completa Nombre y Departamento"); return }
    }

    if (formData.fechaFin <= formData.fechaInicio) { alert("La fecha de salida debe ser posterior a la fecha de entrada"); return }

    // Validar overlaps
    const depts = esReservaMultiple ? departamentosSeleccionados : [formData.departamento]
    for (const dept of depts) {
      if (checkOverlap(reservas, dept, formData.fechaInicio, formData.fechaFin, editingReserva?.id)) {
        alert(`Ya existe una reserva para ${dept} en las fechas seleccionadas`); return
      }
    }

    try {
      const fechaCreacion = editingReserva?.fechaCreacion
        ? Timestamp.fromDate(editingReserva.fechaCreacion as Date) : Timestamp.now()

      const reservaData: any = {
        fechaInicio: Timestamp.fromDate(formData.fechaInicio), fechaFin: Timestamp.fromDate(formData.fechaFin),
        nombre: formData.nombre, pais: formData.pais, numero: formData.numero,
        origen: formData.origen, hizoDeposito: formData.hizoDeposito,
        moneda: formData.moneda, estado: formData.estado || "activa", fechaCreacion,
      }

      if (esReservaMultiple) {
        reservaData.esReservaMultiple = true
        reservaData.departamento = departamentosSeleccionados[0]
        reservaData.departamentos = departamentosSeleccionados.map((dept) => {
          const d = departamentosDetalles.get(dept)!
          return { departamento: dept, cantidadAdultos: d.cantidadAdultos, cantidadMenores: d.cantidadMenores, precioNoche: d.precioNoche, precioTotal: d.precioTotal }
        })
        reservaData.precioTotal = Array.from(departamentosDetalles.values()).reduce((sum, d) => sum + d.precioTotal, 0)
        reservaData.precioNoche = { [formData.moneda || "AR"]: 0 }
        reservaData.precioImpuestos = 0
        reservaData.precioGanancia = 0
      } else {
        Object.assign(reservaData, {
          esReservaMultiple: false, departamento: formData.departamento,
          precioNoche: formData.precioNoche, precioImpuestos: formData.precioImpuestos,
          precioGanancia: formData.precioGanancia, precioTotal: formData.precioTotal,
          cantidadAdultos: formData.cantidadAdultos || 2, cantidadMenores: formData.cantidadMenores || 0,
        })
      }

      // Campos opcionales
      if (formData.origen === "booking" && formData.numeroReservaBooking) reservaData.numeroReservaBooking = formData.numeroReservaBooking
      if (formData.contactoParticular) reservaData.contactoParticular = formData.contactoParticular
      if (formData.montoDeposito != null) reservaData.montoDeposito = formData.montoDeposito
      if (formData.notas) reservaData.notas = formData.notas
      if (formData.fechaDeposito) reservaData.fechaDeposito = Timestamp.fromDate(formData.fechaDeposito)

      const cleaned = cleanDataForFirestore(reservaData)
      if (editingReserva) await updateDoc(doc(db, "reservas", editingReserva.id!), cleaned)
      else await addDoc(collection(db, "reservas"), cleaned)

      estado.setIsDialogOpen(false)
      estado.setEditingReserva(null)
      resetForm()
      await estado.loadReservas()
    } catch (error) {
      console.error("Error saving reserva:", error)
      alert("Error al guardar la reserva: " + (error as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!estado.deleteReserva?.id) return
    try {
      await deleteDoc(doc(db, "reservas", estado.deleteReserva.id))
      estado.setDeleteReserva(null)
      await estado.loadReservas()
    } catch (error) {
      console.error("Error deleting reserva:", error)
      alert("Error al eliminar la reserva")
    }
  }

  return { handleSubmit, handleDelete, openNewDialog, openEditDialog, resetForm }
}