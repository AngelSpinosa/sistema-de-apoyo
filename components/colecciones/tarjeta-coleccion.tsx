'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Coleccion = {
  id: string
  nombre: string
  privacidad: 'privada' | 'publica'
  descripcion?: string
  fotografia?: string
  totalRecursos?: number
}

type Props = {
  coleccion: Coleccion
  onClick?: () => void
  onEditar?: () => void
  onEliminar?: () => void
  onCompartir?: () => void
}

export default function TarjetaColeccion({ coleccion, onClick, onEditar, onEliminar, onCompartir }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const botonRef = useRef<HTMLButtonElement>(null)

  // Recalcula la posición del menú cada vez que se abre
  useEffect(() => {
    if (menuAbierto && botonRef.current) {
      const rect = botonRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 160, // 160 = ancho del menú (w-40)
      })
    }
  }, [menuAbierto])

  const menu = menuAbierto ? createPortal(
    <>
      {/* Overlay invisible para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={(e) => { e.stopPropagation(); setMenuAbierto(false) }}
      />
      {/* Menú */}
      <div
        className="absolute z-[101] bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40 text-sm"
        style={{ top: menuPos.top, left: menuPos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuAbierto(false); onEditar?.() }}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current text-gray-400">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuAbierto(false); onCompartir?.() }}
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current text-gray-400">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Compartir
        </button>
        <div className="border-t border-gray-100 my-1" />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuAbierto(false); onEliminar?.() }}
          className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Eliminar
        </button>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Miniatura */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {coleccion.fotografia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coleccion.fotografia}
            alt={coleccion.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg viewBox="0 0 48 48" className="w-12 h-12 text-gray-300 fill-current">
              <path d="M6 8a2 2 0 012-2h10l4 4h18a2 2 0 012 2v26a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}

        {typeof coleccion.totalRecursos === 'number' && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {coleccion.totalRecursos} {coleccion.totalRecursos === 1 ? 'recurso' : 'recursos'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{coleccion.nombre}</p>
          <p className="text-xs text-gray-400 capitalize">{coleccion.privacidad}</p>
        </div>

        {/* Botón 3 puntos */}
        <div className="relative flex-shrink-0">
          <button
            ref={botonRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuAbierto((v) => !v) }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label="Opciones"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Portal del menú */}
      {menu}
    </div>
  )
}