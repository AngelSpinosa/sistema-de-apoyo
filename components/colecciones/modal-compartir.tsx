'use client'

import { useState } from 'react'

type Props = {
  coleccion: {
    id: string
    nombre: string
    privacidad: 'privada' | 'publica'
  }
  onCerrar: () => void
}

export default function ModalCompartir({ coleccion, onCerrar }: Props) {
  const url = `${window.location.origin}/colecciones/${coleccion.id}`
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Fallback para navegadores sin permisos de clipboard
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
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Compartir colección</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >✕</button>
        </div>

        {/* Nombre de la colección */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <svg viewBox="0 0 48 48" className="w-5 h-5 text-[#003087] fill-current shrink-0">
            <path d="M6 8a2 2 0 012-2h10l4 4h18a2 2 0 012 2v26a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-sm font-medium text-gray-700 truncate">{coleccion.nombre}</p>
          <span className="ml-auto shrink-0 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            Pública
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-500 leading-relaxed">
          Cualquier persona con este enlace podrá ver los recursos de esta colección sin necesidad de iniciar sesión.
        </p>

        {/* URL + botón copiar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-gray-400 shrink-0">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
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
            {copiado ? (
              <>
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Botón cerrar */}
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