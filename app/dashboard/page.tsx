'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Buscador from '@/components/busqueda/buscador'
import ChipsTemas from '@/components/busqueda/chips-temas'
import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'
import TarjetaRecursoBusqueda from '@/components/recursos/tarjeta-recurso-busqueda'
import PanelFiltros from '@/components/busqueda/panel-filtros'

type Recurso = {
  id: string
  titulo: string
  fuente: string
  tipo: string
  descripcion: string
  promedio: number
  total: number
  url: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [temas, setTemas] = useState<string[]>([])
  const [temaActivo, setTemaActivo] = useState('')
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtrosVisible, setFiltrosVisible] = useState(false)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [recursosPorTemaActivo, setRecursosPorTemaActivo] = useState<Recurso[]>([])
  const [mapaRecursosPorTema, setMapaRecursosPorTema] = useState<Map<string, Recurso[]>>(new Map())
  const [recursosSeguirViendo, setRecursosSeguirViendo] = useState<Recurso[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtrosActivos, setFiltrosActivos] = useState({
    formato: [] as string[],
    dificultad: [] as string[],
    fechaCarga: '',
    fuente: [] as string[],
    selloAcademia: false,
  })

  const supabase = createClient()

  useEffect(() => {
    async function cargarDatos() {
      // 1. Obtener usuario autenticado
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) {
        setCargando(false)
        return
      }

      // 2. Cargar todos los recursos activos con sus calificaciones
      const { data: recursosData, error } = await supabase
        .from('recurso')
        .select(`
          id_recurso,
          titulo,
          recurso_bruto (
            url_fuente,
            formato,
            autor,
            repositorio_externo (nombre_fuente)
          )
        `)
        .eq('disponibilidad', 'activo')

      if (error) {
        console.error('Error cargando recursos:', error)
        setCargando(false)
        return
      }

      const { data: calificaciones } = await supabase
        .from('vista_calificacion_recurso')
        .select('id_recurso, promedio, total_calificaciones')

      const mapaCalificaciones = new Map<string, { promedio: number; total: number }>()
      ;(calificaciones ?? []).forEach((c: any) => {
        mapaCalificaciones.set(c.id_recurso, {
          promedio: c.promedio ?? 0,
          total: c.total_calificaciones ?? 0,
        })
      })

      const mapeados: Recurso[] = (recursosData ?? []).map((r: any) => {
        const calif = mapaCalificaciones.get(r.id_recurso)
        return {
          id: r.id_recurso,
          titulo: r.titulo,
          fuente: r.recurso_bruto?.repositorio_externo?.nombre_fuente ?? 'Desconocido',
          tipo: r.recurso_bruto?.formato ?? 'pdf',
          descripcion: r.recurso_bruto?.autor ?? '',
          promedio: calif?.promedio ?? 0,
          total: calif?.total ?? 0,
          url: r.recurso_bruto?.url_fuente ?? '',
        }
      })

      setRecursos(mapeados)

      // 3. Cargar temas del usuario desde tema_usuario
      const { data: temasData } = await supabase
        .from('tema_usuario')
        .select('nombre_tema, orden')
        .eq('id_usuario', userId)
        .order('orden', { ascending: true })

      const temasOrdenados = (temasData ?? []).map((t: any) => t.nombre_tema)
      setTemas(temasOrdenados)

      const primerTema = temasOrdenados[0] ?? ''
      setTemaActivo(primerTema)

      // 4. Cargar recursos por tema del usuario desde recurso_por_tema_usuario
      const { data: recursosTemaData } = await supabase
        .from('recurso_por_tema_usuario')
        .select('nombre_tema, id_recurso, orden')
        .eq('id_usuario', userId)
        .order('orden', { ascending: true })

      // Construir mapa tema → lista de Recurso
      const mapaRecursos = new Map<string, Recurso[]>()
      ;(recursosTemaData ?? []).forEach((rt: any) => {
        const recurso = mapeados.find(r => r.id === rt.id_recurso)
        if (!recurso) return
        if (!mapaRecursos.has(rt.nombre_tema)) {
          mapaRecursos.set(rt.nombre_tema, [])
        }
        mapaRecursos.get(rt.nombre_tema)!.push(recurso)
      })

      setMapaRecursosPorTema(mapaRecursos)
      setRecursosPorTemaActivo(mapaRecursos.get(primerTema) ?? [])

      // 5. Cargar "Seguir viendo" desde historial_vistas
      const { data: vistas } = await supabase
        .from('historial_vistas')
        .select('id_recurso')
        .eq('id_usuario', userId)
        .order('fecha_vista', { ascending: false })
        .limit(3)

      if (vistas && vistas.length > 0) {
        const vistosIds = vistas.map((v: any) => v.id_recurso)
        const vistosRecursos = vistosIds
          .map((id: string) => mapeados.find(r => r.id === id))
          .filter(Boolean) as Recurso[]
        const faltantes = 3 - vistosRecursos.length
        const relleno = faltantes > 0
          ? mapeados.filter(m => !vistosIds.includes(m.id)).slice(0, faltantes)
          : []
        setRecursosSeguirViendo([...vistosRecursos, ...relleno])
      } else {
        setRecursosSeguirViendo(mapeados.slice(0, 3))
      }

      setCargando(false)
    }

    cargarDatos()
  }, [])

  // Actualizar recursos mostrados cuando cambia el tema activo
  const handleSeleccionarTema = (tema: string) => {
    setTemaActivo(tema)
    setRecursosPorTemaActivo(mapaRecursosPorTema.get(tema) ?? [])
  }

  // Navega al detalle del recurso y guarda la búsqueda si aplica
  const handleVerRecurso = async (id: string, terminoGuardar?: string) => {
    if (terminoGuardar && terminoGuardar.trim().length > 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('historial_busqueda').insert({
          id_usuario: user.id,
          termino: terminoGuardar.trim()
        })
      }
    }
    router.push(`/dashboard/recurso/${id}`)
  }

  const estasBuscando = terminoBusqueda.trim().length > 0

  const resultadosBusqueda = useMemo(() => {
    if (!estasBuscando) return []
    let resultados = recursos.filter(
      (r) =>
        r.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        r.tipo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        r.fuente.toLowerCase().includes(terminoBusqueda.toLowerCase())
    )
    if (filtrosActivos.formato.length > 0)
      resultados = resultados.filter((r) => filtrosActivos.formato.includes(r.tipo))
    if (filtrosActivos.fuente.length > 0)
      resultados = resultados.filter((r) => filtrosActivos.fuente.includes(r.fuente))
    return resultados
  }, [terminoBusqueda, filtrosActivos, recursos, estasBuscando])

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-sm">Cargando recursos...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1
        className={`text-3xl font-bold text-gray-900 text-center mb-6 ${
          estasBuscando ? 'hidden' : 'block'
        }`}
      >
        Bienvenido
      </h1>

      <div className="relative">
        <Buscador
          onBuscar={(t) => setTerminoBusqueda(t)}
          onFiltrar={() => setFiltrosVisible(!filtrosVisible)}
          valor={terminoBusqueda}
          onChange={setTerminoBusqueda}
        />
        <PanelFiltros
          visible={filtrosVisible}
          onCerrar={() => setFiltrosVisible(false)}
          onAplicar={(f) => setFiltrosActivos(f)}
        />
      </div>

      {estasBuscando ? (
        <div className="mt-6">
          <ChipsTemas
            temas={temas}
            temaActivo={temaActivo}
            onSeleccionar={handleSeleccionarTema}
          />
          <div className="mt-6 flex flex-col gap-2">
            {resultadosBusqueda.length > 0 ? (
              resultadosBusqueda.map((r) => (
                <TarjetaRecursoBusqueda
                  key={r.id}
                  idRecurso={r.id}
                  titulo={r.titulo}
                  fuente={r.fuente}
                  tipo={r.tipo}
                  descripcion={r.descripcion}
                  promedio={r.promedio}
                  total={r.total}
                  urlFuente={r.url}
                  formato={r.tipo}
                  onClick={() => handleVerRecurso(r.id, terminoBusqueda)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center mt-10">
                No se encontraron recursos para &quot;{terminoBusqueda}&quot;
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex justify-center">
            <ChipsTemas
              temas={temas}
              temaActivo={temaActivo}
              onSeleccionar={handleSeleccionarTema}
            />
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Seguir viendo</h2>
            <div className="grid grid-cols-3 gap-6">
              {recursosSeguirViendo.map((r) => (
                <TarjetaRecurso
                  key={r.id}
                  idRecurso={r.id}
                  titulo={r.titulo}
                  fuente={r.fuente}
                  descripcion={r.descripcion}
                  promedio={r.promedio}
                  total={r.total}
                  urlFuente={r.url}
                  formato={r.tipo}
                  onClick={() => handleVerRecurso(r.id)}
                />
              ))}
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Más sobre {temaActivo}
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {recursosPorTemaActivo.length > 0 ? (
                recursosPorTemaActivo.map((r) => (
                  <TarjetaRecurso
                    key={r.id}
                    idRecurso={r.id}
                    titulo={r.titulo}
                    fuente={r.fuente}
                    descripcion={r.descripcion}
                    promedio={r.promedio}
                    total={r.total}
                    urlFuente={r.url}
                    formato={r.tipo}
                    onClick={() => handleVerRecurso(r.id)}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm col-span-3 text-center mt-4">
                  No hay recursos asignados para este tema.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}