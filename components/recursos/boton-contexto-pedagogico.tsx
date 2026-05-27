'use client'

import { useState } from 'react'

type Props = {
  idRecurso: string
  contextoExistente?: string
  onGuardar?: (texto: string) => Promise<void>
}

export default function BotonContextoPedagogico({
  idRecurso,
  contextoExistente = '',
  onGuardar,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState(contextoExistente)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const tieneContexto = contextoExistente.trim().length > 0

  const handleGuardar = async () => {
    if (!texto.trim()) return
    setGuardando(true)
    try {
      await onGuardar?.(texto.trim())
      setGuardado(true)
      setTimeout(() => {
        setGuardado(false)
        setAbierto(false)
      }, 1200)
    } catch (e) {
      console.error('Error al guardar contexto:', e)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
          transition-all duration-200 cursor-pointer
          ${tieneContexto
            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
            : 'bg-white text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white'
          }
        `}
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        {tieneContexto ? 'Ver contexto pedagógico' : 'Añadir contexto pedagógico'}
      </button>

      {abierto && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-md p-4 flex flex-col gap-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Contexto pedagógico
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="Describe el objetivo de aprendizaje, el nivel educativo, sugerencias de uso o cualquier anotación pedagógica relevante..."
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent transition"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{texto.length}/600</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={guardando || !texto.trim()}
                className={`
                  px-4 py-1.5 text-xs rounded-lg font-medium transition
                  ${guardado
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
                  }
                `}
              >
                {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}