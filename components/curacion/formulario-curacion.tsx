'use client'

import { useState } from 'react'
import { Check, Info } from 'lucide-react'

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
  titulo:               string
  resultadoEducacional: string              // DES0500
  nivelDificultad:      Dificultad          // DES0800
  metodoEducacional:    MetodoEducacional   // DES0100
  tipoRecursoEducativo: TipoRecursoEducativo // DES0200
  rolAudiencia:         RolAudiencia        // DES0700
  tiempoAprendizaje:    string              // DES0900
  anotacion:            string              // DES1000
}

type Props = {
  idRecurso:       string
  datosIniciales?: Partial<DatosCuracion>
  onGuardar:       (datos: DatosCuracion) => Promise<void>
  onCerrar:        () => void
  /** true = se dibuja sin overlay, para incrustarlo en una página (ej. Fase 3 del flujo 4S) */
  embebido?:       boolean
}

// ── Pasos ─────────────────────────────────────────────────────────────────────
const PASOS = [
  { id: 1, titulo: 'Qué se aprende',      descripcion: 'Identifica la nota y el aprendizaje esperado.' },
  { id: 2, titulo: 'Nivel y audiencia',   descripcion: 'Indica para quién es y qué tan exigente es.' },
  { id: 3, titulo: 'Enfoque didáctico',   descripcion: 'Cómo se usa el recurso en clase.' },
] as const

const TOTAL_PASOS = PASOS.length

