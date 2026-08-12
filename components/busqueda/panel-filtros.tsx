'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

type Filtros = {
  formato: string[]
  dificultad: string[]
  fechaCarga: string
  fuente: string[]
  selloAcademia: boolean
  calificacionMinima: number
}

type Props = {
  visible: boolean
  onCerrar: () => void
  onAplicar: (filtros: Filtros) => void
}

const FORMATOS = ['Video', 'PDF', 'Infografía', 'Paper']
const DIFICULTADES = ['Básico', 'Intermedio', 'Avanzado']
const FECHAS = ['Última semana', 'Último mes', 'Último año', 'Cualquier fecha']
const FUENTES = ['YouTube', 'MERLOT', 'Biblioteca CIIES', 'Cloudinary']
const CALIFICACIONES = [
  { estrellas: 5, sufijo: '', valor: 5 },
  { estrellas: 4, sufijo: 'o más', valor: 4 },
  { estrellas: 3, sufijo: 'o más', valor: 3 },
  { estrellas: 2, sufijo: 'o más', valor: 2 },
  { estrellas: 0, sufijo: 'Cualquier calificación', valor: 0 },
]

function MiniEstrellas({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= cantidad ? '#F59E0B' : 'none'}
            stroke={i <= cantidad ? '#F59E0B' : '#D1D5DB'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}

export default function PanelFiltros({ visible, onCerrar, onAplicar }: Props) {
  const [filtros, setFiltros] = useState<Filtros>({
    formato: [],
    dificultad: [],
    fechaCarga: '',
    fuente: [],
    selloAcademia: false,
    calificacionMinima: 0,
  })

  if (!visible) return null

  function toggleArray(campo: 'formato' | 'dificultad' | 'fuente', valor: string) {
    setFiltros((prev) => ({
      ...prev,
      [campo]: prev[campo].includes(valor)
        ? prev[campo].filter((v) => v !== valor)
        : [...prev[campo], valor],
    }))
  }

  function limpiar() {
    setFiltros({
      formato: [],
      dificultad: [],
      fechaCarga: '',
      fuente: [],
      selloAcademia: false,
      calificacionMinima: 0,
    })
  }

  return (
    <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800">
          Filtros de búsqueda
        </span>
        <button
          onClick={onCerrar}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Formato */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Formato
          </p>
          <div className="flex flex-wrap gap-2">
            {FORMATOS.map((f) => (
              <button
                key={f}
                onClick={() => toggleArray('formato', f)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  filtros.formato.includes(f)
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#003087]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Dificultad */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Dificultad
          </p>
          <div className="flex flex-wrap gap-2">
            {DIFICULTADES.map((d) => (
              <button
                key={d}
                onClick={() => toggleArray('dificultad', d)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  filtros.dificultad.includes(d)
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#003087]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha de carga */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Fecha de carga
          </p>
          <div className="flex flex-col gap-1">
            {FECHAS.map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fecha"
                  value={f}
                  checked={filtros.fechaCarga === f}
                  onChange={() =>
                    setFiltros((prev) => ({ ...prev, fechaCarga: f }))
                  }
                  className="accent-[#003087]"
                />
                <span className="text-xs text-gray-600">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fuente */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Fuente
          </p>
          <div className="flex flex-wrap gap-2">
            {FUENTES.map((f) => (
              <button
                key={f}
                onClick={() => toggleArray('fuente', f)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  filtros.fuente.includes(f)
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#003087]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Calificación */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Calificación
          </p>
          <div className="flex flex-col gap-1.5">
            {CALIFICACIONES.map((c) => (
              <label key={c.valor} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="calificacion"
                  value={c.valor}
                  checked={filtros.calificacionMinima === c.valor}
                  onChange={() =>
                    setFiltros((prev) => ({ ...prev, calificacionMinima: c.valor }))
                  }
                  className="accent-[#003087]"
                />
                {c.estrellas > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <MiniEstrellas cantidad={c.estrellas} />
                    {c.sufijo && (
                      <span className="text-xs text-gray-600">{c.sufijo}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">{c.sufijo}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Sello academia */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() =>
              setFiltros((prev) => ({
                ...prev,
                selloAcademia: !prev.selloAcademia,
              }))
            }
            className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
              filtros.selloAcademia ? 'bg-[#003087]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                filtros.selloAcademia ? 'left-5' : 'left-0.5'
              }`}
            />
          </div>
          <span className="text-xs text-gray-600">
            Solo con sello de academia
          </span>
        </label>
      </div>

      {/* Acciones */}
      <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={limpiar}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Limpiar filtros
        </button>
        <button
          onClick={() => {
            onAplicar(filtros)
            onCerrar()
          }}
          className="px-4 py-1.5 bg-[#003087] text-white text-xs rounded-full hover:bg-blue-900 transition"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}