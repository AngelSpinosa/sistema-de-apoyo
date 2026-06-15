import { SupabaseClient } from '@supabase/supabase-js'

export type CalificacionResumen = {
  promedio: number
  total: number
}

/**
 * Obtiene el promedio y el total de calificaciones de un recurso.
 * Usa la función RPC get_calificacion_recurso (ver calificaciones_setup.sql).
 */
export async function obtenerCalificacion(
  supabase: SupabaseClient,
  idRecurso: string
): Promise<CalificacionResumen> {
  const { data, error } = await supabase
    .rpc('get_calificacion_recurso', { p_id_recurso: idRecurso })
    .single()

  if (error || !data) {
    console.error('Error al obtener calificación del recurso:', error)
    return { promedio: 0, total: 0 }
  }

  return {
    promedio: Number((data as any).promedio) || 0,
    total: Number((data as any).total) || 0,
  }
}

/**
 * Obtiene la calificación que el usuario actual ya dio a este recurso,
 * o null si aún no ha calificado.
 * Usa la función RPC get_mi_calificacion (ver calificaciones_setup.sql).
 */
export async function obtenerMiCalificacion(
  supabase: SupabaseClient,
  idRecurso: string
): Promise<number | null> {
  const { data, error } = await supabase
    .rpc('get_mi_calificacion', { p_id_recurso: idRecurso })

  if (error) {
    console.error('Error al obtener mi calificación:', error)
    return null
  }

  return data === null || data === undefined ? null : Number(data)
}

/**
 * Inserta o actualiza (upsert) la calificación del usuario actual para un recurso.
 * Gracias al índice único (id_usuario, id_recurso), si el usuario ya había
 * calificado, se actualiza su voto en vez de crear uno nuevo.
 */
export async function calificarRecurso(
  supabase: SupabaseClient,
  idRecurso: string,
  valor: number
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuario no autenticado' }

  const { error } = await supabase
    .from('calificacion')
    .upsert(
      {
        id_recurso: idRecurso,
        id_usuario: user.id,
        puntuacion: valor,
        fecha: new Date().toISOString(),
      },
      { onConflict: 'id_usuario,id_recurso' }
    )

  if (error) {
    console.error('Error al calificar recurso:', error)
    return { error: error.message }
  }

  return { error: null }
}