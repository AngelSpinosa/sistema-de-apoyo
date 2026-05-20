'use client'

import React, { useState } from 'react'
import { Menu, Bookmark, Settings, User } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navegar = (ruta: string) => {
    router.push(ruta)
    setAbierto(false)
  }

  const botones = [
    {
      icono: <Bookmark size={22} />,
      etiqueta: 'Colecciones',
      ruta: '/colecciones',
    },
    {
      icono: <Settings size={22} />,
      etiqueta: 'Configuración',
      ruta: '/configuracion',
    },
  ]

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col items-center
          bg-[#003087] text-white
          transition-all duration-300 ease-in-out
          ${abierto ? 'w-48' : 'w-14'}
        `}
      >
        {/* Botón hamburguesa */}
        <button
          onClick={() => setAbierto(!abierto)}
          className="mt-4 p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>

        {/* Botones de navegación */}
        <nav className="flex flex-col gap-2 mt-6 w-full px-2">
          {botones.map((btn) => {
            const activo = pathname.startsWith(btn.ruta)
            return (
              <button
                key={btn.ruta}
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

        {/* Botón de perfil abajo */}
        <button
          onClick={() => navegar('/perfil')}
          className="mt-auto mb-4 p-2 rounded-full hover:bg-white/10 transition"
          aria-label="Perfil"
        >
          <User size={24} />
        </button>
      </aside>

      {/* Overlay al abrir en móvil */}
      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setAbierto(false)}
        />
      )}
    </>
  )
}