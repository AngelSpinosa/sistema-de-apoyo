'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

type Usuario = {
  id: string
  nombre: string
  apellidos: string
  correo: string
  rol: 'docente' | 'estudiante' | 'administrador'
}

type Props = {
  usuarios: Usuario[]
  onEditar: (usuario: Usuario) => void
  onEliminar: (id: string) => void
}

const ETIQUETAS_ROL: Record<string, { label: string; color: string }> = {
  docente:       { label: 'Docente',       color: 'bg-blue-50 text-blue-700' },
  estudiante:    { label: 'Estudiante',    color: 'bg-emerald-50 text-emerald-700' },
  administrador: { label: 'Administrador', color: 'bg-purple-50 text-purple-700' },
}

export default function TablaUsuarios({ usuarios, onEditar, onEliminar }: Props) {
  const [confirmarEliminar, setConfirmarEliminar] = useState<Usuario | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const handleEliminarConfirmado = async () => {
    if (!confirmarEliminar) return
    setEliminando(true)
    await onEliminar(confirmarEliminar.id)
    setEliminando(false)
    setConfirmarEliminar(null)
  }

  return (
    <>
      <div className="w-full rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Apellidos</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Correo E.</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Rol</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Contraseña</th>
              <th className="text-center px-5 py-3.5 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    i === usuarios.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-gray-800 font-medium">{u.nombre}</td>
                  <td className="px-5 py-4 text-gray-600">{u.apellidos}</td>
                  <td className="px-5 py-4 text-gray-600">{u.correo}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ETIQUETAS_ROL[u.rol]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                      {ETIQUETAS_ROL[u.rol]?.label ?? u.rol}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 tracking-widest text-xs">••••••••</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditar(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003087] text-white text-xs font-semibold rounded-lg hover:bg-[#002070] transition"
                      >
                        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmarEliminar(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition"
                      >
                        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal confirmación eliminar */}
      {confirmarEliminar && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setConfirmarEliminar(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-gray-900">Eliminar usuario</h2>
              <p className="text-sm text-gray-500">
                ¿Seguro que quieres eliminar a{' '}
                <span className="font-semibold text-gray-800">
                  {confirmarEliminar.nombre} {confirmarEliminar.apellidos}
                </span>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarConfirmado}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}