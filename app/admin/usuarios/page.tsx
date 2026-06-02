'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import TablaUsuarios from '@/components/admin/tabla-usuarios'
import FormularioUsuarios from '@/components/admin/formulario-usuarios'

type Usuario = {
  id: string
  nombre: string
  apellidos: string
  correo: string
  rol: 'docente' | 'estudiante' | 'administrador'
}

type FiltroRol = 'todos' | 'docente' | 'estudiante' | 'administrador'

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios]           = useState<Usuario[]>([])
  const [cargando, setCargando]           = useState(true)
  const [busqueda, setBusqueda]           = useState('')
  const [filtroRol, setFiltroRol]         = useState<FiltroRol>('todos')
  const [filtroAbierto, setFiltroAbierto] = useState(false)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
  const supabase = createClient()

  useEffect(() => { cargarUsuarios() }, [])

  async function cargarUsuarios() {
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario, nombre, apellidos, correo_institucional, rol')
      .order('nombre', { ascending: true })

    if (error) { console.error(error); setCargando(false); return }

    setUsuarios((data ?? []).map((u: any) => ({
      id: u.id_usuario,
      nombre: u.nombre ?? '',
      apellidos: u.apellidos ?? '',
      correo: u.correo_institucional ?? '',
      rol: u.rol,
    })))
    setCargando(false)
  }

  const usuariosFiltrados = useMemo(() => {
    let res = usuarios
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      res = res.filter((u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q)
      )
    }
    if (filtroRol !== 'todos') res = res.filter((u) => u.rol === filtroRol)
    return res
  }, [usuarios, busqueda, filtroRol])

  const handleCrear = async (datos: any) => {
    const res = await fetch('/api/admin/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error ?? 'Error al crear usuario')
    }
    await cargarUsuarios()
  }

  const handleEditar = async (datos: any) => {
    if (!usuarioEditar) return
    const updates: any = {
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      correo: datos.correo,
      rol: datos.rol,
    }
    const { error } = await supabase
      .from('usuario')
      .update(updates)
      .eq('id_usuario', usuarioEditar.id)
    if (error) throw new Error(error.message)
    await cargarUsuarios()
  }

  const handleEliminar = async (id: string) => {
    const { error } = await supabase.from('usuario').delete().eq('id_usuario', id)
    if (error) { console.error(error); return }
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto relative min-h-screen">

      {/* Modales */}
      {modalNuevo && (
        <FormularioUsuarios
          onGuardar={handleCrear}
          onCerrar={() => setModalNuevo(false)}
        />
      )}
      {usuarioEditar && (
        <FormularioUsuarios
          datosIniciales={usuarioEditar}
          modoEdicion
          onGuardar={handleEditar}
          onCerrar={() => setUsuarioEditar(null)}
        />
      )}

      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Usuarios</h1>

      {/* Barra búsqueda + filtros */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <svg viewBox="0 0 20 20" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-gray-400 pointer-events-none">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar recurso por ID o por título"
            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition bg-white"
          />
          {busqueda && (
            <button type="button" onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        {/* Filtro rol */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFiltroAbierto((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
              filtroRol !== 'todos'
                ? 'bg-[#003087] text-white border-[#003087]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filtros
            {filtroRol !== 'todos' && (
              <span className="bg-white text-[#003087] rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">1</span>
            )}
          </button>

          {filtroAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFiltroAbierto(false)} />
              <div className="absolute right-0 top-11 z-20 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-52 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</p>
                {(['todos', 'docente', 'estudiante', 'administrador'] as FiltroRol[]).map((op) => (
                  <label key={op} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="filtro-rol"
                      checked={filtroRol === op}
                      onChange={() => { setFiltroRol(op); setFiltroAbierto(false) }}
                      className="accent-[#003087]"
                    />
                    <span className="text-sm text-gray-700 capitalize">{op === 'todos' ? 'Todos' : op}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400 text-sm">Cargando usuarios...</p>
        </div>
      ) : (
        <TablaUsuarios
          usuarios={usuariosFiltrados}
          onEditar={(u) => setUsuarioEditar(u)}
          onEliminar={handleEliminar}
        />
      )}

      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setModalNuevo(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#003087] text-white rounded-full shadow-lg hover:bg-[#002070] hover:shadow-xl transition-all duration-200 z-30 flex items-center justify-center"
        aria-label="Nuevo usuario"
      >
        <svg viewBox="0 0 20 20" className="w-6 h-6 fill-current">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}