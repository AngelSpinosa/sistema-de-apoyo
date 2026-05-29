'use client'

import { useState, useRef } from 'react'

type DatosColeccion = {
  nombre: string
  privacidad: 'privada' | 'publica'
  descripcion: string
  fotografia?: File
}

type Props = {
  datosIniciales?: Partial<DatosColeccion>
  onGuardar: (datos: DatosColeccion) => Promise<void>
  onCerrar: () => void
  modoEdicion?: boolean
}

export default function FormularioColeccion({ datosIniciales = {}, onGuardar, onCerrar, modoEdicion = false }: Props) {
  const [nombre, setNombre]         = useState(datosIniciales.nombre ?? '')
  const [privada, setPrivada]       = useState(datosIniciales.privacidad !== 'publica')
  const [descripcion, setDescripcion] = useState(datosIniciales.descripcion ?? '')
  const [fotografia, setFotografia] = useState<File | null>(null)
  const [preview, setPreview]       = useState<string | null>(null)
  const [guardando, setGuardando]   = useState(false)
  const [guardado, setGuardado]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotografia(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        privacidad: privada ? 'privada' : 'publica',
        descripcion: descripcion.trim(),
        fotografia: fotografia ?? undefined,
      })
      setGuardado(true)
      setTimeout(() => { setGuardado(false); onCerrar() }, 1000)
    } catch (e) {
      console.error('Error guardando colección:', e)
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
            {modoEdicion ? 'Editar colección' : 'Nueva colección'}
          </h2>
          <button type="button" onClick={onCerrar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">✕</button>
        </div>

        {/* Nombre */}
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre colección"
          maxLength={80}
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
        />

        {/* Toggle privacidad */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Privado</span>
          <button
            type="button"
            onClick={() => setPrivada((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${privada ? 'bg-[#003087]' : 'bg-gray-200'}`}
            aria-pressed={privada}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${privada ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Fotografía */}
        <div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          {preview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setFotografia(null); setPreview(null) }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70 transition"
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Fotografía
            </button>
          )}
        </div>

        {/* Descripción */}
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Añade una breve descripción de tu colección"
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
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
          {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear colección'}
        </button>
      </div>
    </div>
  )
}