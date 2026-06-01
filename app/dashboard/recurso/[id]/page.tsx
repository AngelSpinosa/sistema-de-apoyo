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
    .select('rol, nombre, docente(es_miembro_academia)')  // ← añadir nombre
    .eq('id_usuario', user?.id)
    .single()

  const rol = perfil?.rol ?? 'estudiante'
  const esMiembro = (perfil as any)?.docente?.es_miembro_academia ?? false
  console.log('perfil completo:', JSON.stringify(perfil, null, 2))
  return (
    <DetalleRecursoPage
      idRecurso={id}
      rol={rol}
      esMiembroAcademia={esMiembro}
      nombreUsuario={perfil?.nombre ?? ''}   // ← pasar aquí
    />
  )
}