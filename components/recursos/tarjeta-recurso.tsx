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
  promedio: number
  miniatura?: string
  // Agregamos estas dos props para que la tarjeta genere la miniatura por sí sola
  urlFuente?: string 
  formato?: string
  onClick?: () => void
}

export default function TarjetaRecurso({
  idRecurso,
  titulo,
  fuente,
  descripcion,
  promedio,
  miniatura,
  urlFuente,
  formato,
  onClick,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false)

  // Si no pasaron miniatura explícitamente, intentamos generarla con la URL y formato
  const urlImagen = miniatura || generarMiniaturaCloudinary(urlFuente, formato)

  return (
    <div
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
        {urlImagen ? (
          <img
            src={urlImagen}
            alt={titulo}
            // Añadimos object-cover y object-top para que documentos largos se vean bien (la cabecera)
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">Sin portada</span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 mt-1">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {titulo}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{fuente}</span>
          </div>

          <div className="flex gap-0.5 mt-0.5">
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

          <p className="text-xs text-gray-400 truncate mt-1">{descripcion}</p>
        </div>

        {/* Botón menú con opciones */}
        <div className="relative shrink-0">
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
    </div>
  )
}