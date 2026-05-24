'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import SelectorEstadoRecurso from './selector-estado-recurso'

type Props = {
  visible: boolean
  recursoTitulo: string
  estadoActual: string
  onCerrar: () => void
  onGuardar: (nuevoEstado: string) => void
}

export default function ModalDisponibilidad({
  visible,
  recursoTitulo,
  estadoActual,
  onCerrar,
  onGuardar,
}: Props) {
  const [estado, setEstado] = useState(estadoActual)

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Cambiar disponibilidad
          </h2>
          <button
            onClick={onCerrar}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Nombre del recurso */}
        {recursoTitulo && (
          <p className="text-sm text-gray-500 mb-4 truncate">
            {recursoTitulo}
          </p>
        )}

        {/* Selector */}
        <SelectorEstadoRecurso valor={estado} onChange={setEstado} />

        {/* Botón guardar */}
        <button
          onClick={() => {
            if (estado) {
              onGuardar(estado)
              onCerrar()
            }
          }}
          disabled={!estado}
          className="mt-6 w-full bg-[#003087] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}