'use client'

import { MoreVertical, Star } from 'lucide-react'
import { useState } from 'react'
import OpcionesRecurso from "../busqueda/opciones-recurso"

type Props = {
  idRecurso: string   // ← agregar
  titulo: string
  fuente: string
  descripcion: string
  tipo: string
  promedio: number
  miniatura?: string
  onClick?: () => void
}


export default function TarjetaRecursoBusqueda({
  idRecurso,
  titulo,
  fuente,
  descripcion,
  tipo,
  promedio,
  miniatura,
  onClick,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false)

  return (
    <div
      className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition group"
      onClick={onClick}
    >
      <div className="w-44 h-28 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
        {miniatura ? (
          <img
            src={miniatura}
            alt={titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-base font-semibold text-gray-900">{titulo}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={14}
              className={
                i <= Math.round(promedio)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{tipo}</span>
        <span className="text-xs text-gray-500">{fuente}</span>
        <p className="text-xs text-gray-400 truncate">{descripcion}</p>
      </div>

      <div className="relative shrink-0 self-start mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuVisible(!menuVisible)
          }}
          className="p-1 rounded hover:bg-gray-100 transition"
        >
          <MoreVertical size={16} className="text-gray-400" />
        </button>

        <OpcionesRecurso
          idRecurso={idRecurso}   // ← agregar
          visible={menuVisible}
          onCerrar={() => setMenuVisible(false)}
          onCompartir={() => console.log('Compartir:', titulo)}
          onNoMeInteresa={() => console.log('No me interesa:', titulo)}
        />
      </div>
    </div>
  )
}