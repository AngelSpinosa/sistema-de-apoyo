'use client'

import React, { useState } from 'react'
import { Menu, Users, Settings, User, Database, LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SidebarAdmin() {
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const navegar = (ruta: string) => {
    router.push(ruta)
    setAbierto(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const botones = [
    {
      icono: <Database size={22} />,
      etiqueta: 'Repositorios',
      ruta: '/admin/dashboard',
    },
    {
      icono: <Users size={22} />,
      etiqueta: 'Usuarios',
      ruta: '/admin/usuarios',
    },
    {
      icono: <Settings size={22} />,
      etiqueta: 'Configuración',
      ruta: '/admin/configuracion',
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
        <button
          onClick={() => setAbierto(!abierto)}
          className="mt-4 p-2 rounded-lg hover:bg-white/10 transition"
        >
          <Menu size={24} />
        </button>

        <nav className="flex flex-col gap-2 mt-6 w-full px-2">
          {botones.map((btn) => {
            const activo = pathname === btn.ruta
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

        <div className="mt-auto mb-4 flex flex-col items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-500/30 transition text-white/70 hover:text-white"
            title="Cerrar sesión"
          >
            <LogOut size={22} />
          </button>
        </div>
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