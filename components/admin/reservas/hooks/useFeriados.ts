import { useCallback, useEffect, useMemo, useState } from "react"
import { compareAsc, format, getYear, isSameMonth, parseISO } from "date-fns"

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

const STORAGE_KEY = "customFeriadosAR"

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as CustomFeriado[]
        if (Array.isArray(data)) {
          setCustomFeriados(data)
        }
      }
    } catch {
      // ignorar
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customFeriados))
    } catch {
      // ignorar
    }
  }, [customFeriados])

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
      setCustomFeriados((prev) => {
        const next = prev.filter((f) => f.date !== date)
        next.push({ date, name: normalizedName })
        return next
      })
    },
    removeCustomHoliday: (date: string) => {
      setCustomFeriados((prev) => prev.filter((f) => f.date !== date))
    },
    loading,
    error,
  }
}
