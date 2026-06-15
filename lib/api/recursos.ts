// src/lib/api/recursos.ts
import { createClient } from '@/lib/supabase/server'

export async function getRecursosActivos() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurso')
    .select('*, recurso_bruto(*)')
    .eq('disponibilidad', 'activo')

  if (error) throw new Error(error.message)

  // vista_calificacion_recurso no tiene FK hacia 'recurso', así que no se
  // puede embeber con PostgREST. Se consulta por separado y se mapea.
  const { data: calificaciones, error: errorCalif } = await supabase
    .from('vista_calificacion_recurso')
    .select('id_recurso, promedio, total_calificaciones')

  if (errorCalif) throw new Error(errorCalif.message)

  const mapaCalificaciones = new Map<string, { promedio: number; total: number }>()
  ;(calificaciones ?? []).forEach((c: any) => {
    mapaCalificaciones.set(c.id_recurso, {
      promedio: c.promedio ?? 0,
      total: c.total_calificaciones ?? 0,
    })
  })

  const conPromedio = (data ?? []).map((r: any) => {
    const calif = mapaCalificaciones.get(r.id_recurso)
    return {
      ...r,
      promedio_calificacion: calif?.promedio ?? 0,
      total_calificaciones: calif?.total ?? 0,
    }
  })

  // Ordenamos por promedio en memoria
  conPromedio.sort((a, b) => b.promedio_calificacion - a.promedio_calificacion)

  return conPromedio
}

export async function getRecursoById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurso')
    .select(`
      *,
      recurso_bruto(*),
      sello_validacion(*),
      calificacion(puntuacion, comentario, fecha)
    `)
    .eq('id_recurso', id)
    .single()

  if (error) throw new Error(error.message)

  const { data: calif, error: errorCalif } = await supabase
    .from('vista_calificacion_recurso')
    .select('promedio, total_calificaciones')
    .eq('id_recurso', id)
    .maybeSingle()

  if (errorCalif) throw new Error(errorCalif.message)

  return {
    ...data,
    promedio_calificacion: calif?.promedio ?? 0,
    total_calificaciones: calif?.total_calificaciones ?? 0,
  }
}

export async function getRecursosPorRepositorio(idRepositorio: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurso')
    .select(`
      id_recurso,
      titulo,
      disponibilidad,
      recurso_bruto (
        autor,
        formato
      )
    `)
    .eq('id_repositorio', idRepositorio)
    .order('titulo', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getRepositorioById(idRepositorio: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('repositorio_externo')
    .select('id_repositorio, nombre_fuente, estado_activo')
    .eq('id_repositorio', idRepositorio)
    .single()

  if (error) throw new Error(error.message)
  return data
}