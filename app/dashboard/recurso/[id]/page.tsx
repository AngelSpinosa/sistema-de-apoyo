import DetalleRecursoPage from '@/app/dashboard/recurso/[id]/detalle-recurso-page'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string }>
}


export default async function Page({ params }: Props) {
  const { id } = await params                    // ← await en params (Next.js 15)
  const supabase = await createClient()          // ← await aquí es el fix principal

  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('usuario')
    .select('rol, docente(es_miembro_academia)')
    .eq('id_usuario', user?.id)
    .single()

  const rol = perfil?.rol ?? 'estudiante'
  const esMiembro = (perfil as any)?.docente?.[0]?.es_miembro_academia ?? false

  return (
    <DetalleRecursoPage
      idRecurso={id}
      rol={rol}
      esMiembroAcademia={esMiembro}
    />
  )
}