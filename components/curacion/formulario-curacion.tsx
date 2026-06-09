'use client'

import { useState } from 'react'

// ── Tipos alineados con ISO/IEC 19788-5 ───────────────────────────────────────
type Dificultad = 'muy_facil' | 'facil' | 'intermedio' | 'dificil' | 'muy_dificil'

type MetodoEducacional =
  | 'exposicion'
  | 'demostracion'
  | 'aprendizaje_colaborativo'
  | 'resolucion_problemas'
  | 'estudio_de_caso'
  | 'autoaprendizaje'

type TipoRecursoEducativo =
  | 'ejercicio'
  | 'simulacion'
  | 'cuestionario'
  | 'diagrama'
  | 'figura'
  | 'grafico'
  | 'indice'
  | 'diapositiva'
  | 'tabla'
  | 'narrativo_texto'
  | 'examen'
  | 'experimento'
  | 'autoevaluacion'
  | 'conferencia'

type RolAudiencia = 'estudiante' | 'docente' | 'investigador' | 'profesional'

export type DatosCuracion = {
  titulo:               string        // ← nuevo: identificador de la nota
  resultadoEducacional: string        // DES0500
  nivelDificultad:      Dificultad    // DES0800
  metodoEducacional:    MetodoEducacional   // DES0100
  tipoRecursoEducativo: TipoRecursoEducativo // DES0200
  rolAudiencia:         RolAudiencia  // DES0700
  tiempoAprendizaje:    string        // DES0900
  anotacion:            string        // DES1000
}

type Props = {
  idRecurso:      string
  datosIniciales?: Partial<DatosCuracion>
  onGuardar:      (datos: DatosCuracion) => Promise<void>
  onCerrar:       () => void
}

// ── Vocabularios controlados ──────────────────────────────────────────────────
const DIFICULTADES: { valor: Dificultad; label: string; color: string; active: string }[] = [
  { valor: 'muy_facil',   label: 'Muy fácil',  color: 'border-emerald-400 text-emerald-700', active: 'bg-emerald-400 text-white border-emerald-400' },
  { valor: 'facil',       label: 'Fácil',       color: 'border-green-400   text-green-700',   active: 'bg-green-400   text-white border-green-400'   },
  { valor: 'intermedio',  label: 'Intermedio',  color: 'border-yellow-400  text-yellow-700',  active: 'bg-yellow-400  text-white border-yellow-400'  },
  { valor: 'dificil',     label: 'Difícil',     color: 'border-orange-400  text-orange-700',  active: 'bg-orange-400  text-white border-orange-400'  },
  { valor: 'muy_dificil', label: 'Muy difícil', color: 'border-red-400     text-red-700',     active: 'bg-red-400     text-white border-red-400'     },
]

const METODOS: { valor: MetodoEducacional; label: string }[] = [
  { valor: 'exposicion',               label: 'Exposición' },
  { valor: 'demostracion',             label: 'Demostración' },
  { valor: 'aprendizaje_colaborativo', label: 'Aprendizaje colaborativo' },
  { valor: 'resolucion_problemas',     label: 'Resolución de problemas' },
  { valor: 'estudio_de_caso',          label: 'Estudio de caso' },
  { valor: 'autoaprendizaje',          label: 'Autoaprendizaje' },
]

const TIPOS_RECURSO: { valor: TipoRecursoEducativo; label: string }[] = [
  { valor: 'ejercicio',       label: 'Ejercicio' },
  { valor: 'simulacion',      label: 'Simulación' },
  { valor: 'cuestionario',    label: 'Cuestionario' },
  { valor: 'diagrama',        label: 'Diagrama' },
  { valor: 'figura',          label: 'Figura' },
  { valor: 'grafico',         label: 'Gráfico' },
  { valor: 'indice',          label: 'Índice' },
  { valor: 'diapositiva',     label: 'Diapositiva' },
  { valor: 'tabla',           label: 'Tabla' },
  { valor: 'narrativo_texto', label: 'Texto narrativo' },
  { valor: 'examen',          label: 'Examen' },
  { valor: 'experimento',     label: 'Experimento' },
  { valor: 'autoevaluacion',  label: 'Autoevaluación' },
  { valor: 'conferencia',     label: 'Conferencia' },
]

const ROLES_AUDIENCIA: { valor: RolAudiencia; label: string }[] = [
  { valor: 'estudiante',   label: 'Estudiante' },
  { valor: 'docente',      label: 'Docente' },
  { valor: 'investigador', label: 'Investigador' },
  { valor: 'profesional',  label: 'Profesional' },
]

function CampoLabel({ label, des, requerido }: { label: string; des: string; requerido?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {requerido && <span className="text-red-400 ml-1">*</span>}
      </label>
      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
        {des}
      </span>
    </div>
  )
}

