'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CalificacionEstrellas from '@/components/recursos/calificacion-estrellas'
import BadgeSello from '@/components/recursos/badge-sello'
import FormularioCuracion, { type DatosCuracion } from '@/components/curacion/formulario-curacion'
import PanelNotasPedagogicas, { type NotaPedagogica } from '@/components/recursos/panel-notas-pedagogicas'
import { ExternalLink } from 'lucide-react'
import { generarMiniaturaCloudinary } from '@/lib/cloudinary/utils'
import { useCalificacion } from '@/hooks/use-calificacion'

type RolUsuario = 'docente' | 'estudiante' | 'administrador'

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
  tieneSello:          boolean
}

type Props = {
  idRecurso:          string
  rol:                RolUsuario
  esMiembroAcademia?: boolean
  nombreUsuario?:     string
}

function detectarTipo(formato: string, url: string): 'pdf' | 'video' | 'imagen' {
  const f = formato?.toLowerCase() ?? ''
  const u = url?.toLowerCase() ?? ''
  if (f === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(u)) return 'video'
  if (f === 'pdf' || u.includes('.pdf') || u.includes('cloudinary')) return 'pdf'
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(u)) return 'imagen'
  return 'pdf'
}

// ─── Modal URL compartida ─────────────────────────────────────────────────────
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

