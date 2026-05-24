'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import ModalDisponibilidad from './modal-disponibilidad'

type Recurso = {
  id: string
  titulo: string
  autores: string
  formato: string
  disponibilidad: string
}

type Props = {
  recursos: Recurso[]
  onActualizarDisponibilidad: (id: string, nuevoEstado: string) => void
}

const BADGE: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  bloqueado: 'bg-red-100 text-red-600',
  obsoleto: 'bg-yellow-100 text-yellow-700',
  retirado: 'bg-gray-100 text-gray-500',
}

export default function TablaRecursosRepositorio({
  recursos,
  onActualizarDisponibilidad,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false)
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<Recurso | null>(null)

  function abrirModal(recurso: Recurso) {
    setRecursoSeleccionado(recurso)
    setModalVisible(true)
  }

  return (
    <>
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Título
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Autores
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Formato
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Disponibilidad
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {recursos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No hay recursos en este repositorio
                </td>
              </tr>
            ) : (
              recursos.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate">
                    {r.titulo}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">
                    {r.autores}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.formato}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        BADGE[r.disponibilidad] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {r.disponibilidad}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => abrirModal(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003087] text-white text-xs font-medium rounded-lg hover:bg-blue-900 transition"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalDisponibilidad
        visible={modalVisible}
        recursoTitulo={recursoSeleccionado?.titulo ?? ''}
        estadoActual={recursoSeleccionado?.disponibilidad ?? ''}
        onCerrar={() => {
          setModalVisible(false)
          setRecursoSeleccionado(null)
        }}
        onGuardar={(nuevoEstado) => {
          if (recursoSeleccionado) {
            onActualizarDisponibilidad(recursoSeleccionado.id, nuevoEstado)
          }
        }}
      />
    </>
  )
}