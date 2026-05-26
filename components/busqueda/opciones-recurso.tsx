'use client'

import { Bookmark, Share2, EyeOff } from 'lucide-react'
import { useEffect, useRef } from 'react'

type Props = {
  visible: boolean
  onCerrar: () => void
  onGuardar: () => void
  onCompartir: () => void
  onNoMeInteresa: () => void
}

export default function OpcionesRecurso({
  visible,
  onCerrar,
  onGuardar,
  onCompartir,
  onNoMeInteresa,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCerrar()
      }
    }
    if (visible) document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [visible, onCerrar])

  if (!visible) return null

  const opciones = [
    {
      icono: <Bookmark size={16} className="text-gray-500" />,
      etiqueta: 'Guardar recurso',
      accion: onGuardar,
    },
    {
      icono: <Share2 size={16} className="text-gray-500" />,
      etiqueta: 'Compartir',
      accion: onCompartir,
    },
    {
      icono: <EyeOff size={16} className="text-gray-500" />,
      etiqueta: 'No me interesa',
      accion: onNoMeInteresa,
    },
  ]

  return (
    <div
      ref={ref}
      className="absolute right-0 top-6 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
    >
      {opciones.map((op) => (
        <button
          key={op.etiqueta}
          onClick={(e) => {
            e.stopPropagation()
            op.accion()
            onCerrar()
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          {op.icono}
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}