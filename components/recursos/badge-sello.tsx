'use client'

import { useState } from 'react'

type EstadoSello = 'sin_sello' | 'pendiente' | 'aprobado' | 'rechazado'

type Props = {
  estadoInicial?: EstadoSello
  onSolicitar?: () => Promise<void>
  esMiembroAcademia?: boolean
}

const ESTADOS: Record<EstadoSello, { label: string; bg: string; text: string; border: string }> = {
  sin_sello: {
    label: 'Añadir sello de academia',
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
  },
  pendiente: {
    label: 'Sello en revisión',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  aprobado: {
    label: 'Sello otorgado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  rechazado: {
    label: 'Sello rechazado',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
  },
}

export default function BadgeSello({
  estadoInicial = 'sin_sello',
  onSolicitar,
  esMiembroAcademia = false,
}: Props) {
  const [estado, setEstado] = useState<EstadoSello>(estadoInicial)
  const [cargando, setCargando] = useState(false)

  const cfg = ESTADOS[estado]
  const puedeInteractuar = estado === 'sin_sello' && esMiembroAcademia

  const handleClick = async () => {
    if (!puedeInteractuar || cargando) return
    setCargando(true)
    try {
      await onSolicitar?.()
      setEstado('pendiente')
    } catch (e) {
      console.error('Error al solicitar sello:', e)
    } finally {
      setCargando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!puedeInteractuar || cargando}
      title={
        !esMiembroAcademia
          ? 'Solo miembros de la academia pueden otorgar este sello'
          : undefined
      }
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
        transition-all duration-200
        ${cfg.bg} ${cfg.text} ${cfg.border}
        ${puedeInteractuar && !cargando ? 'hover:opacity-90 hover:shadow-md cursor-pointer' : 'cursor-default'}
        ${cargando ? 'opacity-60' : ''}
      `}
    >
      {/* Ícono de sello */}
      <span className="flex-shrink-0">
        {estado === 'aprobado' ? (
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-emerald-600">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : estado === 'rechazado' ? (
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-red-500">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          /* Ícono de estrella/sello UV */
          <svg viewBox="0 0 20 20" className={`w-4 h-4 ${estado === 'pendiente' ? 'fill-amber-500' : 'fill-amber-400'}`}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </span>

      {cargando ? 'Enviando...' : cfg.label}
    </button>
  )
}