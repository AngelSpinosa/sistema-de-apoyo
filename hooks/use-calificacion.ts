import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  obtenerCalificacion,
  obtenerMiCalificacion,
  calificarRecurso,
  type CalificacionResumen,
} from '@/lib/api/calificaciones'

type UseCalificacionResult = {
  promedio:        number
  total:           number
  miCalificacion:  number
  cargando:        boolean
  calificar:       (valor: number) => Promise<void>
}

/**
 * Hook para manejar la calificación por estrellas de un recurso.
 * - Carga el promedio/total públicos y la calificación previa del usuario.
 * - Al calificar, hace upsert en Supabase y actualiza el promedio con
 *   optimistic update (con rollback si falla).
 */
export function useCalificacion(idRecurso: string): UseCalificacionResult {
  const [promedio, setPromedio] = useState(0)
  const [total, setTotal] = useState(0)
  const [miCalificacion, setMiCalificacion] = useState(0)
  const [cargando, setCargando] = useState(true)
  const supabase = createClient()

  const cargar = useCallback(async () => {
    setCargando(true)

    const [resumen, mia] = await Promise.all([
      obtenerCalificacion(supabase, idRecurso),
      obtenerMiCalificacion(supabase, idRecurso),
    ])

    setPromedio(resumen.promedio)
    setTotal(resumen.total)
    setMiCalificacion(mia ?? 0)
    setCargando(false)
  }, [idRecurso, supabase])

  useEffect(() => {
    cargar()
  }, [cargar])

  const calificar = useCallback(async (valor: number) => {
    // Guardamos el estado anterior para poder hacer rollback si falla.
    const anterior: CalificacionResumen = { promedio, total }
    const miCalificacionAnterior = miCalificacion

    // Optimistic update: recalculamos el promedio localmente.
    let nuevoTotal = total
    let nuevaSuma = promedio * total

    if (miCalificacionAnterior > 0) {
      // El usuario ya había calificado: reemplazamos su voto anterior.
      nuevaSuma = nuevaSuma - miCalificacionAnterior + valor
    } else {
      // Primer voto del usuario.
      nuevaSuma = nuevaSuma + valor
      nuevoTotal = total + 1
    }

    const nuevoPromedio = nuevoTotal > 0
      ? Math.round((nuevaSuma / nuevoTotal) * 100) / 100
      : 0

    setPromedio(nuevoPromedio)
    setTotal(nuevoTotal)
    setMiCalificacion(valor)

    const { error } = await calificarRecurso(supabase, idRecurso, valor)

    if (error) {
      // Rollback si la Server Action / upsert falla.
      setPromedio(anterior.promedio)
      setTotal(anterior.total)
      setMiCalificacion(miCalificacionAnterior)
      return
    }

    // Refrescamos desde el servidor para asegurar consistencia exacta.
    await cargar()
  }, [idRecurso, promedio, total, miCalificacion, supabase, cargar])

  return { promedio, total, miCalificacion, cargando, calificar }
}