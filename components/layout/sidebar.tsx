'use client'

import React, { useState, useEffect } from 'react'
import { Menu, Bookmark, Settings, User } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false)
  const [rol, setRol] = useState<'docente' | 'estudiante' | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function obtenerRol() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('usuario')
        .select('rol')
        .eq('id_usuario', user.id)
        .single()
      if (data?.rol === 'docente' || data?.rol === 'estudiante') {
        setRol(data.rol)
      }
    }
    obtenerRol()
  }, [])

  const rutaColecciones = rol === 'docente'
    ? '/docente/colecciones'
    : '/estudiante/biblioteca'

  const navegar = (ruta: string) => {
    router.push(ruta)
    setAbierto(false)
  }

  const botones = [
    {
      icono: <Bookmark size={22} />,
      etiqueta: 'Colecciones',
      ruta: rutaColecciones,
      matchRutas: ['/docente/colecciones', '/estudiante/biblioteca'],
    },
    {
      icono: <Settings size={22} />,
      etiqueta: 'Configuración',
      ruta: '/configuracion',
      matchRutas: ['/configuracion'],
    },
  ]

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col items-center
          bg-[#003087] text-white
          transition-all duration-300 ease-in-out
          ${abierto ? 'w-48' : 'w-14'}
        `}
      >
        {/* Hamburguesa */}
        <button
          onClick={() => setAbierto(!abierto)}
          className="mt-4 p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 mt-6 w-full px-2">
          {botones.map((btn) => {
            const activo = btn.matchRutas.some((r) => pathname.startsWith(r))
            return (
              <button
                key={btn.etiqueta}
                onClick={() => navegar(btn.ruta)}
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-lg
                  hover:bg-white/10 transition w-full
                  ${activo ? 'bg-white/20' : ''}
                `}
              >
                <span className="shrink-0">{btn.icono}</span>
                {abierto && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {btn.etiqueta}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Perfil */}
        <button
          onClick={() => navegar('/perfil')}
          className="mt-auto mb-4 p-2 rounded-full hover:bg-white/10 transition"
          aria-label="Perfil"
        >
          <User size={24} />
        </button>
      </aside>

      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setAbierto(false)}
        />
      )}
    </>
  )
}