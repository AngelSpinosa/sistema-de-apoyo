'use client'

import { useState } from 'react'
import FormularioCuracion, { type DatosCuracion } from '@/components/curacion/formulario-curacion'
import { createPortal } from 'react-dom'


// ── Tipos ─────────────────────────────────────────────────────────────────────
export type NotaPedagogica = {
  idMetadato:           string
  titulo:               string
  nivelDificultad:      string
  anotacion:            string
  resultadoEducacional: string
  metodoEducacional:    string
  tipoRecursoEducativo: string
  rolAudiencia:         string
  tiempoAprendizaje:    string
}

type Props = {
  idRecurso:  string
  notas:      NotaPedagogica[]
  onGuardar:  (datos: DatosCuracion, idMetadato?: string) => Promise<void>
  onCompartir:(idMetadato: string) => Promise<void>
  onEliminar: (idMetadato: string) => Promise<void>
}

// ── Helpers visuales ──────────────────────────────────────────────────────────
const COLORES_DIFICULTAD: Record<string, string> = {
  muy_facil:   'bg-emerald-100 text-emerald-700',
  facil:       'bg-green-100   text-green-700',
  intermedio:  'bg-yellow-100  text-yellow-700',
  dificil:     'bg-orange-100  text-orange-700',
  muy_dificil: 'bg-red-100     text-red-700',
}

const ETIQUETAS_DIFICULTAD: Record<string, string> = {
  muy_facil:   'Muy fácil',
  facil:       'Fácil',
  intermedio:  'Intermedio',
  dificil:     'Difícil',
  muy_dificil: 'Muy difícil',
}

