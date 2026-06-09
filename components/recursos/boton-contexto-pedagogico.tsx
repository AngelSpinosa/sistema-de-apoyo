'use client'

import { useState } from 'react'
import FormularioCuracion, { type DatosCuracion } from '@/components/curacion/formulario-curacion'

type Props = {
  idRecurso:        string
  datosIniciales?:  Partial<DatosCuracion>
  onGuardar?:       (datos: DatosCuracion) => Promise<void>
  onCompartir?:     () => Promise<void>   // ← nuevo: se llama tras guardar con éxito
}

export default function BotonContextoPedagogico({ idRecurso, datosIniciales, onGuardar, onCompartir }: Props) {
  const [abierto, setAbierto] = useState(false)

  const tieneContexto = !!(
    datosIniciales?.resultadoEducacional ||
    datosIniciales?.anotacion
  )

  const handleGuardar = async (datos: DatosCuracion) => {
    await onGuardar?.(datos)
    setAbierto(false)
    // Tras guardar el contexto, disparar el flujo de compartir
    await onCompartir?.()
  }

  return (
    <>
      {abierto && (
        <FormularioCuracion
          idRecurso={idRecurso}
          datosIniciales={datosIniciales}
          onGuardar={handleGuardar}
          onCerrar={() => setAbierto(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
          transition-all duration-200 cursor-pointer
          ${tieneContexto
            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
            : 'bg-white text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white'
          }
        `}
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        {tieneContexto ? 'Ver contexto pedagógico' : 'Añadir contexto pedagógico'}
      </button>
    </>
  )
}