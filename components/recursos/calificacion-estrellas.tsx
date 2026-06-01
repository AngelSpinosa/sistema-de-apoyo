'use client'

import { useState } from 'react'

type Props = {
  promedio?: number
  total?: number
  onCalificar?: (valor: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function CalificacionEstrellas({
  promedio = 0,
  total,
  onCalificar,
  readonly = false,
  size = 'md',
}: Props) {
  const [hover, setHover] = useState(0)
  const [seleccionada, setSeleccionada] = useState(0)

  const valorMostrado = hover || seleccionada || promedio

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const gapMap = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  }

  const handleClick = (valor: number) => {
    if (readonly) return
    setSeleccionada(valor)
    onCalificar?.(valor)
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex ${gapMap[size]}`}>
        {[1, 2, 3, 4, 5].map((estrella) => {
          const llena = estrella <= Math.floor(valorMostrado)
          const media =
            !llena &&
            estrella === Math.ceil(valorMostrado) &&
            valorMostrado % 1 >= 0.5

          return (
            <button
              key={estrella}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(estrella)}
              onMouseEnter={() => !readonly && setHover(estrella)}
              onMouseLeave={() => !readonly && setHover(0)}
              className={`relative ${sizeMap[size]} transition-transform duration-100 ${
                !readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
              }`}
              aria-label={`${estrella} estrella${estrella > 1 ? 's' : ''}`}
            >
              {/* Estrella vacía (fondo) */}
              <svg
                viewBox="0 0 24 24"
                className={`absolute inset-0 w-full h-full`}
                fill="none"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="#D1D5DB"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Estrella llena o media */}
              {(llena || media) && (
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 w-full h-full"
                  style={media ? { clipPath: 'inset(0 50% 0 0)' } : {}}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#F59E0B"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {typeof total === 'number' && (
        <span className="text-sm text-gray-500">
          ({total} {total === 1 ? 'calificación' : 'calificaciones'})
        </span>
      )}
    </div>
  )
}