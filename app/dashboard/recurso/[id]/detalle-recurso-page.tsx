'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CalificacionEstrellas from '@/components/recursos/calificacion-estrellas'
import BadgeSello from '@/components/recursos/badge-sello'
import BotonContextoPedagogico from '@/components/recursos/boton-contexto-pedagogico'

type RolUsuario = 'docente' | 'estudiante' | 'administrador'

type DatosCuracion = {
  objetivoAprendizaje:       string
  nivelDificultad:           'facil' | 'intermedio' | 'dificil'
  tiempoEstimadoUso:         string
  notasUso:                  string
  perfilEstudianteSugerido:  string
}

type RecursoDetalle = {
  id:                  string
  titulo:              string
  tipo:                string
  url:                 string
  fuente:              string
  descripcion:         string
  promedio:            number
  totalCalificaciones: number
  autor:               string
  tieneSello:          boolean          // ← antes era estadoSello: 'sin_sello' | 'pendiente' | 'aprobado' | 'rechazado'
  curacion?:           Partial<DatosCuracion>
}

type Props = {
  idRecurso:           string
  rol:                 RolUsuario
  esMiembroAcademia?:  boolean
  nombreUsuario?:      string
}

function detectarTipo(formato: string, url: string): 'pdf' | 'video' | 'imagen' {
  const f = formato?.toLowerCase() ?? ''
  const u = url?.toLowerCase() ?? ''
  if (f === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(u)) return 'video'
  if (f === 'pdf' || u.includes('.pdf') || u.includes('cloudinary')) return 'pdf'
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(u)) return 'imagen'
  return 'pdf'
}

// ─── Acciones docente ─────────────────────────────────────────────────────────
function AccionesDocente({
  recurso,
  esMiembroAcademia,
  nombreDocente,
  onOtorgarSello,
  onGuardarContexto,
}: {
  recurso:            RecursoDetalle
  esMiembroAcademia:  boolean
  nombreDocente?:     string
  onOtorgarSello:     () => Promise<void>
  onGuardarContexto:  (datos: DatosCuracion) => Promise<void>
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
      <BadgeSello
        estadoInicial={recurso.tieneSello ? 'con_sello' : 'sin_sello'}
        onOtorgar={onOtorgarSello}
        esMiembroAcademia={esMiembroAcademia}
        nombreDocente={nombreDocente}
      />
      <BotonContextoPedagogico
        idRecurso={recurso.id}
        datosIniciales={recurso.curacion}
        onGuardar={onGuardarContexto}
      />
    </div>
  )
}

