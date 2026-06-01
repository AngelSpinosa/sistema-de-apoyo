'use client'

import { MoreVertical, Star } from 'lucide-react'
import { useState } from 'react'
import OpcionesRecurso from "../busqueda/opciones-recurso"

type Props = {
  idRecurso: string   // ← agregar
  titulo: string
  fuente: string
  descripcion: string
  promedio: number
  miniatura?: string
  onClick?: () => void
}

export default function TarjetaRecurso({
  idRecurso,
  titulo,
  fuente,
  descripcion,
  promedio,
  miniatura,
  onClick,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false)

  return (
    <div
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
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

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {titulo}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{fuente}</span>
          </div>

          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={12}
                className={
                  i <= Math.round(promedio)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 truncate">{descripcion}</p>
        </div>

        {/* Botón menú con opciones */}
        <div className="relative shrink-0">
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
    </div>
  )
}