import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaginaPerfil from '@/components/perfil/pagina-perfil'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Traemos los datos base del usuario (Asegurando usar correo_institucional)
  const { data: usuario } = await supabase
    .from('usuario')
    .select('nombre, apellidos, correo_institucional, rol, url_fotografia')
    .eq('id_usuario', user.id)
    .single()

  let carrera = ''
  let semestre = ''
  let academias: string[] = []

  // Consultas específicas por rol (Solo lectura)
  if (usuario?.rol === 'estudiante') {
    const { data: est } = await supabase.from('estudiante').select('carrera, semestre').eq('id_usuario', user.id).maybeSingle()
    if (est) {
      carrera = est.carrera ?? ''
      semestre = est.semestre?.toString() ?? ''
    }
  } else if (usuario?.rol === 'docente') {
    const { data: doc } = await supabase.from('docente').select('academias').eq('id_usuario', user.id).maybeSingle()
    if (doc) {
      academias = doc.academias ?? []
    }
  }

  return (
    <PaginaPerfil
      datosIniciales={{
        nombre: usuario?.nombre ?? '',
        apellidos: usuario?.apellidos ?? '',
        correo: usuario?.correo_institucional ?? user.email ?? '',
        rol: usuario?.rol ?? 'docente',
        fotoUrl: usuario?.url_fotografia ?? undefined,
        carrera,
        semestre,
        academias,
      }}
      userId={user.id}
    />
  )
}