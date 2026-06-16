import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ token: string }>
}

function detectarTipo(formato: string, url: string): 'pdf' | 'video' {
  const f = formato?.toLowerCase() ?? ''
  const u = url?.toLowerCase() ?? ''
  if (f === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(u)) return 'video'
  return 'pdf'
}

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

export default async function RecursoCompartidoPage({ params }: Props) {
  const { token } = await params
  const supabase  = await createClient()

  // 1. Validar token → obtener id_metadato
  const { data: compartido, error: errorToken } = await supabase
    .from('recurso_compartido')
    .select('id_metadato')
    .eq('token', token)
    .maybeSingle()

  if (errorToken || !compartido) return notFound()

  // 2–5. Un solo query SQL raw que une todas las tablas.
  //       Los queries encadenados fallaban porque RLS bloqueaba
  //       columnas intermedias (id_curacion) para sesiones anónimas.
  type RecursoCompartidoRow = {
    titulo:                 string | null
    resultado_educacional:  string | null
    nivel_dificultad:       string | null
    metodo_educacional:     string | null
    tipo_recurso_educativo: string | null
    rol_audiencia:          string | null
    tiempo_aprendizaje:     string | null
    anotacion:              string | null
    titulo_recurso:         string | null
    url_fuente:             string | null
    formato:                string | null
    autor:                  string | null
    nombre_fuente:          string | null
    nombre_docente:         string | null
  }

  const { data: raw, error: errorQuery } = await supabase
    .rpc('get_recurso_compartido_por_token', { p_token: token })
    .maybeSingle()

  if (errorQuery || !raw) return notFound()

  const resultado = raw as RecursoCompartidoRow
  const meta = resultado
  const url  = resultado.url_fuente ?? ''
  const tipo = detectarTipo(resultado.formato ?? '', url)
  const nombreDocente = resultado.nombre_docente ?? 'Docente'

  // Adaptar forma de recursoData para el JSX existente
  const recursoData = { titulo: resultado.titulo_recurso }
  const rb = {
    url_fuente:          resultado.url_fuente,
    formato:             resultado.formato,
    autor:               resultado.autor,
    repositorio_externo: { nombre_fuente: resultado.nombre_fuente },
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Banner */}
      <div className="bg-[#003087] text-white px-6 py-3 flex items-center gap-3 text-sm flex-shrink-0">
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Recurso compartido por <strong>{nombreDocente}</strong> · Nota: <strong>{meta.titulo}</strong>
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
        {/* Panel lateral */}
        <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
          <div className="p-6 flex flex-col gap-5">

            {/* Info del recurso */}
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-bold text-gray-900 leading-snug">
                {recursoData?.titulo ?? 'Recurso'}
              </h1>
              <p className="text-sm text-gray-500">
                {rb?.repositorio_externo?.nombre_fuente ?? 'Fuente desconocida'}
              </p>
              {rb?.autor && <p className="text-xs text-gray-400">{rb.autor}</p>}
            </div>

            {/* Nota pedagógica */}
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#003087] uppercase tracking-wide">
                  {meta.titulo}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                  ISO/IEC 19788-5
                </span>
              </div>

              {/* Dificultad */}
              {meta.nivel_dificultad && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Nivel de dificultad <span className="text-gray-300">DES0800</span>
                  </p>
                  <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${
                    COLORES_DIFICULTAD[meta.nivel_dificultad] ?? 'bg-gray-100 text-gray-600'
                  }`}>
                    {ETIQUETAS_DIFICULTAD[meta.nivel_dificultad] ?? meta.nivel_dificultad}
                  </span>
                </div>
              )}

              {/* Resultado educacional */}
              {meta.resultado_educacional && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Resultado educacional <span className="text-gray-300">DES0500</span>
                  </p>
                  <p className="text-sm text-gray-700">{meta.resultado_educacional}</p>
                </div>
              )}

              {/* Anotación */}
              {meta.anotacion && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Anotación del docente <span className="text-gray-300">DES1000</span>
                  </p>
                  <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                    {meta.anotacion}
                  </p>
                </div>
              )}

              {/* Metadatos secundarios */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3">
                {meta.metodo_educacional && (
                  <div>
                    <p className="text-gray-400">Método <span className="text-gray-300">DES0100</span></p>
                    <p className="text-gray-700 capitalize">{meta.metodo_educacional.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {meta.tipo_recurso_educativo && (
                  <div>
                    <p className="text-gray-400">Tipo <span className="text-gray-300">DES0200</span></p>
                    <p className="text-gray-700 capitalize">{meta.tipo_recurso_educativo.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {meta.rol_audiencia && (
                  <div>
                    <p className="text-gray-400">Audiencia <span className="text-gray-300">DES0700</span></p>
                    <p className="text-gray-700 capitalize">{meta.rol_audiencia}</p>
                  </div>
                )}
                {meta.tiempo_aprendizaje && (
                  <div>
                    <p className="text-gray-400">Tiempo <span className="text-gray-300">DES0900</span></p>
                    <p className="text-gray-700">{meta.tiempo_aprendizaje} min</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Visor */}
        <main className="flex-1 overflow-hidden bg-gray-100">
          {tipo === 'pdf' && url && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
              title={recursoData?.titulo ?? 'Recurso'}
              className="w-full h-full border-0"
            />
          )}
          {tipo === 'video' && url && (
            <video src={url} controls className="w-full h-full object-contain">
              Tu navegador no soporta la reproducción de video.
            </video>
          )}
          {!url && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">URL del recurso no disponible.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}