'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'
import { Search } from 'lucide-react'

type Coleccion = {
  nombre: string
  descripcion?: string
  privacidad: boolean
}

type Recurso = {
  id: string
  titulo: string
  fuente: string
  descripcion: string
  promedio: number
  urlFuente?: string
  formato?: string
}

export default function DetalleColeccionEstudiantePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [coleccion, setColeccion] = useState<Coleccion | null>(null)
  const [recursos, setRecursos]   = useState<Recurso[]>([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const supabase = createClient()

  useEffect(() => {
    cargarDatos()
  }, [id])

  async function cargarDatos() {
    const { data: col, error: errorCol } = await supabase
      .from('coleccion')
      .select('nombre, descripcion, privacidad')
      .eq('id_coleccion', id)
      .single()

    if (errorCol || !col) { setCargando(false); return }
    setColeccion(col)

    const { data: relaciones } = await supabase
      .from('coleccion_recurso')
      .select('id_recurso')
      .eq('id_coleccion', id)

    const ids = (relaciones ?? []).map((r: any) => r.id_recurso)
    if (ids.length === 0) { setCargando(false); return }

    const { data: recursosData } = await supabase
      .from('recurso')
      .select(`
        id_recurso,
        titulo,
        promedio_calificacion,
        recurso_bruto (
          url_fuente,
          formato,
          autor,
          repositorio_externo (nombre_fuente)
        )
      `)
      .in('id_recurso', ids)

    setRecursos((recursosData ?? []).map((r: any) => ({
      id: r.id_recurso,
      titulo: r.titulo,
      fuente: r.recurso_bruto?.repositorio_externo?.nombre_fuente ?? 'Desconocido',
      descripcion: r.recurso_bruto?.autor ?? '',
      promedio: r.promedio_calificacion ?? 0,
      urlFuente: r.recurso_bruto?.url_fuente ?? undefined,
      formato: r.recurso_bruto?.formato ?? undefined,
    })))

    setCargando(false)
  }

  const recursosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return recursos
    return recursos.filter(
      (r) =>
        r.titulo.toLowerCase().includes(termino) ||
        r.descripcion.toLowerCase().includes(termino) ||
        r.fuente.toLowerCase().includes(termino)
    )
  }, [recursos, busqueda])

  if (cargando) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400 text-sm">Cargando colección...</p>
    </div>
  )

  if (!coleccion) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400 text-sm">Colección no encontrada.</p>
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a biblioteca
      </button>

      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">{coleccion.nombre}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            coleccion.privacidad ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {coleccion.privacidad ? 'Privada' : 'Pública'}
          </span>
        </div>
        {coleccion.descripcion && (
          <p className="text-sm text-gray-500">{coleccion.descripcion}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {recursos.length} {recursos.length === 1 ? 'recurso' : 'recursos'}
        </p>
      </div>

      {/* Barra de búsqueda dentro de la colección */}
      {recursos.length > 0 && (
        <div className="relative mt-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en esta colección"
            className="w-full pl-9 pr-9 py-2 rounded-full border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition bg-white"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >✕</button>
          )}
        </div>
      )}

      <hr className="my-6 border-gray-200" />

      {recursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <svg viewBox="0 0 48 48" className="w-12 h-12 fill-gray-200">
            <path d="M6 8a2 2 0 012-2h10l4 4h18a2 2 0 012 2v26a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-gray-400 text-sm">Esta colección aún no tiene recursos.</p>
        </div>
      ) : recursosFiltrados.length === 0 ? (
        <p className="text-gray-400 text-sm text-center mt-10">
          No se encontraron recursos para "{busqueda}"
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {recursosFiltrados.map((r) => (
            <TarjetaRecurso
              key={r.id}
              idRecurso={r.id}
              titulo={r.titulo}
              fuente={r.fuente}
              descripcion={r.descripcion}
              promedio={r.promedio}
              urlFuente={r.urlFuente}
              formato={r.formato}
              onClick={() => router.push(`/dashboard/recurso/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}