// ── Vocabularios controlados ──────────────────────────────────────────────────
const DIFICULTADES: { valor: Dificultad; label: string; color: string; active: string }[] = [
  { valor: 'muy_facil',   label: 'Muy fácil',  color: 'border-emerald-400 text-emerald-700', active: 'bg-emerald-400 text-white border-emerald-400' },
  { valor: 'facil',       label: 'Fácil',      color: 'border-green-400 text-green-700',     active: 'bg-green-400 text-white border-green-400'     },
  { valor: 'intermedio',  label: 'Intermedio', color: 'border-yellow-400 text-yellow-700',   active: 'bg-yellow-400 text-white border-yellow-400'   },
  { valor: 'dificil',     label: 'Difícil',    color: 'border-orange-400 text-orange-700',   active: 'bg-orange-400 text-white border-orange-400'   },
  { valor: 'muy_dificil', label: 'Muy difícil', color: 'border-red-400 text-red-700',        active: 'bg-red-400 text-white border-red-400'         },
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

const CLASE_INPUT =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition'

// ── Campo con ayuda, ejemplo y código ISO ─────────────────────────────────────
function Campo({
  label,
  des,
  requerido,
  ayuda,
  ejemplo,
  children,
}: {
  label:      string
  des?:       string
  requerido?: boolean
  ayuda:      string
  ejemplo?:   string
  children:   React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {requerido
            ? <span className="text-red-400" aria-label="obligatorio">*</span>
            : <span className="text-xs font-normal text-gray-400">(opcional)</span>}

          {/* Tooltip: aparece con hover o con foco de teclado */}
          <span className="relative group">
            <button
              type="button"
              aria-label={`Ayuda sobre ${label}`}
              className="flex text-gray-400 hover:text-[#003087] focus:text-[#003087] focus:outline-none"
            >
              <Info size={14} />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-0 bottom-full mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 z-10"
            >
              {ayuda}
            </span>
          </span>
        </div>

        {des && (
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {des}
          </span>
        )}
      </div>

      {children}

      {ejemplo && <p className="text-xs text-gray-400">Ejemplo: {ejemplo}</p>}
    </div>
  )
}

// ── Indicador de pasos ────────────────────────────────────────────────────────
function IndicadorPasos({
  actual,
  onIrAPaso,
}: {
  actual:    number
  onIrAPaso: (paso: number) => void
}) {
  return (
    <ol className="flex items-center" aria-label="Progreso del formulario">
      {PASOS.map((p, i) => {
        const completado = p.id < actual
        const activo     = p.id === actual
        return (
          <li key={p.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!completado}
              onClick={() => onIrAPaso(p.id)}
              aria-current={activo ? 'step' : undefined}
              aria-label={`Paso ${p.id}: ${p.titulo}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                completado
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer'
                  : activo
                    ? 'bg-[#003087] text-white'
                    : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {completado ? <Check size={14} /> : p.id}
            </button>
            {i < TOTAL_PASOS - 1 && (
              <div className={`h-0.5 flex-1 mx-2 rounded ${completado ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function FormularioCuracion({
  idRecurso,
  datosIniciales = {},
  onGuardar,
  onCerrar,
  embebido = false,
}: Props) {
  const [paso, setPaso] = useState(1)

  const [titulo,               setTitulo]               = useState(datosIniciales.titulo               ?? '')
  const [resultadoEducacional, setResultadoEducacional] = useState(datosIniciales.resultadoEducacional ?? '')
  const [nivelDificultad,      setNivelDificultad]      = useState<Dificultad>(datosIniciales.nivelDificultad           ?? 'intermedio')
  const [metodoEducacional,    setMetodoEducacional]    = useState<MetodoEducacional>(datosIniciales.metodoEducacional    ?? 'exposicion')
  const [tipoRecursoEducativo, setTipoRecursoEducativo] = useState<TipoRecursoEducativo>(datosIniciales.tipoRecursoEducativo ?? 'narrativo_texto')
  const [rolAudiencia,         setRolAudiencia]         = useState<RolAudiencia>(datosIniciales.rolAudiencia         ?? 'estudiante')
  const [tiempoAprendizaje,    setTiempoAprendizaje]    = useState(datosIniciales.tiempoAprendizaje    ?? '')
  const [anotacion,            setAnotacion]            = useState(datosIniciales.anotacion            ?? '')
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  // Condición para avanzar en cada paso (solo el paso 1 tiene campos obligatorios)
  const paso1Completo = titulo.trim().length > 0 && resultadoEducacional.trim().length > 0
  const puedeAvanzar  = paso === 1 ? paso1Completo : true

  const esUltimoPaso = paso === TOTAL_PASOS
  const pasoActual   = PASOS[paso - 1]

  const irAPaso = (destino: number) => {
    // Solo se puede retroceder libremente; avanzar exige cumplir el paso actual
    if (destino < paso) setPaso(destino)
  }

  const handleSiguiente = () => {
    if (puedeAvanzar && paso < TOTAL_PASOS) setPaso(paso + 1)
  }

  const handleGuardar = async () => {
    if (!paso1Completo) return
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

  const tarjeta = (
    <div
      className={`bg-white flex flex-col gap-5 p-6 w-full ${
        embebido ? 'rounded-2xl border border-gray-100' : 'rounded-2xl shadow-2xl max-w-lg'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Contexto pedagógico</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Describe cómo usar este recurso en clase. Metadatos según ISO/IEC 19788-5 (MLR).
          </p>
        </div>
        {!embebido && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar formulario"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition flex-shrink-0"
          >✕</button>
        )}
      </div>

      {/* Progreso */}
      <div className="flex flex-col gap-3">
        <IndicadorPasos actual={paso} onIrAPaso={irAPaso} />
        <div>
          <p className="text-sm font-semibold text-[#003087]">
            Paso {paso} de {TOTAL_PASOS}: {pasoActual.titulo}
          </p>
          <p className="text-xs text-gray-500">{pasoActual.descripcion}</p>
        </div>
      </div>

      {/* Contenido del paso (altura mínima para que el modal no “salte”) */}
      <div className="flex flex-col gap-5 min-h-[260px]">
        {paso === 1 && (
          <>
            <Campo
              label="Título de la nota"
              requerido
              ayuda="Un nombre corto para reconocer esta nota si preparas varias para el mismo recurso."
              ejemplo="Introducción para principiantes"
            >
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Repaso unidad 3"
                className={CLASE_INPUT}
              />
            </Campo>

            <Campo
              label="Resultado educacional"
              des="DES0500"
              requerido
              ayuda="¿Qué esperas que el estudiante sepa, entienda o pueda hacer después de usar este recurso?"
              ejemplo="Comprender el concepto de derivadas"
            >
              <textarea
                value={resultadoEducacional}
                onChange={(e) => setResultadoEducacional(e.target.value)}
                rows={4}
                placeholder="Al terminar, el estudiante podrá…"
                className={`${CLASE_INPUT} resize-none`}
              />
            </Campo>
          </>
        )}

        {paso === 2 && (
          <>
            <Campo
              label="Nivel de dificultad"
              des="DES0800"
              ayuda="Qué tan exigente es el recurso para la audiencia que elegiste abajo."
              ejemplo="Intermedio"
            >
              <div className="grid grid-cols-5 gap-1.5">
                {DIFICULTADES.map((d) => (
                  <button
                    key={d.valor}
                    type="button"
                    onClick={() => setNivelDificultad(d.valor)}
                    aria-pressed={nivelDificultad === d.valor}
                    className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-150 ${
                      nivelDificultad === d.valor ? d.active : `bg-white ${d.color} hover:opacity-80`
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo
              label="Audiencia prevista"
              des="DES0700"
              ayuda="¿Para quién está pensado este recurso?"
            >
              <div className="grid grid-cols-4 gap-1.5">
                {ROLES_AUDIENCIA.map((r) => (
                  <button
                    key={r.valor}
                    type="button"
                    onClick={() => setRolAudiencia(r.valor)}
                    aria-pressed={rolAudiencia === r.valor}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                      rolAudiencia === r.valor
                        ? 'bg-[#003087] text-white border-[#003087]'
                        : 'bg-white border-gray-300 text-gray-600 hover:opacity-80'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Campo>

            <Campo
              label="Tiempo de aprendizaje"
              des="DES0900"
              ayuda="Minutos aproximados que un estudiante necesita para trabajar con este recurso."
              ejemplo="30 minutos"
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={tiempoAprendizaje}
                  onChange={(e) => setTiempoAprendizaje(e.target.value)}
                  placeholder="—"
                  className={`${CLASE_INPUT} w-24 text-center`}
                />
                <span className="text-sm text-gray-500">minutos</span>
              </div>
            </Campo>
          </>
        )}

        {paso === 3 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Método educacional"
                des="DES0100"
                ayuda="La forma en que se trabaja el recurso: por ejemplo, tú lo expones o el estudiante lo explora solo."
              >
                <select
                  value={metodoEducacional}
                  onChange={(e) => setMetodoEducacional(e.target.value as MetodoEducacional)}
                  className={CLASE_INPUT}
                >
                  {METODOS.map((m) => (
                    <option key={m.valor} value={m.valor}>{m.label}</option>
                  ))}
                </select>
              </Campo>

              <Campo
                label="Tipo de recurso"
                des="DES0200"
                ayuda="La naturaleza didáctica del material (ejercicio, examen, diapositiva…), no su formato de archivo."
              >
                <select
                  value={tipoRecursoEducativo}
                  onChange={(e) => setTipoRecursoEducativo(e.target.value as TipoRecursoEducativo)}
                  className={CLASE_INPUT}
                >
                  {TIPOS_RECURSO.map((t) => (
                    <option key={t.valor} value={t.valor}>{t.label}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo
              label="Anotación"
              des="DES1000"
              ayuda="Un comentario libre sobre cómo o cuándo conviene usar este recurso en tu práctica docente."
              ejemplo="Úsalo antes de la práctica de laboratorio"
            >
              <textarea
                value={anotacion}
                onChange={(e) => setAnotacion(e.target.value)}
                rows={3}
                placeholder="Sugerencias de uso, contexto de aplicación…"
                className={`${CLASE_INPUT} resize-none`}
              />
            </Campo>
          </>
        )}
      </div>

      {/* Aviso cuando falta algo para avanzar */}
      {!puedeAvanzar && (
        <p className="text-xs text-amber-600 -mt-2" role="status">
          Completa los campos marcados con * para continuar.
        </p>
      )}

      {/* Navegación */}
      <div className="flex gap-3 pt-1">
        {paso === 1 ? (
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPaso(paso - 1)}
            disabled={guardando}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Anterior
          </button>
        )}

        {esUltimoPaso ? (
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || !paso1Completo}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              guardado
                ? 'bg-emerald-500 text-white'
                : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar metadatos'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSiguiente}
            disabled={!puedeAvanzar}
            className="flex-1 py-2.5 rounded-xl bg-[#003087] text-white text-sm font-semibold hover:bg-[#002070] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  )

  if (embebido) return tarjeta

  // Modal: el clic en el fondo NO cierra, para no perder lo capturado a mitad del asistente.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {tarjeta}
    </div>
  )
}