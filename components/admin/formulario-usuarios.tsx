'use client'

import { useState } from 'react'

type DatosUsuario = {
  nombre: string
  apellidos: string
  correo: string
  rol: 'docente' | 'estudiante' | 'administrador'
  contrasena?: string
}

type Props = {
  datosIniciales?: Partial<DatosUsuario>
  modoEdicion?: boolean
  onGuardar: (datos: DatosUsuario) => Promise<void>
  onCerrar: () => void
}

const ROLES = [
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'administrador', label: 'Administrador' },
]

export default function FormularioUsuarios({
  datosIniciales = {},
  modoEdicion = false,
  onGuardar,
  onCerrar,
}: Props) {
  const [nombre, setNombre]       = useState(datosIniciales.nombre ?? '')
  const [apellidos, setApellidos] = useState(datosIniciales.apellidos ?? '')
  const [correo, setCorreo]       = useState(datosIniciales.correo ?? '')
  const [rol, setRol]             = useState<DatosUsuario['rol']>(datosIniciales.rol ?? 'estudiante')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleGuardar = async () => {
    if (!nombre.trim() || !correo.trim()) return
    if (!modoEdicion && !contrasena.trim()) {
      setError('La contraseña es obligatoria para nuevos usuarios.')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        rol,
        contrasena: contrasena.trim() || undefined,
      })
      setGuardado(true)
      setTimeout(() => { setGuardado(false); onCerrar() }, 1000)
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar usuario.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-5 p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {modoEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >✕</button>
        </div>

        {/* Nombre */}
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          maxLength={80}
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
        />

        {/* Apellidos */}
        <input
          type="text"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          placeholder="Apellidos"
          maxLength={80}
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
        />

        {/* Correo */}
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo institucional"
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
        />

        {/* Rol */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium px-1">Rol</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRol(r.value as DatosUsuario['rol'])}
                className={`flex-1 py-2 rounded-full text-xs font-semibold border transition ${
                  rol === r.value
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium px-1">
            {modoEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          </label>
          <div className="relative">
            <input
              type={verContrasena ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-full border border-gray-200 px-4 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
            />
            <button
              type="button"
              onClick={() => setVerContrasena(!verContrasena)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
            >
              {verContrasena ? (
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 px-1">{error}</p>}

        {/* Botón */}
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando || !nombre.trim() || !correo.trim()}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
            guardado
              ? 'bg-emerald-500 text-white'
              : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </div>
  )
}