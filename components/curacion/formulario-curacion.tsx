'use client'

import { useState } from 'react'

type Dificultad = 'facil' | 'intermedio' | 'dificil'

type DatosCuracion = {
  objetivoAprendizaje: string
  nivelDificultad: 'facil' | 'intermedio' | 'dificil'
  tiempoEstimadoUso: string
  notasUso: string
  perfilEstudianteSugerido: string
}

type Props = {
  idRecurso: string
  datosIniciales?: Partial<DatosCuracion>
  onGuardar: (datos: DatosCuracion) => Promise<void>
  onCerrar: () => void
}

const DIFICULTADES: { valor: Dificultad; label: string; color: string; active: string }[] = [
  { valor: 'facil',      label: 'Fácil',      color: 'border-green-400  text-green-700',  active: 'bg-green-400  text-white border-green-400'  },
  { valor: 'intermedio', label: 'Intermedio', color: 'border-yellow-400 text-yellow-700', active: 'bg-yellow-400 text-white border-yellow-400' },
  { valor: 'dificil',    label: 'Difícil',    color: 'border-red-400    text-red-700',    active: 'bg-red-400    text-white border-red-400'    },
]

export default function FormularioCuracion({
  idRecurso,
  datosIniciales = {},
  onGuardar,
  onCerrar,
}: Props) {
  const [objetivoAprendizaje, setObjetivoAprendizaje] = useState(datosIniciales.objetivoAprendizaje ?? '')
  const [nivelDificultad, setNivelDificultad]         = useState<Dificultad>(datosIniciales.nivelDificultad ?? 'facil')
  const [tiempoEstimadoUso, setTiempoEstimadoUso]     = useState(datosIniciales.tiempoEstimadoUso ?? '')
  const [notasUso, setNotasUso]                       = useState(datosIniciales.notasUso ?? '')
  const [perfilEstudianteSugerido, setPerfilEstudianteSugerido] = useState(datosIniciales.perfilEstudianteSugerido ?? '')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await onGuardar({ objetivoAprendizaje, nivelDificultad, tiempoEstimadoUso, notasUso, perfilEstudianteSugerido })
      setGuardado(true)
      setTimeout(() => { setGuardado(false); onCerrar() }, 1000)
    } catch (e) {
      console.error('Error al guardar curación:', e)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5 p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Añadir contexto</h2>
          <button type="button" onClick={onCerrar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">✕</button>
        </div>

        {/* Objetivo de aprendizaje */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Objetivo de aprendizaje</label>
          <textarea
            value={objetivoAprendizaje}
            onChange={(e) => setObjetivoAprendizaje(e.target.value)}
            rows={3}
            placeholder="Describe qué debe aprender o lograr el estudiante con este recurso"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* Nivel de dificultad */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Dificultad</label>
          <div className="flex gap-2">
            {DIFICULTADES.map((d) => (
              <button
                key={d.valor}
                type="button"
                onClick={() => setNivelDificultad(d.valor)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${nivelDificultad === d.valor ? d.active : `bg-white ${d.color} hover:opacity-80`}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Perfil de estudiante sugerido */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Perfil de estudiante sugerido</label>
          <textarea
            value={perfilEstudianteSugerido}
            onChange={(e) => setPerfilEstudianteSugerido(e.target.value)}
            rows={2}
            placeholder="Describe el perfil ideal del estudiante para este recurso"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* Tiempo estimado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Tiempo estimado de uso</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={tiempoEstimadoUso}
              onChange={(e) => setTiempoEstimadoUso(e.target.value)}
              placeholder="—"
              className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-center text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
            />
            <span className="text-sm text-gray-500">Minutos</span>
          </div>
        </div>

        {/* Notas de uso */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Notas de uso</label>
          <textarea
            value={notasUso}
            onChange={(e) => setNotasUso(e.target.value)}
            rows={2}
            placeholder="Introduce una nota breve sobre este contenido"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${guardado ? 'bg-emerald-500 text-white' : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'}`}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar curación'}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}