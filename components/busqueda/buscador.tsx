'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

type Props = {
  onBuscar?: (termino: string) => void
  onFiltrar?: () => void
  valor?: string
  onChange?: (termino: string) => void
}

export default function Buscador({ onBuscar, onFiltrar, valor = '', onChange }: Props) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar recurso"
          value={valor}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onBuscar?.(valor)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
        {valor && (
          <button
            onClick={() => onChange?.('')}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

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