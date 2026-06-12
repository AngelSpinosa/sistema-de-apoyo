'use client'

import { useState, useRef } from 'react'

type DatosPerfil = {
  nombre: string
  apellidos: string
  correo: string
  rol: string
  fotoUrl?: string
  carrera?: string
  semestre?: string
  academias?: string[]
}

// Tipo que recibe el formulario de edición (solo los editables reales)
type DatosEditables = {
  nombre: string
  apellidos: string
  correo: string
  fotoUrl?: string
  foto?: File
}

type Props = {
  datosIniciales: DatosPerfil
  onGuardar: (datos: DatosEditables) => Promise<void>
  onCerrar: () => void
}

export default function FormularioEditarPerfil({ datosIniciales, onGuardar, onCerrar }: Props) {
  const [nombre, setNombre]       = useState(datosIniciales.nombre)
  const [apellidos, setApellidos] = useState(datosIniciales.apellidos)
  const [correo, setCorreo]       = useState(datosIniciales.correo)
  
  const [foto, setFoto]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(datosIniciales.fotoUrl ?? null)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        foto: foto ?? undefined,
      })
      setGuardado(true)
      setTimeout(() => { setGuardado(false); onCerrar() }, 1000)
    } catch (e) {
      console.error('Error guardando perfil:', e)
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
          <h2 className="text-lg font-bold text-gray-900">Editar perfil</h2>
          <button type="button" onClick={onCerrar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">✕</button>
        </div>

        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          <div
            className="w-20 h-20 rounded-full overflow-hidden bg-[#003087] flex items-center justify-center cursor-pointer hover:opacity-80 transition relative group"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
              <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400">Clic para cambiar foto</p>
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

        {/* Botón */}
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando || !nombre.trim()}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
            guardado ? 'bg-emerald-500 text-white' : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}