// ── Modal vista previa de una nota ────────────────────────────────────────────
function ModalNota({
  nota,
  onCerrar,
  onCompartir,
  onEditar,
  onEliminar,
}: {
  nota:        NotaPedagogica
  onCerrar:    () => void
  onCompartir: () => void
  onEditar:    () => void
  onEliminar:  () => void
}) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-gray-900">{nota.titulo}</h2>
            <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${
              COLORES_DIFICULTAD[nota.nivelDificultad] ?? 'bg-gray-100 text-gray-600'
            }`}>
              {ETIQUETAS_DIFICULTAD[nota.nivelDificultad] ?? nota.nivelDificultad}
            </span>
          </div>
          <button
            onClick={onCerrar}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Resultado educacional */}
        {nota.resultadoEducacional && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Resultado educacional</p>
            <p className="text-sm text-gray-700">{nota.resultadoEducacional}</p>
          </div>
        )}

        {/* Anotación */}
        {nota.anotacion && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Notas</p>
            <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              {nota.anotacion}
            </p>
          </div>
        )}

        {/* Metadatos secundarios */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          {nota.metodoEducacional && (
            <div>
              <p className="text-gray-400">Método</p>
              <p className="text-gray-700 capitalize">{nota.metodoEducacional.replace(/_/g, ' ')}</p>
            </div>
          )}
          {nota.tiempoAprendizaje && (
            <div>
              <p className="text-gray-400">Tiempo</p>
              <p className="text-gray-700">{nota.tiempoAprendizaje} min</p>
            </div>
          )}
          {nota.rolAudiencia && (
            <div>
              <p className="text-gray-400">Audiencia</p>
              <p className="text-gray-700 capitalize">{nota.rolAudiencia}</p>
            </div>
          )}
          {nota.tipoRecursoEducativo && (
            <div>
              <p className="text-gray-400">Tipo</p>
              <p className="text-gray-700 capitalize">{nota.tipoRecursoEducativo.replace(/_/g, ' ')}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        {!confirmandoEliminar ? (
          <div className="flex gap-2 pt-1">
            <button
              onClick={onCompartir}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#003087] text-white text-xs font-semibold hover:bg-[#002070] transition"
            >
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Compartir
            </button>
            <button
              onClick={onEditar}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
            >
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => setConfirmandoEliminar(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
            >
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Eliminar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-sm text-center text-gray-600">¿Eliminar esta nota? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={onEliminar}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmandoEliminar(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Modal compartir (URL) ─────────────────────────────────────────────────────
function ModalCompartir({ url, onCerrar }: { url: string; onCerrar: () => void }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900">Compartir recurso</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Solo quienes accedan por este enlace verán el contexto pedagógico.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-700 truncate flex-1 font-mono">{url}</span>
          <button
            onClick={copiar}
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#003087] text-white hover:bg-[#002070] transition"
          >
            {copiado ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>

        <button
          onClick={onCerrar}
          className="py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition"
        >
          Listo
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PanelNotasPedagogicas({
  idRecurso,
  notas,
  onGuardar,
  onCompartir,
  onEliminar,
}: Props) {
  const [dropdownAbierto,  setDropdownAbierto]  = useState(false)
  const [notaSeleccionada, setNotaSeleccionada] = useState<NotaPedagogica | null>(null)
  const [editando,         setEditando]         = useState(false)

  if (notas.length === 0) return null

  const handleCompartir = async () => {
    if (!notaSeleccionada) return
    // El padre (detalle-recurso-page) genera el token y muestra el modal de URL
    await onCompartir(notaSeleccionada.idMetadato)
    setNotaSeleccionada(null)
  }

  const handleEliminar = async () => {
    if (!notaSeleccionada) return
    await onEliminar(notaSeleccionada.idMetadato)
    setNotaSeleccionada(null)
  }

  const handleGuardarEdicion = async (datos: DatosCuracion) => {
    if (!notaSeleccionada) return
    await onGuardar(datos, notaSeleccionada.idMetadato)
    setEditando(false)
    setNotaSeleccionada(null)
  }

  return (
    <>
      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownAbierto((v) => !v)}
          className="inline-flex items-center gap-2 w-full px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="flex-1 text-left">Notas de contexto pedagógico</span>
          <svg
            viewBox="0 0 20 20"
            className={`w-4 h-4 fill-current flex-shrink-0 transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {dropdownAbierto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {notas.map((nota) => (
              <button
                key={nota.idMetadato}
                type="button"
                onClick={() => {
                  setNotaSeleccionada(nota)
                  setDropdownAbierto(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  nota.nivelDificultad === 'muy_facil'   ? 'bg-emerald-400' :
                  nota.nivelDificultad === 'facil'       ? 'bg-green-400'   :
                  nota.nivelDificultad === 'intermedio'  ? 'bg-yellow-400'  :
                  nota.nivelDificultad === 'dificil'     ? 'bg-orange-400'  :
                  nota.nivelDificultad === 'muy_dificil' ? 'bg-red-400'     : 'bg-gray-300'
                }`} />
                <span className="truncate">{nota.titulo}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal vista previa */}
      {notaSeleccionada && !editando && createPortal (
        <ModalNota
          nota={notaSeleccionada}
          onCerrar={() => setNotaSeleccionada(null)}
          onCompartir={handleCompartir}
          onEditar={() => setEditando(true)}
          onEliminar={handleEliminar}
        />,
        document.body
      )}

      {/* Formulario de edición */}
      {notaSeleccionada && editando && createPortal (
        <FormularioCuracion
          idRecurso={idRecurso}
          datosIniciales={{
            titulo:               notaSeleccionada.titulo,
            resultadoEducacional: notaSeleccionada.resultadoEducacional,
            nivelDificultad:      notaSeleccionada.nivelDificultad as any,
            metodoEducacional:    notaSeleccionada.metodoEducacional as any,
            tipoRecursoEducativo: notaSeleccionada.tipoRecursoEducativo as any,
            rolAudiencia:         notaSeleccionada.rolAudiencia as any,
            tiempoAprendizaje:    notaSeleccionada.tiempoAprendizaje,
            anotacion:            notaSeleccionada.anotacion,
          }}
          onGuardar={handleGuardarEdicion}
          onCerrar={() => { setEditando(false); setNotaSeleccionada(null) }}
        />,
        document.body
      )}

    </>
  )
}

// Exportar setter para que el padre pueda pasar la URL generada al panel
export type { Props as PanelNotasPedagogicasProps }