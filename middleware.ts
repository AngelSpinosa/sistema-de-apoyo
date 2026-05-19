import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirigir a login si no hay sesión y la ruta es protegida
  const rutasProtegidas = ['/docente', '/estudiante', '/admin']
  const esRutaProtegida = rutasProtegidas.some(r => pathname.startsWith(r))

  if (!user && esRutaProtegida) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar rol para rutas de administrador
  if (user && pathname.startsWith('/admin')) {
    const { data: perfil } = await supabase
      .from('usuario')
      .select('rol')
      .eq('id_usuario', user.id)
      .single()

    if (perfil?.rol !== 'administrador') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Verificar rol para rutas de docente
  if (user && pathname.startsWith('/docente')) {
    const { data: perfil } = await supabase
      .from('usuario')
      .select('rol')
      .eq('id_usuario', user.id)
      .single()

    if (perfil?.rol !== 'docente') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}