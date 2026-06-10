'use client'

import { MoreVertical, Star } from 'lucide-react'
import { useState } from 'react'
import OpcionesRecurso from "../busqueda/opciones-recurso"
import { generarMiniaturaCloudinary } from '@/lib/cloudinary/utils'

type Props = {
  idRecurso: string
  titulo: string
  fuente: string
  descripcion: string
  tipo: string
  promedio: number
  miniatura?: string
  urlFuente?: string // ← Agregado
  formato?: string   // ← Agregado
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
  urlFuente, // ← Agregado
  formato,   // ← Agregado
  onClick,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false)

  // Generamos la miniatura si no viene explícita
  const urlImagen = miniatura || generarMiniaturaCloudinary(urlFuente, formato)

  return (
    <div
      className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition group"
      onClick={onClick}
    >
      <div className="w-44 h-28 shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
        {urlImagen ? (
          <img
            src={urlImagen}
            alt={titulo}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
             <span className="text-xs text-gray-400">Sin portada</span>
          </div>
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
        <span className="text-xs text-gray-500 uppercase tracking-wide">{tipo}</span>
        <span className="text-xs text-gray-500">{fuente}</span>
        <p className="text-xs text-gray-400 truncate">{descripcion}</p>
      </div>

      <div className="relative shrink-0 self-start mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuVisible(!menuVisible)
          }}
          className="p-1.5 rounded-md hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
        >
          <MoreVertical size={16} />
        </button>

        <OpcionesRecurso
          idRecurso={idRecurso}
          visible={menuVisible}
          onCerrar={() => setMenuVisible(false)}
          onCompartir={() => console.log('Compartir:', titulo)}
          onNoMeInteresa={() => console.log('No me interesa:', titulo)}
        />
      </div>
    </div>
  )
}