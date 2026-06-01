'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Coleccion = {
  id: string
  nombre: string
  privacidad: 'privada' | 'publica'
  descripcion?: string
  fotografia?: string
  totalRecursos?: number
}

type Props = {
  idRecurso: string
  onCerrar: () => void
  onGuardado?: () => void
}

export default function ModalGuardarRecurso({ idRecurso, onCerrar, onGuardado }: Props) {
  const [colecciones, setColecciones]       = useState<Coleccion[]>([])
  const [yaGuardadas, setYaGuardadas]       = useState<Set<string>>(new Set())
  const [seleccionadas, setSeleccionadas]   = useState<Set<string>>(new Set())
  const [cargando, setCargando]             = useState(true)
  const [guardando, setGuardando]           = useState(false)
  const [guardado, setGuardado]             = useState(false)
  const supabase = createClient()

  useEffect(() => {
    cargarDatos()
  }, [])

    async function cargarDatos() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Consulta 1: colecciones del usuario (sin JOIN)
    const { data: cols, error: errorCols } = await supabase
        .from('coleccion')
        .select('id_coleccion, nombre, privacidad, descripcion')
        .eq('id_usuario', user.id)
        .order('fecha_creacion', { ascending: false })

    if (errorCols) { console.error('Error colecciones:', errorCols); setCargando(false); return }

    // Consulta 2: total de recursos por colección
    const idsColeccion = (cols ?? []).map((c: any) => c.id_coleccion)
    
    const { data: recursos } = idsColeccion.length > 0
        ? await supabase
            .from('coleccion_recurso')
            .select('id_coleccion')
            .in('id_coleccion', idsColeccion)
        : { data: [] }

    // Consulta 3: en cuáles ya está el recurso actual
    const { data: existentes } = await supabase
        .from('coleccion_recurso')
        .select('id_coleccion')
        .eq('id_recurso', idRecurso)

    
    // Conteo de recursos por colección
    const conteo: Record<string, number> = {}
    for (const r of recursos ?? []) {
        conteo[r.id_coleccion] = (conteo[r.id_coleccion] ?? 0) + 1
    }

    const idsExistentes = new Set((existentes ?? []).map((e: any) => e.id_coleccion as string))
    setYaGuardadas(idsExistentes)
    setSeleccionadas(new Set(idsExistentes))

    setColecciones((cols ?? []).map((c: any) => ({
        id: c.id_coleccion,
        nombre: c.nombre,
        privacidad: c.privacidad === true ? 'privada' : 'publica',
        descripcion: c.descripcion ?? '',
        fotografia: undefined,
        totalRecursos: conteo[c.id_coleccion] ?? 0,
    })))
    setCargando(false)
    }

  const toggleSeleccion = (id: string) => {
    // No se puede deseleccionar si ya estaba guardada previamente
    if (yaGuardadas.has(id)) return
    setSeleccionadas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleGuardar = async () => {
    setGuardando(true)

    const nuevas = [...seleccionadas].filter((id) => !yaGuardadas.has(id))

    for (const id_coleccion of nuevas) {
        const { error } = await supabase
        .from('coleccion_recurso')
        .insert({ id_coleccion, id_recurso: idRecurso })
        
        if (error) {
        // Ignorar error de duplicado (código 23505 = unique violation)
        if (error.code !== '23505') {
            console.error('Error insertando:', error)
            setGuardando(false)
            return
        }
        }
    }

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => {
        onGuardado?.()
        onCerrar()
    }, 1000)
    }

  const nuevasSeleccionadas = [...seleccionadas].filter((id) => !yaGuardadas.has(id)).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col gap-5 p-7 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Añadir recurso a una colección</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          >✕</button>
        </div>

        {/* Grid de colecciones */}
        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {cargando ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400 text-sm">Cargando colecciones...</p>
            </div>
          ) : colecciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-gray-400 text-sm">Aún no tienes colecciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {colecciones.map((c) => {
                const estaSeleccionada = seleccionadas.has(c.id)
                const yaEstaba = yaGuardadas.has(c.id)

                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSeleccion(c.id)}
                    className={`relative rounded-2xl border-2 transition-all duration-150 overflow-hidden
                      ${yaEstaba
                        ? 'border-emerald-400 cursor-default opacity-80'
                        : estaSeleccionada
                          ? 'border-[#003087] cursor-pointer shadow-md'
                          : 'border-gray-100 cursor-pointer hover:border-gray-300 hover:shadow-sm'
                      }`}
                  >
                    {/* Miniatura */}
                    <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                      {c.fotografia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.fotografia} alt={c.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <svg viewBox="0 0 48 48" className="w-10 h-10 text-gray-300 fill-current">
                            <path d="M6 8a2 2 0 012-2h10l4 4h18a2 2 0 012 2v26a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                      )}

                      {/* Badge recursos */}
                      {typeof c.totalRecursos === 'number' && (
                        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {c.totalRecursos} {c.totalRecursos === 1 ? 'recurso' : 'recursos'}
                        </span>
                      )}

                      {/* Check de selección */}
                      {(estaSeleccionada || yaEstaba) && (
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center shadow
                          ${yaEstaba ? 'bg-emerald-500' : 'bg-[#003087]'}`}
                        >
                          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-white">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-3 py-2.5 flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.nombre}</p>
                      <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                        {c.privacidad}
                        {yaEstaba && (
                          <span className="text-emerald-500 font-medium">· Ya guardado</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 shrink-0 pt-1">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || guardado || nuevasSeleccionadas === 0}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              guardado
                ? 'bg-emerald-500 text-white'
                : 'bg-[#003087] text-white hover:bg-[#002070] disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {guardado
              ? '✓ Guardado'
              : guardando
                ? 'Guardando...'
                : nuevasSeleccionadas > 0
                  ? `Guardar en ${nuevasSeleccionadas} ${nuevasSeleccionadas === 1 ? 'colección' : 'colecciones'}`
                  : 'Guardar recurso'
            }
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}