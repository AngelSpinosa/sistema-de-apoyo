import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log('[eliminar-usuario] URL:', url)
  console.log('[eliminar-usuario] KEY (primeros 20 chars):', key?.slice(0, 20))

  const supabaseAdmin = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    },
  })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  console.log('[eliminar-usuario] Borrando:', id)

  // 1. Tablas sin CASCADE (NO ACTION) — borrar primero
  const { error: e1 } = await supabaseAdmin.from('recurso_curado').delete().eq('id_docente', id)
  if (e1) { console.error('recurso_curado:', e1.message); return NextResponse.json({ error: e1.message }, { status: 400 }) }

  const { error: e2 } = await supabaseAdmin.from('sello_validacion').delete().eq('id_docente', id)
  if (e2) { console.error('sello_validacion:', e2.message); return NextResponse.json({ error: e2.message }, { status: 400 }) }

  // 2. Intentar borrar desde auth.users via Admin API REST directamente
  //    (evita el SDK que puede tener el bug de "User not allowed")
  const deleteRes = await fetch(
    `${url}/auth/v1/admin/users/${id}`,
    {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  )

  if (!deleteRes.ok) {
    const body = await deleteRes.text()
    console.error('[eliminar-usuario] Error REST auth API:', body)

    // Fallback: si falla la Auth API, al menos borramos de la tabla usuario
    // para que no aparezca en la UI (quedará huérfano en auth.users)
    const { error: e3 } = await supabaseAdmin.from('usuario').delete().eq('id_usuario', id)
    if (e3) return NextResponse.json({ error: e3.message }, { status: 400 })

    return NextResponse.json({
      ok: true,
      warning: 'Borrado de tabla usuario pero no de auth.users: ' + body
    })
  }

  console.log('[eliminar-usuario] Borrado correctamente de auth.users')
  return NextResponse.json({ ok: true })
}