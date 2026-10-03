import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GridRecursosPublico from './grid-recursos-publico'

type Props = {
  params: Promise<{ token: string }>
}

type FilaColeccionCompartida = {
  nombre_coleccion:      string | null
  descripcion_coleccion: string | null
  nombre_propietario:    string | null
  id_recurso:            string | null
  titulo_recurso:        string | null
  url_fuente:            string | null
  formato:               string | null
  autor:                 string | null
  nombre_fuente:         string | null
  promedio_calificacion: number | null
}

export default async function ColeccionCompartidaPage({ params }: Props) {
  const { token } = await params
  const supabase  = await createClient()

  const { data: filas, error } = await supabase
    .rpc('get_coleccion_compartida_por_token', { p_token: token })

  if (error || !filas || filas.length === 0) return notFound()

  const resultado = filas as FilaColeccionCompartida[]
  const { nombre_coleccion, descripcion_coleccion, nombre_propietario } = resultado[0]

  // Si la colección no tiene recursos, la RPC regresa una sola fila con
  // id_recurso en null (por el left join); filtramos eso para el grid.
  const recursos = resultado
    .filter((r) => r.id_recurso)
    .map((r) => ({
      id:          r.id_recurso as string,
      titulo:      r.titulo_recurso ?? '',
      fuente:      r.nombre_fuente ?? 'Desconocido',
      descripcion: r.autor ?? '',
      promedio:    r.promedio_calificacion ?? 0,
      urlFuente:   r.url_fuente ?? undefined,
      formato:     r.formato ?? undefined,
    }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Banner */}
      <div className="bg-[#003087] text-white px-6 py-3 flex items-center gap-3 text-sm flex-shrink-0">
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Colección compartida por <strong>{nombre_propietario ?? 'un docente'}</strong>
        </span>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full">
        {/* Encabezado */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{nombre_coleccion}</h1>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              Pública
            </span>
          </div>
          {descripcion_coleccion && (
            <p className="text-sm text-gray-500">{descripcion_coleccion}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {recursos.length} {recursos.length === 1 ? 'recurso' : 'recursos'}
          </p>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Grid de recursos */}
        {recursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <svg viewBox="0 0 48 48" className="w-12 h-12 fill-gray-200">
              <path d="M6 8a2 2 0 012-2h10l4 4h18a2 2 0 012 2v26a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" />
            </svg>
            <p className="text-gray-400 text-sm">Esta colección aún no tiene recursos.</p>
          </div>
        ) : (
          <GridRecursosPublico recursos={recursos} />
        )}
      </div>
    </div>
  )
}