'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onCerrar: () => void
}

export default function FormularioCambiarContrasena({ onCerrar }: Props) {
  const [actual, setActual]           = useState('')
  const [nueva, setNueva]             = useState('')
  const [confirmar, setConfirmar]     = useState('')
  const [verActual, setVerActual]     = useState(false)
  const [verNueva, setVerNueva]       = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [guardado, setGuardado]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const supabase = createClient()

  const noCoinciden = nueva && confirmar && nueva !== confirmar
  const demasiadoCorta = nueva && nueva.length < 8

  const handleGuardar = async () => {
    if (!actual || !nueva || !confirmar) return
    if (nueva !== confirmar) { setError('Las contraseñas no coinciden.'); return }
    if (nueva.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }

    setGuardando(true)
    setError(null)

    // Supabase no expone "verificar contraseña actual" directamente —
    // se reautentica haciendo signInWithPassword con el correo actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setError('No se pudo obtener el usuario.'); setGuardando(false); return }

    const { error: errorReauth } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: actual,
    })
    if (errorReauth) {
      setError('La contraseña actual es incorrecta.')
      setGuardando(false)
      return
    }

    const { error: errorUpdate } = await supabase.auth.updateUser({ password: nueva })
    setGuardando(false)
    if (errorUpdate) { setError('Error al actualizar la contraseña.'); return }

    setGuardado(true)
    setTimeout(() => { setGuardado(false); onCerrar() }, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-5 p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Cambiar contraseña</h2>
          <button type="button" onClick={onCerrar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">✕</button>
        </div>

        {/* Campos */}
        {[
          { label: 'Contraseña actual', value: actual, setter: setActual, ver: verActual, setVer: setVerActual },
          { label: 'Nueva contraseña', value: nueva, setter: setNueva, ver: verNueva, setVer: setVerNueva },
          { label: 'Confirmar nueva contraseña', value: confirmar, setter: setConfirmar, ver: verConfirmar, setVer: setVerConfirmar },
        ].map(({ label, value, setter, ver, setVer }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium px-1">{label}</label>
            <div className="relative">
              <input
                type={ver ? 'text' : 'password'}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-full border border-gray-200 px-4 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition"
              />
              <button
                type="button"
                onClick={() => setVer(!ver)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {ver ? (
                  <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                    <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Validaciones visuales */}
        {demasiadoCorta && (
          <p className="text-xs text-amber-500 px-1">La contraseña debe tener al menos 8 caracteres.</p>
        )}
        {noCoinciden && (
          <p className="text-xs text-red-500 px-1">Las contraseñas no coinciden.</p>
        )}
        {error && (
          <p className="text-xs text-red-500 px-1">{error}</p>
        )}

        {/* Botón */}
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando || !actual || !nueva || !confirmar || !!noCoinciden || !!demasiadoCorta}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
            guardado ? 'bg-emerald-500 text-white' : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {guardado ? '✓ Contraseña actualizada' : guardando ? 'Verificando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </div>
  )
}