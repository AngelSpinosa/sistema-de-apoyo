import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { nombre, apellidos, correo, rol, contrasena } = await req.json()

  // Paso 1: crear en Auth con signUp
  const { data, error } = await supabaseAdmin.auth.signUp({
    email: correo,
    password: contrasena,
  })

  if (error) {
    console.error('Error Auth:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!data.user) {
    return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 400 })
  }

  // Paso 2: INSERT usando el cliente admin con service_role
  // Usamos from() directamente sobre supabaseAdmin que tiene service_role
  const { error: errorInsert } = await supabaseAdmin
  .rpc('insertar_usuario', {
    p_id: data.user.id,
    p_nombre: nombre,
    p_apellidos: apellidos,
    p_correo: correo,
    p_rol: rol,
  })

  if (errorInsert) {
    console.error('Error insert:', errorInsert.message)
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ error: errorInsert.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}