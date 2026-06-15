// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './admin-dashboard-client'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('repositorio_externo')
    .select('id_repositorio, nombre_fuente, endpoint_api, estado_activo')
    .order('nombre_fuente', { ascending: true })

  if (error) throw new Error(error.message)

  return <AdminDashboardClient repositoriosDB={data ?? []} />
} 