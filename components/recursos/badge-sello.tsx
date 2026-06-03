'use client'

import { useState } from 'react'

type EstadoSello = 'sin_sello' | 'con_sello'

type Props = {
  estadoInicial?:      EstadoSello
  onOtorgar?:          () => Promise<void>
  esMiembroAcademia?:  boolean
  nombreDocente?:      string
}

// ─── Sello visual SVG ─────────────────────────────────────────────────────────
function SelloAcademia({ nombre }: { nombre?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400 uppercase tracking-wide">Sello de academia</p>
      <div className="relative flex items-center justify-center select-none">
        <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-md" aria-label="Sello Academia UV">
          <circle cx="60" cy="60" r="56" fill="#003087" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#E8B84B" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx="60" cy="60" r="46" fill="#002070" />
          <path
            d="M60 20 L63.5 50 L90 40 L72 62 L100 70 L72 75 L82 103 L60 84 L38 103 L48 75 L20 70 L48 62 L30 40 L56.5 50 Z"
            fill="#E8B84B" opacity="0.15"
          />
          <path id="arcTop" d="M 18,60 A 42,42 0 0,1 102,60" fill="none" />
          <text fontSize="8.5" fill="#E8B84B" fontFamily="serif" fontWeight="bold" letterSpacing="2">
            <textPath href="#arcTop" startOffset="12%">ACADEMIA · UV · FEI</textPath>
          </text>
          <path id="arcBottom" d="M 20,65 A 42,42 0 0,0 100,65" fill="none" />
          <text fontSize="7.5" fill="#E8B84B" fontFamily="serif" letterSpacing="1.5">
            <textPath href="#arcBottom" startOffset="18%">RECURSO AVALADO</textPath>
          </text>
          <path d="M60 34 L74 40 L74 55 C74 63 68 69 60 72 C52 69 46 63 46 55 L46 40 Z" fill="#E8B84B" />
          <path d="M54 54 L58 58 L67 48" stroke="#002070" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="60" y="85" textAnchor="middle" fontSize="8" fill="#E8B84B" fontFamily="serif" letterSpacing="1">
            {new Date().getFullYear()}
          </text>
        </svg>
      </div>
      {nombre && (
        <p className="text-xs text-gray-500 text-center">
          Avalado por <span className="font-medium text-gray-700">{nombre}</span>
        </p>
      )}
    </div>
  )
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
function ModalConfirmacion({
  onConfirmar,
  onCancelar,
  cargando,
}: {
  onConfirmar: () => void
  onCancelar:  () => void
  cargando:    boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-7 h-7 fill-amber-500">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">¿Avalar este recurso?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Estás a punto de otorgar el sello de la academia a este recurso educativo. Esta acción quedará registrada con tu nombre.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            El sello indica que este recurso ha sido revisado y aprobado por un miembro activo de la academia de la Facultad de Estadística e Informática.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#003087] text-white text-sm font-medium hover:bg-[#002070] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Otorgando...
              </>
            ) : (
              'Confirmar aval'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function BadgeSello({
  estadoInicial     = 'sin_sello',
  onOtorgar,
  esMiembroAcademia = false,
  nombreDocente,
}: Props) {
  const [estado, setEstado]           = useState<EstadoSello>(estadoInicial)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando]       = useState(false)

  const puedeOtorgar = estado === 'sin_sello' && esMiembroAcademia

  const handleConfirmar = async () => {
    setCargando(true)
    try {
      await onOtorgar?.()
      setEstado('con_sello')
      setModalAbierto(false)
    } catch (e) {
      console.error('Error al otorgar sello:', e)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      {modalAbierto && (
        <ModalConfirmacion
          onConfirmar={handleConfirmar}
          onCancelar={() => setModalAbierto(false)}
          cargando={cargando}
        />
      )}

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => puedeOtorgar && setModalAbierto(true)}
          disabled={!puedeOtorgar}
          title={!esMiembroAcademia ? 'Solo miembros de la academia pueden otorgar este sello' : undefined}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
            transition-all duration-200
            ${estado === 'con_sello'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
              : puedeOtorgar
                ? 'bg-gray-900 text-white border-gray-700 hover:opacity-90 hover:shadow-md cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-default opacity-80'
            }
          `}
        >
          <span className="flex-shrink-0">
            {estado === 'con_sello' ? (
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-emerald-600">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-amber-400">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </span>
          {estado === 'con_sello' ? 'Sello otorgado' : 'Otorgar sello de academia'}
        </button>

        {estado === 'con_sello' && (
          <SelloAcademia nombre={nombreDocente} />
        )}
      </div>
    </>
  )
}