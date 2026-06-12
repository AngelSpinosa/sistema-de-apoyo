'use client'

import React, { useState, useEffect } from 'react'
import { Menu, Bookmark, Settings, User, Home, History } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createPortal } from 'react-dom'


export default function Sidebar() {
  const [abierto, setAbierto] = useState(false)
  const [rol, setRol] = useState<'docente' | 'estudiante' | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [menuPerfil, setMenuPerfil] = useState(false)
  const [menuPerfilPos, setMenuPerfilPos] = useState({ top: 0, left: 0 })
  const botonPerfilRef = React.useRef<HTMLButtonElement>(null)

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

  const abrirMenuPerfil = () => {
    if (botonPerfilRef.current) {
      const rect = botonPerfilRef.current.getBoundingClientRect()
      setMenuPerfilPos({
        top: rect.top + window.scrollY - 8,   // aparece arriba del botón
        left: rect.right + window.scrollX + 8,
      })
    }
    setMenuPerfil((v) => !v)
  }

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const rutaColecciones = rol === 'docente'
    ? '/docente/colecciones'
    : '/estudiante/biblioteca'

  const navegar = (ruta: string) => {
    router.push(ruta)
    setAbierto(false)
  }

    const botones = [
    {
      icono: <Home size={22} />,
      etiqueta: 'Inicio',
      ruta: '/dashboard',
      matchRutas: ['/dashboard'],
    },
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
    {
      icono: <History size={22} />,
      etiqueta: 'Historial',
      ruta: '/dashboard/historial',
      matchRutas: ['/dashboard/historial'],
    }
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
            className="mt-4 p-2 rounded-lg hover:bg-white/10 transition flex flex-col items-center gap-0.5 w-full"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
            {!abierto && <span className="text-[9px] font-medium text-white/70">Opciones</span>}
          </button>

        {/* Navegación */}
          <nav className="flex flex-col gap-1 mt-4 w-full px-1">
            {botones.map((btn) => {
              const activo = btn.matchRutas.some((r) => pathname.startsWith(r))
              return (
                <button
                  key={btn.etiqueta}
                  onClick={() => navegar(btn.ruta)}
                  className={`
                    flex items-center gap-3 px-2 py-2 rounded-lg
                    hover:bg-white/10 transition w-full
                    ${!abierto ? 'flex-col gap-0.5 py-2' : ''}
                    ${activo ? 'bg-white/20' : ''}
                  `}
                >
                  <span className="shrink-0">{btn.icono}</span>
                  {abierto
                    ? <span className="text-sm font-medium whitespace-nowrap">{btn.etiqueta}</span>
                    : <span className="text-[9px] font-medium text-white/70">{btn.etiqueta}</span>
                  }
                </button>
              )
            })}
          </nav>

        {/* Perfil — reemplaza el botón existente */}
        <button
          ref={botonPerfilRef}
          onClick={abrirMenuPerfil}
          className="mt-auto mb-4 p-2 rounded-full hover:bg-white/10 transition"
          aria-label="Perfil"
        >
          <User size={24} />
          <span className="text-[9px] font-medium text-white/70">Yo</span>
        </button>
      </aside>

      {/* Portal del dropdown de perfil */}
      {menuPerfil && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setMenuPerfil(false)}
          />
          <div
            className="absolute z-[101] bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 text-sm overflow-hidden"
            style={{ top: menuPerfilPos.top, left: menuPerfilPos.left }}
          >
            <button
              type="button"
              onClick={() => { setMenuPerfil(false); navegar('/perfil') }}
              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
            >
              <User size={16} className="text-gray-400" />
              Ir al perfil
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              type="button"
              onClick={handleCerrarSesion}
              className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition flex items-center gap-2"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L8.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zM11 10a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </>,
        document.body
      )}


      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setAbierto(false)}
        />
      )}
    </>
  )
}