// ─── Acciones docente ─────────────────────────────────────────────────────────
function AccionesDocente({
  recurso, esMiembroAcademia, nombreDocente, notas,
  onOtorgarSello, onAgregarNota, onGuardarEdicion, onCompartirNota, onEliminarNota,
}: {
  recurso:           RecursoDetalle
  esMiembroAcademia: boolean
  nombreDocente?:    string
  notas:             NotaPedagogica[]
  onOtorgarSello:    () => Promise<void>
  onAgregarNota:     () => void
  onGuardarEdicion:  (datos: DatosCuracion, idMetadato: string) => Promise<void>
  onCompartirNota:   (idMetadato: string) => Promise<void>
  onEliminarNota:    (idMetadato: string) => Promise<void>
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
      <BadgeSello
        estadoInicial={recurso.tieneSello ? 'con_sello' : 'sin_sello'}
        onOtorgar={onOtorgarSello}
        esMiembroAcademia={esMiembroAcademia}
        nombreDocente={nombreDocente}
      />

      {notas.length > 0 && (
        <PanelNotasPedagogicas
          idRecurso={recurso.id}
          notas={notas}
          onGuardar={(datos: DatosCuracion, idMetadato?: string) => onGuardarEdicion(datos, idMetadato!)}
          onCompartir={onCompartirNota}
          onEliminar={onEliminarNota}
        />
      )}

      <button
        type="button"
        onClick={onAgregarNota}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 bg-white text-[#003087] border-[#003087] hover:bg-[#003087] hover:text-white"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current flex-shrink-0">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Añadir contexto pedagógico
      </button>
    </div>
  )
}

// ─── Vista PDF ────────────────────────────────────────────────────────────────
function VistaPDF({
  recurso, rol, esMiembroAcademia, nombreDocente, notas,
  promedio, total, miCalificacion,
  onCalificar, onOtorgarSello, onAgregarNota, onGuardarEdicion, onCompartirNota, onEliminarNota,
}: {
  recurso: RecursoDetalle; rol: RolUsuario; esMiembroAcademia: boolean; nombreDocente?: string
  notas: NotaPedagogica[]
  promedio: number; total: number; miCalificacion: number
  onCalificar: (v: number) => Promise<void>; onOtorgarSello: () => Promise<void>
  onAgregarNota: () => void
  onGuardarEdicion: (datos: DatosCuracion, idMetadato: string) => Promise<void>
  onCompartirNota: (idMetadato: string) => Promise<void>
  onEliminarNota: (idMetadato: string) => Promise<void>
}) {
  
  // Usamos nuestra ruta API como proxy para limpiar los encabezados de Cloudinary
  const proxyUrl = recurso.url ? `/api/proxy-pdf?url=${encodeURIComponent(recurso.url)}` : ''

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      <aside className="w-72 flex-shrink-0 flex flex-col gap-5 p-6 overflow-y-auto border-r border-gray-100 bg-white">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{recurso.titulo}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">{recurso.tipo}</p>
          <p className="text-sm text-gray-600 font-medium">{recurso.fuente}</p>
          {recurso.descripcion && <p className="text-sm text-gray-500 mt-1">{recurso.descripcion}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Calificación</p>
          <CalificacionEstrellas
            promedio={promedio} total={total} miCalificacion={miCalificacion}
            onCalificar={onCalificar} readonly={false} size="md"
          />
        </div>

        {rol === 'docente' && (
          <AccionesDocente
            recurso={recurso} esMiembroAcademia={esMiembroAcademia} nombreDocente={nombreDocente}
            notas={notas} onOtorgarSello={onOtorgarSello} onAgregarNota={onAgregarNota}
            onGuardarEdicion={onGuardarEdicion} onCompartirNota={onCompartirNota} onEliminarNota={onEliminarNota}
          />
        )}
      </aside>

      <main className="flex-1 bg-gray-100 flex flex-col overflow-hidden relative">
        {proxyUrl ? (
          <>
            <div className="w-full bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
              <span className="text-xs font-medium text-gray-500 px-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                Visor Integrado Seguro
              </span>
              <a 
                href={recurso.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-600 hover:text-[#003087] bg-gray-50 hover:bg-gray-100 flex items-center gap-1.5 px-3 py-1.5 rounded-md transition"
              >
                Abrir en otra pestaña
                <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="w-full flex-1 relative bg-gray-50">
              {/* Al apuntar a /api/proxy-pdf, el navegador confía en el origen y lo muestra en pantalla */}
              <object
                data={proxyUrl}
                type="application/pdf"
                className="w-full h-full absolute inset-0 border-0"
              >
                {/* Este fallback SOLO se mostrará en celulares (iOS/Android) donde los navegadores NO traen lector PDF integrado */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 overflow-y-auto">
                  <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Visor nativo no disponible</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    Tu navegador (o dispositivo móvil) no cuenta con soporte nativo para visualizar documentos internamente.
                  </p>
                  <a
                    href={recurso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-[#003087] text-white font-medium rounded-lg hover:bg-[#002070] transition shadow-sm"
                  >
                    Abrir documento en el navegador
                  </a>
                </div>
              </object>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-400 text-sm">URL del documento no disponible.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Vista Video ──────────────────────────────────────────────────────────────
function VistaVideo({
  recurso, rol, esMiembroAcademia, nombreDocente, notas,
  promedio, total, miCalificacion,
  onCalificar, onOtorgarSello, onAgregarNota, onGuardarEdicion, onCompartirNota, onEliminarNota,
}: {
  recurso: RecursoDetalle; rol: RolUsuario; esMiembroAcademia: boolean; nombreDocente?: string
  notas: NotaPedagogica[]
  promedio: number; total: number; miCalificacion: number
  onCalificar: (v: number) => Promise<void>; onOtorgarSello: () => Promise<void>
  onAgregarNota: () => void
  onGuardarEdicion: (datos: DatosCuracion, idMetadato: string) => Promise<void>
  onCompartirNota: (idMetadato: string) => Promise<void>
  onEliminarNota: (idMetadato: string) => Promise<void>
}) {
  // Generamos el thumbnail para el poster del video usando la utilidad
  const posterUrl = generarMiniaturaCloudinary(recurso.url, 'video');

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full bg-black">
        {recurso.url ? (
          <video 
            src={recurso.url} 
            poster={posterUrl} // MODIFICADO: Agregada la miniatura
            controls 
            className="w-full max-h-[60vh] object-contain"
          >
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
              promedio={promedio} total={total} miCalificacion={miCalificacion}
              onCalificar={onCalificar} readonly={false} size="lg"
            />
          </div>
        </div>

        {rol === 'docente' && (
          <div className="min-w-[220px]">
            <AccionesDocente
              recurso={recurso} esMiembroAcademia={esMiembroAcademia} nombreDocente={nombreDocente}
              notas={notas} onOtorgarSello={onOtorgarSello} onAgregarNota={onAgregarNota}
              onGuardarEdicion={onGuardarEdicion} onCompartirNota={onCompartirNota} onEliminarNota={onEliminarNota}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DetalleRecursoPage({ idRecurso, rol, esMiembroAcademia = false, nombreUsuario }: Props) {
  const [recurso,           setRecurso]           = useState<RecursoDetalle | null>(null)
  const [notas,             setNotas]             = useState<NotaPedagogica[]>([])
  const [cargando,          setCargando]          = useState(true)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [urlCompartida,     setUrlCompartida]     = useState<string | null>(null)
  const supabase = createClient()

  const {
    promedio: promedioCalificacion,
    total: totalCalificaciones,
    miCalificacion,
    calificar,
  } = useCalificacion(idRecurso)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from('recurso')
        .select(`
          id_recurso, titulo, promedio_calificacion,
          recurso_bruto ( url_fuente, formato, autor, repositorio_externo (nombre_fuente) )
        `)
        .eq('id_recurso', idRecurso)
        .single()

      if (error || !data) { setCargando(false); return }

      const { data: selloData } = await supabase
        .from('sello_validacion').select('id_validacion').eq('id_recurso', idRecurso).maybeSingle()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: curacionData } = await supabase
          .from('recurso_curado').select('id_curacion')
          .eq('id_recurso', idRecurso).eq('id_docente', user.id).maybeSingle()

        if (curacionData) {
          const { data: metasData } = await supabase
            .from('metadato_pedagogico').select('*').eq('id_curacion', curacionData.id_curacion)

          if (metasData) {
            setNotas(metasData.map((m: any) => ({
              idMetadato:           m.id_metadato,
              titulo:               m.titulo                ?? 'Sin título',
              nivelDificultad:      m.nivel_dificultad      ?? '',
              anotacion:            m.anotacion             ?? '',
              resultadoEducacional: m.resultado_educacional ?? '',
              metodoEducacional:    m.metodo_educacional    ?? '',
              tipoRecursoEducativo: m.tipo_recurso_educativo ?? '',
              rolAudiencia:         m.rol_audiencia         ?? '',
              tiempoAprendizaje:    m.tiempo_aprendizaje    ?? '',
            })))
          }
        }
      }

      const rb  = (data as any).recurso_bruto
      const url = rb?.url_fuente ?? ''
      setRecurso({
        id: data.id_recurso, titulo: data.titulo,
        tipo: detectarTipo(rb?.formato ?? '', url), url,
        fuente: rb?.repositorio_externo?.nombre_fuente ?? 'Desconocido',
        descripcion: rb?.autor ?? '', promedio: data.promedio_calificacion ?? 0,
        totalCalificaciones: 0, autor: rb?.autor ?? '', tieneSello: !!selloData,
      })

      // REGISTRAR HISTORIAL DE VISTA
      if (user) {
        const { error: errorVista } = await supabase.from('historial_vistas').upsert({
          id_usuario: user.id,
          id_recurso: idRecurso,
          fecha_vista: new Date().toISOString()
        }, { onConflict: 'id_usuario,id_recurso' }) // <-- IMPORTANTE: sin espacios

        if (errorVista) {
          console.error('Error al registrar la vista en el historial:', errorVista)
        }
      }

      setCargando(false)
    }
    cargar()
  }, [idRecurso])

  const handleCalificar = async (valor: number) => {
    await calificar(valor)
  }

  const handleOtorgarSello = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('sello_validacion').insert({
      id_recurso: idRecurso, id_docente: user.id, fecha_otorgamiento: new Date().toISOString(),
    })
  }

  const obtenerIdCuracion = async (userId: string): Promise<string | null> => {
    const { data: existente } = await supabase
      .from('recurso_curado').select('id_curacion')
      .eq('id_recurso', idRecurso).eq('id_docente', userId).maybeSingle()
    if (existente) return existente.id_curacion

    const { data: nuevo, error } = await supabase
      .from('recurso_curado').insert({ id_recurso: idRecurso, id_docente: userId })
      .select('id_curacion').single()
    if (error) { console.error('Error creando recurso_curado:', error); return null }
    return nuevo.id_curacion
  }

  const handleAgregarNota = async (datos: DatosCuracion) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const idCuracion = await obtenerIdCuracion(user.id)
    if (!idCuracion) return

    const { data: nueva, error } = await supabase
      .from('metadato_pedagogico')
      .insert({
        id_curacion: idCuracion, titulo: datos.titulo,
        resultado_educacional: datos.resultadoEducacional, nivel_dificultad: datos.nivelDificultad,
        metodo_educacional: datos.metodoEducacional, tipo_recurso_educativo: datos.tipoRecursoEducativo,
        rol_audiencia: datos.rolAudiencia, tiempo_aprendizaje: datos.tiempoAprendizaje, anotacion: datos.anotacion,
      })
      .select('*').single()

    if (error || !nueva) { console.error('Error creando nota:', error); return }

    const notaNueva: NotaPedagogica = {
      idMetadato: nueva.id_metadato, titulo: nueva.titulo ?? 'Sin título',
      nivelDificultad: nueva.nivel_dificultad ?? '', anotacion: nueva.anotacion ?? '',
      resultadoEducacional: nueva.resultado_educacional ?? '', metodoEducacional: nueva.metodo_educacional ?? '',
      tipoRecursoEducativo: nueva.tipo_recurso_educativo ?? '', rolAudiencia: nueva.rol_audiencia ?? '',
      tiempoAprendizaje: nueva.tiempo_aprendizaje ?? '',
    }
    setNotas((prev) => [...prev, notaNueva])
    setFormularioAbierto(false)
    await handleCompartirNota(nueva.id_metadato)
  }

  const handleGuardarEdicion = async (datos: DatosCuracion, idMetadato: string) => {
    const { error } = await supabase
      .from('metadato_pedagogico')
      .update({
        titulo: datos.titulo, resultado_educacional: datos.resultadoEducacional,
        nivel_dificultad: datos.nivelDificultad, metodo_educacional: datos.metodoEducacional,
        tipo_recurso_educativo: datos.tipoRecursoEducativo, rol_audiencia: datos.rolAudiencia,
        tiempo_aprendizaje: datos.tiempoAprendizaje, anotacion: datos.anotacion,
      })
      .eq('id_metadato', idMetadato)
    if (error) { console.error('Error editando nota:', error); return }
    setNotas((prev) => prev.map((n) => n.idMetadato === idMetadato ? { ...n, ...datos, idMetadato } : n))
  }

  const handleCompartirNota = async (idMetadato: string) => {
    const { data: existente } = await supabase
      .from('recurso_compartido').select('token').eq('id_metadato', idMetadato).maybeSingle()

    let token: string
    if (existente) {
      token = existente.token
    } else {
      const { data: nuevo, error } = await supabase
        .from('recurso_compartido').insert({ id_metadato: idMetadato }).select('token').single()
      if (error || !nuevo) { console.error('Error compartiendo nota:', error); return }
      token = nuevo.token
    }
    setUrlCompartida(`${window.location.origin}/r/${token}`)
  }

  const handleEliminarNota = async (idMetadato: string) => {
    const { error } = await supabase
      .from('metadato_pedagogico').delete().eq('id_metadato', idMetadato)
    if (error) { console.error('Error eliminando nota:', error); return }
    setNotas((prev) => prev.filter((n) => n.idMetadato !== idMetadato))
  }
  
  if (cargando) return <div className="flex items-center justify-center h-screen"><p className="text-gray-400 text-sm">Cargando recurso...</p></div>
  if (!recurso)  return <div className="flex items-center justify-center h-screen"><p className="text-red-400 text-sm">No se encontró el recurso.</p></div>

  const vistaProps = {
    recurso, rol, esMiembroAcademia, nombreDocente: nombreUsuario, notas,
    promedio: promedioCalificacion, total: totalCalificaciones, miCalificacion,
    onCalificar: handleCalificar, onOtorgarSello: handleOtorgarSello,
    onAgregarNota: () => setFormularioAbierto(true),
    onGuardarEdicion: handleGuardarEdicion,
    onCompartirNota: handleCompartirNota,
    onEliminarNota: handleEliminarNota,
  }

  return (
    <>
      {formularioAbierto && (
        <FormularioCuracion idRecurso={idRecurso} onGuardar={handleAgregarNota} onCerrar={() => setFormularioAbierto(false)} />
      )}
      {urlCompartida && (
        <ModalCompartir url={urlCompartida} onCerrar={() => setUrlCompartida(null)} />
      )}
      {recurso.tipo === 'video' ? <VistaVideo {...vistaProps} /> : <VistaPDF {...vistaProps} />}
    </>
  )
}