export default function FormularioCuracion({
  idRecurso,
  datosIniciales = {},
  onGuardar,
  onCerrar,
}: Props) {
  const [titulo,               setTitulo]               = useState(datosIniciales.titulo               ?? '')
  const [resultadoEducacional, setResultadoEducacional] = useState(datosIniciales.resultadoEducacional ?? '')
  const [nivelDificultad,      setNivelDificultad]      = useState<Dificultad>(datosIniciales.nivelDificultad      ?? 'intermedio')
  const [metodoEducacional,    setMetodoEducacional]    = useState<MetodoEducacional>(datosIniciales.metodoEducacional    ?? 'exposicion')
  const [tipoRecursoEducativo, setTipoRecursoEducativo] = useState<TipoRecursoEducativo>(datosIniciales.tipoRecursoEducativo ?? 'narrativo_texto')
  const [rolAudiencia,         setRolAudiencia]         = useState<RolAudiencia>(datosIniciales.rolAudiencia         ?? 'estudiante')
  const [tiempoAprendizaje,    setTiempoAprendizaje]    = useState(datosIniciales.tiempoAprendizaje    ?? '')
  const [anotacion,            setAnotacion]            = useState(datosIniciales.anotacion            ?? '')
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  const puedeGuardar = titulo.trim().length > 0 && resultadoEducacional.trim().length > 0

  const handleGuardar = async () => {
    if (!puedeGuardar) return
    setGuardando(true)
    try {
      await onGuardar({
        titulo,
        resultadoEducacional,
        nivelDificultad,
        metodoEducacional,
        tipoRecursoEducativo,
        rolAudiencia,
        tiempoAprendizaje,
        anotacion,
      })
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Contexto pedagógico</h2>
            <p className="text-xs text-gray-400 mt-0.5">Metadatos según ISO/IEC 19788-5 (MLR)</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition flex-shrink-0"
          >✕</button>
        </div>

        {/* Título de la nota (nuevo campo) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Título de la nota
              <span className="text-red-400 ml-1">*</span>
            </label>
          </div>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Introducción para principiantes, Repaso unidad 3..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* DES0500 — Resultado educacional */}
        <div>
          <CampoLabel label="Resultado educacional" des="DES0500" requerido />
          <textarea
            value={resultadoEducacional}
            onChange={(e) => setResultadoEducacional(e.target.value)}
            rows={3}
            placeholder="¿Qué debe saber, entender o poder hacer el estudiante al completar el proceso educativo con este recurso?"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* DES0800 — Dificultad */}
        <div>
          <CampoLabel label="Nivel de dificultad" des="DES0800" />
          <div className="flex gap-1.5 flex-wrap">
            {DIFICULTADES.map((d) => (
              <button
                key={d.valor}
                type="button"
                onClick={() => setNivelDificultad(d.valor)}
                className={`flex-1 min-w-[80px] py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                  nivelDificultad === d.valor ? d.active : `bg-white ${d.color} hover:opacity-80`
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* DES0100 + DES0200 en fila */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <CampoLabel label="Método educacional" des="DES0100" />
            <select
              value={metodoEducacional}
              onChange={(e) => setMetodoEducacional(e.target.value as MetodoEducacional)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
            >
              {METODOS.map((m) => (
                <option key={m.valor} value={m.valor}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <CampoLabel label="Tipo de recurso" des="DES0200" />
            <select
              value={tipoRecursoEducativo}
              onChange={(e) => setTipoRecursoEducativo(e.target.value as TipoRecursoEducativo)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
            >
              {TIPOS_RECURSO.map((t) => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DES0700 — Audiencia */}
        <div>
          <CampoLabel label="Audiencia prevista" des="DES0700" />
          <div className="flex gap-2">
            {ROLES_AUDIENCIA.map((r) => (
              <button
                key={r.valor}
                type="button"
                onClick={() => setRolAudiencia(r.valor)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                  rolAudiencia === r.valor
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white border-gray-300 text-gray-600 hover:opacity-80'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* DES0900 — Tiempo de aprendizaje */}
        <div>
          <CampoLabel label="Tiempo de aprendizaje" des="DES0900" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={tiempoAprendizaje}
              onChange={(e) => setTiempoAprendizaje(e.target.value)}
              placeholder="—"
              className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-center text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
            />
            <span className="text-sm text-gray-500">minutos</span>
          </div>
        </div>

        {/* DES1000 — Anotación */}
        <div>
          <CampoLabel label="Anotación" des="DES1000" />
          <textarea
            value={anotacion}
            onChange={(e) => setAnotacion(e.target.value)}
            rows={2}
            placeholder="Comentario sobre el uso o contexto de aplicación de este recurso en la práctica docente"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || !puedeGuardar}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              guardado
                ? 'bg-emerald-500 text-white'
                : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar metadatos'}
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