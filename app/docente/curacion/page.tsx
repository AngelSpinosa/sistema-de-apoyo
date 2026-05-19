// src/app/(docente)/curacion/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CuracionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: curaciones } = await supabase
    .from('recurso_curado')
    .select(`
      id_curacion,
      recurso (id_recurso, titulo, promedio_calificacion),
      metadato_pedagogico (objetivo_aprendizaje, nivel_dificultad)
    `)
    .eq('id_docente', user.id)

  return (
    <div>
      <h1>Mis recursos curados</h1>
      {curaciones?.map(c => (
        <div key={c.id_curacion}>
          <p>{(c.recurso as any)?.titulo}</p>
          <p>{(c.metadato_pedagogico as any)?.nivel_dificultad}</p>
        </div>
      ))}
    </div>
  )
}