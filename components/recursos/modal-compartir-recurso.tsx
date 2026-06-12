'use client'

import { useState } from 'react'

type Props = {
  idRecurso: string
  titulo: string
  onCerrar: () => void
}

export default function ModalCompartirRecurso({ idRecurso, titulo, onCerrar }: Props) {
  // Genera el enlace directo al recurso en crudo dentro del dashboard
  const url = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/recurso/${idRecurso}` : ''
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Compartir recurso</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >✕</button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#003087] fill-current shrink-0">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          <p className="text-sm font-medium text-gray-700 truncate">{titulo}</p>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          Copia el enlace a continuación para compartir el material original. Los usuarios que lo abran necesitarán acceder al sistema.
        </p>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 truncate flex-1 font-mono">{url}</p>
          <button
            type="button"
            onClick={handleCopiar}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              copiado
                ? 'bg-emerald-500 text-white'
                : 'bg-[#003087] text-white hover:bg-[#002070]'
            }`}
          >
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Listo
        </button>
      </div>
    </div>
  )
}