'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

type Props = {
  onBuscar?: (termino: string) => void
  onFiltrar?: () => void
}

export default function BarraBusqueda({ onBuscar, onFiltrar }: Props) {
  const [termino, setTermino] = useState('')

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onBuscar?.(termino)
  }

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Input */}
      <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar recurso"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Botón filtros */}
      <button
        onClick={onFiltrar}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm hover:bg-gray-50 transition text-sm text-gray-600"
      >
        Filtros
        <SlidersHorizontal size={16} className="text-gray-500" />
      </button>
    </div>
  )
}