// app/admin/dashboard/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleRepositorio(idRepositorio: string, nuevoEstado: boolean) {
  const supabase = await createClient()

  // 1. Actualizar el estado del repositorio
  const { error: errorRepo } = await supabase
    .from('repositorio_externo')
    .update({ estado_activo: nuevoEstado })
    .eq('id_repositorio', idRepositorio)

  if (errorRepo) throw new Error(errorRepo.message)

  // 2. Propagar el cambio a los recursos, preservando el
  //    estado individual previo de cada uno (ver función
  //    toggle_repositorio_recursos en Supabase).
  const { error: errorRecursos } = await supabase.rpc('toggle_repositorio_recursos', {
    p_id_repositorio: idRepositorio,
    p_activar: nuevoEstado,
  })

  if (errorRecursos) throw new Error(errorRecursos.message)

  // 3. Refrescar las rutas que muestran estos datos
  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/repositorios/${idRepositorio}`)
}