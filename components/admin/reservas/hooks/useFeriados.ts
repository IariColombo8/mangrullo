import { useCallback, useEffect, useMemo, useState } from "react"
import { compareAsc, format, getYear, isSameMonth, parse, parseISO } from "date-fns"
import { getAuth } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type FeriadoApi = {
  date: string
  localName?: string
  name?: string
}

type CustomFeriado = {
  date: string
  name: string
}

export type MonthFeriado = {
  date: string
  name: string
  isCustom: boolean
}

export function useFeriados(mes: Date) {
  const [feriados, setFeriados] = useState<FeriadoApi[]>([])
  const [customFeriados, setCustomFeriados] = useState<CustomFeriado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeriados = useCallback(async (year: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`)
      if (!response.ok) {
        throw new Error("No se pudieron cargar los feriados")
      }
      const data = (await response.json()) as FeriadoApi[]
      setFeriados(data || [])
    } catch (err) {
      setError((err as Error).message || "Error al cargar feriados")
      setFeriados([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeriados(getYear(mes))
  }, [mes, fetchFeriados])

  const fetchCustomFeriados = useCallback(async (year: number) => {
    try {
      const snapshot = await getDoc(doc(db, "feriados", String(year)))
      if (!snapshot.exists()) {
        setCustomFeriados([])
        return
      }
      const data = snapshot.data() as {
        dates?: string[]
        custom?: { date: string; name?: string }[]
      }
      if (Array.isArray(data.custom) && data.custom.length > 0) {
        setCustomFeriados(
          data.custom.map((item) => ({
            date: item.date,
            name: item.name || "Feriado",
          })),
        )
        return
      }
      if (Array.isArray(data.dates)) {
        setCustomFeriados(
          data.dates.map((date) => ({
            date: date.includes("/")
              ? format(parse(date, "dd/MM/yyyy", new Date()), "yyyy-MM-dd")
              : date,
            name: "Feriado",
          })),
        )
        return
      }
      setCustomFeriados([])
    } catch {
      setCustomFeriados([])
    }
  }, [])

  const saveCustomFeriados = useCallback(async (year: number, list: CustomFeriado[]) => {
    const dates = list.map((item) =>
      item.date.includes("/")
        ? item.date
        : format(parseISO(item.date), "dd/MM/yyyy"),
    )
    try {
      const auth = getAuth()
      if (!auth.currentUser) {
        setError("Debes iniciar sesión para guardar feriados")
        throw new Error("Unauthenticated")
      }
      await setDoc(
        doc(db, "feriados", String(year)),
        { dates, custom: list },
        { merge: true },
      )
    } catch (err) {
      console.error("Error guardando feriados:", err)
      setError("No se pudieron guardar los feriados")
      throw err
    }
  }, [])

  useEffect(() => {
    fetchCustomFeriados(getYear(mes))
  }, [mes, fetchCustomFeriados])

  const feriadoByDate = useMemo(() => {
    const map = new Map(feriados.map((f) => [f.date, f.localName || f.name || "Feriado"]))
    customFeriados.forEach((f) => {
      map.set(f.date, f.name)
    })
    return map
  }, [feriados, customFeriados])

  const monthFeriados = useMemo(() => {
    const all: MonthFeriado[] = []
    feriados.forEach((f) => {
      if (!f.date) return
      all.push({ date: f.date, name: f.localName || f.name || "Feriado", isCustom: false })
    })
    customFeriados.forEach((f) => {
      all.push({ date: f.date, name: f.name, isCustom: true })
    })

    return all
      .filter((f) => {
        const parsed = parseISO(f.date)
        return !isNaN(parsed.getTime()) && isSameMonth(parsed, mes)
      })
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
  }, [feriados, customFeriados, mes])

  const isFeriado = useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd")
      return feriadoByDate.has(key)
    },
    [feriadoByDate],
  )

  const getFeriadoLabel = useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd")
      return feriadoByDate.get(key)
    },
    [feriadoByDate],
  )

  return {
    feriados,
    customFeriados,
    monthFeriados,
    isFeriado,
    getFeriadoLabel,
    refresh: () => fetchFeriados(getYear(mes)),
    addCustomHoliday: (date: string, name: string) => {
      if (!date) return
      const normalizedName = name?.trim() || "Feriado"
      const year = getYear(parseISO(date))
      setCustomFeriados((prev) => {
        const next = prev.filter((f) => f.date !== date)
        next.push({ date, name: normalizedName })
        saveCustomFeriados(year, next)
          .then(() => fetchCustomFeriados(year))
          .catch(() => null)
        return next
      })
    },
    removeCustomHoliday: (date: string) => {
      const year = getYear(parseISO(date))
      setCustomFeriados((prev) => {
        const next = prev.filter((f) => f.date !== date)
        saveCustomFeriados(year, next)
          .then(() => fetchCustomFeriados(year))
          .catch(() => null)
        return next
      })
    },
    loading,
    error,
  }
}
