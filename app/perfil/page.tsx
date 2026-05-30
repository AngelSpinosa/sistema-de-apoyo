import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaginaPerfil from '@/components/perfil/pagina-perfil'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuario')
    .select('nombre, apellidos, correo, rol, url_fotografia')
    .eq('id_usuario', user.id)
    .single()

  return (
    <PaginaPerfil
      datosIniciales={{
        nombre: usuario?.nombre ?? '',
        apellidos: usuario?.apellidos ?? '',
        correo: usuario?.correo ?? user.email ?? '',
        rol: usuario?.rol ?? 'docente',
        fotoUrl: usuario?.url_fotografia ?? undefined,
      }}
      userId={user.id}
    />
  )
}