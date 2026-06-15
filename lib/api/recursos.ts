// src/lib/api/recursos.ts
import { createClient } from '@/lib/supabase/server'

export async function getRecursosActivos() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurso')
    .select('*, recurso_bruto(*)')
    .eq('disponibilidad', 'activo')
    .order('promedio_calificacion', { ascending: false })

  if (error) throw new Error(error.message)
  return data
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
  return data
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