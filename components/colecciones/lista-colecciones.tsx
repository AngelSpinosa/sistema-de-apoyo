'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TarjetaColeccion from '@/components/colecciones/tarjeta-coleccion'
import FormularioColeccion from '@/components/colecciones/formulario-coleccion'
import Sidebar from '@/components/layout/sidebar'
import ModalCompartir from '@/components/colecciones/modal-compartir'
import { usePathname, useRouter } from 'next/navigation'

type Coleccion = {
  id: string
  nombre: string
  privacidad: 'privada' | 'publica'
  descripcion?: string
  fotografia?: string
  totalRecursos?: number
}

type FiltroPrivacidad = 'todas' | 'privada' | 'publica'

export default function ListaColecciones() {
  const [colecciones, setColecciones]           = useState<Coleccion[]>([])
  const [cargando, setCargando]                 = useState(true)
  const [busqueda, setBusqueda]                 = useState('')
  const [filtroAbierto, setFiltroAbierto]       = useState(false)
  const [filtroPrivacidad, setFiltroPrivacidad] = useState<FiltroPrivacidad>('todas')
  const [modalNueva, setModalNueva]             = useState(false)
  const [coleccionEditar, setColeccionEditar]   = useState<Coleccion | null>(null)
  const [coleccionEliminar, setColeccionEliminar] = useState<Coleccion | null>(null)
  const [eliminando, setEliminando]             = useState(false)
  const [coleccionCompartir, setColeccionCompartir] = useState<Coleccion | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()


  useEffect(() => {
    cargarColecciones()
  }, [])

  async function cargarColecciones() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
    .from('coleccion')
    .select(`
      id_coleccion,
      nombre,
      privacidad,
      descripcion,
      fecha_creacion,
      url_fotografia,
      coleccion_recurso (id_recurso)
    `)
    .eq('id_usuario', user.id)
    .order('fecha_creacion', { ascending: false })

    if (error) { console.error(error); setCargando(false); return }

    setColecciones((data ?? []).map((c: any) => ({
      id:             c.id_coleccion,
      nombre:         c.nombre,
      privacidad:     c.privacidad === true ? 'privada' : 'publica',
      descripcion:    c.descripcion ?? '',
      fotografia:     c.url_fotografia ?? undefined,   // ← aquí estaba el bug
      totalRecursos:  c.coleccion_recurso?.length ?? 0,
    })))
    setCargando(false)
  }

  const coleccionesFiltradas = useMemo(() => {
    let resultado = colecciones
    if (busqueda.trim()) {
      resultado = resultado.filter((c) =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    }
    if (filtroPrivacidad !== 'todas') {
      resultado = resultado.filter((c) => c.privacidad === filtroPrivacidad)
    }
    return resultado
  }, [colecciones, busqueda, filtroPrivacidad])

  // Función auxiliar reutilizable en este mismo archivo
  async function subirFotoColeccion(archivo: File, idColeccion: string): Promise<string> {
    const formData = new FormData()
    formData.append('file',     archivo)
    formData.append('folder',   'colecciones')
    formData.append('publicId', idColeccion)

    const res = await fetch('/api/imagenes/subir', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Error al subir imagen de colección')
    const json = await res.json()
    return json.url as string
  }

  // ── Reemplaza handleCrear ──
  const handleCrear = async (datos: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. INSERT y pedir que devuelva el id generado
    const { data: nueva, error } = await supabase
      .from('coleccion')
      .insert({
        id_usuario:  user.id,
        nombre:      datos.nombre,
        privacidad:  datos.privacidad === 'privada',
        descripcion: datos.descripcion,
      })
      .select('id_coleccion')
      .single()

    if (error || !nueva) {
      console.error('Error creando colección:', error)
      return
    }

    // 2. Subir foto si se seleccionó una
    if (datos.fotografia) {
      try {
        const url = await subirFotoColeccion(datos.fotografia, nueva.id_coleccion)
        await supabase
          .from('coleccion')
          .update({ url_fotografia: url })
          .eq('id_coleccion', nueva.id_coleccion)
      } catch (e) {
        console.error('Error subiendo foto:', e)
        // La colección ya se creó, la foto falló — no bloqueamos al usuario
      }
    }

    await cargarColecciones()
  }

  // ── Reemplaza handleEditar ──
  const handleEditar = async (datos: any) => {
    if (!coleccionEditar) return

    // 1. Subir foto nueva si se seleccionó una
    let url_fotografia: string | undefined = undefined
    if (datos.fotografia) {
      try {
        url_fotografia = await subirFotoColeccion(datos.fotografia, coleccionEditar.id)
      } catch (e) {
        console.error('Error subiendo foto:', e)
      }
    }

    // 2. UPDATE — solo incluye url_fotografia si cambió
    const { error } = await supabase
      .from('coleccion')
      .update({
        nombre:        datos.nombre,
        privacidad:    datos.privacidad === 'privada',
        descripcion:   datos.descripcion,
        ...(url_fotografia ? { url_fotografia } : {}),
      })
      .eq('id_coleccion', coleccionEditar.id)

    if (error) { console.error(error); return }
    setColeccionEditar(null)
    await cargarColecciones()
  }

    const rutaDetalle = pathname.startsWith('/estudiante')
    ? '/estudiante/biblioteca'
    : '/docente/colecciones'

  const handleEliminarConfirmado = async () => {
    if (!coleccionEliminar) return
    setEliminando(true)
    const { error } = await supabase
      .from('coleccion')
      .delete()
      .eq('id_coleccion', coleccionEliminar.id)
    setEliminando(false)
    if (error) { console.error(error); return }
    setColecciones((prev) => prev.filter((c) => c.id !== coleccionEliminar.id))
    setColeccionEliminar(null)
  }

  const handleCompartir = (coleccion: Coleccion) => {
    if (coleccion.privacidad === 'privada') {
      alert('Esta colección es privada. Edítala y cámbiala a pública para poder compartirla.')
      return
    }
    setColeccionCompartir(coleccion)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal — pl-14 para no quedar bajo el sidebar colapsado */}
      <main className="flex-1 pl-14">
        <div className="p-8 max-w-5xl mx-auto relative min-h-screen">

          {/* ── Modales ── */}

          {/* Crear */}
          {modalNueva && (
            <FormularioColeccion
              onGuardar={handleCrear}
              onCerrar={() => setModalNueva(false)}
            />
          )}

          {/* Editar */}
          {coleccionEditar && (
            <FormularioColeccion
              datosIniciales={{
                nombre: coleccionEditar.nombre,
                privacidad: coleccionEditar.privacidad,
                descripcion: coleccionEditar.descripcion,
              }}
              onGuardar={handleEditar}
              onCerrar={() => setColeccionEditar(null)}
              modoEdicion
            />
          )}

          {coleccionCompartir && (
            <ModalCompartir
              coleccion={coleccionCompartir}
              onCerrar={() => setColeccionCompartir(null)}
            />
          )}

          {/* Confirmar eliminación */}
          {coleccionEliminar && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setColeccionEliminar(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-bold text-gray-900">Eliminar colección</h2>
                  <p className="text-sm text-gray-500">
                    ¿Seguro que quieres eliminar{' '}
                    <span className="font-semibold text-gray-800">"{coleccionEliminar.nombre}"</span>?
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setColeccionEliminar(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleEliminarConfirmado}
                    disabled={eliminando}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Encabezado ── */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Colecciones personales
          </h1>

          {/* ── Barra de búsqueda + filtros ── */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 relative">
              <svg viewBox="0 0 20 20" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-gray-400 pointer-events-none">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar colección"
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087] transition bg-white"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >✕</button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltroAbierto((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
                  filtroPrivacidad !== 'todas'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filtros
                {filtroPrivacidad !== 'todas' && (
                  <span className="bg-white text-[#003087] rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">1</span>
                )}
              </button>

              {filtroAbierto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFiltroAbierto(false)} />
                  <div className="absolute right-0 top-11 z-20 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-52 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Privacidad</p>
                    {(['todas', 'privada', 'publica'] as FiltroPrivacidad[]).map((opcion) => (
                      <label key={opcion} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="filtro-privacidad"
                          checked={filtroPrivacidad === opcion}
                          onChange={() => { setFiltroPrivacidad(opcion); setFiltroAbierto(false) }}
                          className="accent-[#003087]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{opcion === 'todas' ? 'Todas' : opcion}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Grid ── */}
          {cargando ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">Cargando colecciones...</p>
            </div>
          ) : coleccionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <p className="text-gray-400 text-sm">
                {busqueda
                  ? `No se encontraron colecciones para "${busqueda}"`
                  : 'Aún no tienes colecciones. ¡Crea una!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {coleccionesFiltradas.map((c) => (
                <TarjetaColeccion
                  key={c.id}
                  coleccion={c}
                  onClick={() => router.push(`${rutaDetalle}/${c.id}`)}
                  onEditar={() => setColeccionEditar(c)}
                  onEliminar={() => setColeccionEliminar(c)}
                  onCompartir={() => handleCompartir(c)}
                />
              ))}
            </div>
          )}

          {/* ── Botón flotante ── */}
          <button
            type="button"
            onClick={() => setModalNueva(true)}
            className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 bg-[#003087] text-white text-sm font-semibold rounded-full shadow-lg hover:bg-[#002070] hover:shadow-xl transition-all duration-200 z-30"
          >
            Nueva colección
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>

        </div>
      </main>
    </div>
  )
}