// ─── Vista PDF ────────────────────────────────────────────────────────────────
function VistaPDF({
  recurso, rol, esMiembroAcademia, nombreDocente,
  onCalificar, onOtorgarSello, onGuardarContexto,
}: {
  recurso:            RecursoDetalle
  rol:                RolUsuario
  esMiembroAcademia:  boolean
  nombreDocente?:     string
  onCalificar:        (v: number) => Promise<void>
  onOtorgarSello:     () => Promise<void>
  onGuardarContexto:  (datos: DatosCuracion) => Promise<void>
}) {
  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      <aside className="w-72 flex-shrink-0 flex flex-col gap-5 p-6 overflow-y-auto border-r border-gray-100 bg-white">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{recurso.titulo}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">{recurso.tipo}</p>
          <p className="text-sm text-gray-600 font-medium">{recurso.fuente}</p>
          {recurso.descripcion && (
            <p className="text-sm text-gray-500 mt-1">{recurso.descripcion}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Calificación</p>
          <CalificacionEstrellas
            promedio={recurso.promedio}
            total={recurso.totalCalificaciones}
            onCalificar={onCalificar}
            readonly={false}
            size="md"
          />
        </div>

        {rol === 'docente' && (
          <AccionesDocente
            recurso={recurso}
            esMiembroAcademia={esMiembroAcademia}
            nombreDocente={nombreDocente}
            onOtorgarSello={onOtorgarSello}
            onGuardarContexto={onGuardarContexto}
          />
        )}
      </aside>

      <main className="flex-1 bg-gray-50 overflow-hidden">
        {recurso.url ? (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(recurso.url)}&embedded=true`}
            title={recurso.titulo}
            className="w-full h-full border-0"
            aria-label={`PDF: ${recurso.titulo}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">URL del documento no disponible.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Vista Video ──────────────────────────────────────────────────────────────
function VistaVideo({
  recurso, rol, esMiembroAcademia, nombreDocente,
  onCalificar, onOtorgarSello, onGuardarContexto,
}: {
  recurso:            RecursoDetalle
  rol:                RolUsuario
  esMiembroAcademia:  boolean
  nombreDocente?:     string
  onCalificar:        (v: number) => Promise<void>
  onOtorgarSello:     () => Promise<void>
  onGuardarContexto:  (datos: DatosCuracion) => Promise<void>
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full bg-black">
        {recurso.url ? (
          <video src={recurso.url} controls className="w-full max-h-[60vh] object-contain">
            Tu navegador no soporta la reproducción de video.
          </video>
        ) : (
          <div className="flex items-center justify-center aspect-video bg-gray-900">
            <p className="text-gray-500 text-sm">URL del video no disponible.</p>
          </div>
        )}
      </div>

      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{recurso.titulo}</h1>
          <p className="text-sm text-gray-500">{recurso.tipo}</p>
          <p className="text-sm text-gray-700 font-medium">{recurso.fuente}</p>
          {recurso.descripcion && <p className="text-sm text-gray-500">{recurso.descripcion}</p>}
          <div className="mt-3">
            <CalificacionEstrellas
              promedio={recurso.promedio}
              total={recurso.totalCalificaciones}
              onCalificar={onCalificar}
              readonly={false}
              size="lg"
            />
          </div>
        </div>

        {rol === 'docente' && (
          <div className="min-w-[220px]">
            <AccionesDocente
              recurso={recurso}
              esMiembroAcademia={esMiembroAcademia}
              nombreDocente={nombreDocente}
              onOtorgarSello={onOtorgarSello}
              onGuardarContexto={onGuardarContexto}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DetalleRecursoPage({ idRecurso, rol, esMiembroAcademia = false, nombreUsuario }: Props) {
  const [recurso, setRecurso]   = useState<RecursoDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
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
        .eq('id_recurso', idRecurso)
        .single()

      if (error || !data) {
        console.error('Código:', (error as any)?.code, '| Mensaje:', error?.message)
        setCargando(false)
        return
      }

      // Si existe una fila → tiene sello. Si no → no tiene.
      const { data: selloData } = await supabase
        .from('sello_validacion')
        .select('id_validacion')
        .eq('id_recurso', idRecurso)
        .maybeSingle()

      const { data: metaData } = await supabase
        .from('recurso_curado')
        .select(`
          id_curacion,
          metadato_pedagogico (
            objetivo_aprendizaje,
            nivel_dificultad,
            tiempo_estimado_uso,
            notas_uso,
            perfil_estudiante_sugerido
          )
        `)
        .eq('id_recurso', idRecurso)
        .maybeSingle()

      const meta = (metaData as any)?.metadato_pedagogico
      const rb   = (data as any).recurso_bruto
      const url  = rb?.url_fuente ?? ''

      setRecurso({
        id:                  data.id_recurso,
        titulo:              data.titulo,
        tipo:                detectarTipo(rb?.formato ?? '', url),
        url,
        fuente:              rb?.repositorio_externo?.nombre_fuente ?? 'Desconocido',
        descripcion:         rb?.autor ?? '',
        promedio:            data.promedio_calificacion ?? 0,
        totalCalificaciones: 0,
        autor:               rb?.autor ?? '',
        tieneSello:          !!selloData,   // ← true si existe fila, false si no
        curacion: meta ? {
          objetivoAprendizaje:      meta.objetivo_aprendizaje ?? '',
          nivelDificultad:          meta.nivel_dificultad ?? 'facil',
          tiempoEstimadoUso:        meta.tiempo_estimado_uso ?? '',
          notasUso:                 meta.notas_uso ?? '',
          perfilEstudianteSugerido: meta.perfil_estudiante_sugerido ?? '',
        } : undefined,
      })
      setCargando(false)
    }

    cargar()
  }, [idRecurso])

  const handleCalificar = async (valor: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('calificacion').upsert({
      id_recurso: idRecurso,
      id_usuario: user.id,
      puntuacion: valor,
    })
  }

  const handleOtorgarSello = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('sello_validacion').insert({
      id_recurso:         idRecurso,
      id_docente:         user.id,
      fecha_otorgamiento: new Date().toISOString(),
    })
  }

  const handleGuardarContexto = async (datos: DatosCuracion) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let idCuracion: string | null = null
    const { data: curacionExistente } = await supabase
      .from('recurso_curado')
      .select('id_curacion')
      .eq('id_recurso', idRecurso)
      .eq('id_docente', user.id)
      .maybeSingle()

    if (curacionExistente) {
      idCuracion = curacionExistente.id_curacion
    } else {
      const { data: nuevaCuracion, error } = await supabase
        .from('recurso_curado')
        .insert({ id_recurso: idRecurso, id_docente: user.id })
        .select('id_curacion')
        .single()
      if (error) { console.error('Error creando recurso_curado:', error); return }
      idCuracion = nuevaCuracion.id_curacion
    }

    await supabase.from('metadato_pedagogico').upsert({
      id_curacion:               idCuracion,
      objetivo_aprendizaje:      datos.objetivoAprendizaje,
      nivel_dificultad:          datos.nivelDificultad,
      tiempo_estimado_uso:       datos.tiempoEstimadoUso,
      notas_uso:                 datos.notasUso,
      perfil_estudiante_sugerido: datos.perfilEstudianteSugerido,
    })
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-sm">Cargando recurso...</p>
      </div>
    )
  }

  if (!recurso) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-400 text-sm">No se encontró el recurso.</p>
      </div>
    )
  }

  const props = {
    recurso,
    rol,
    esMiembroAcademia,
    nombreDocente:    nombreUsuario,
    onCalificar:      handleCalificar,
    onOtorgarSello:   handleOtorgarSello,
    onGuardarContexto: handleGuardarContexto,
  }

  if (recurso.tipo === 'video') return <VistaVideo {...props} />
  return <VistaPDF {...props} />
}