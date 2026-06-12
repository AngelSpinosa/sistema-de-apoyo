'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Buscador from '@/components/busqueda/buscador'
import ChipsTemas from '@/components/busqueda/chips-temas'
import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'
import TarjetaRecursoBusqueda from '@/components/recursos/tarjeta-recurso-busqueda'
import PanelFiltros from '@/components/busqueda/panel-filtros'

const TEMAS = ['Tema 1', 'Tema 2', 'Tema 35', 'Tema 777']

type Recurso = {
  id: string
  titulo: string
  fuente: string
  tipo: string
  descripcion: string
  promedio: number
  url: string
  tema: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [temaActivo, setTemaActivo] = useState(TEMAS[0])
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtrosVisible, setFiltrosVisible] = useState(false)
  const [recursos, setRecursos] = useState<Recurso[]>([])
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
    async function cargarRecursos() {
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
        .eq('disponibilidad', 'activo')

      if (error) {
        console.error('Error cargando recursos:', error)
        setCargando(false)
        return
      }

      const mapeados: Recurso[] = (data ?? []).map((r: any) => ({
        id: r.id_recurso,
        titulo: r.titulo,
        fuente: r.recurso_bruto?.repositorio_externo?.nombre_fuente ?? 'Desconocido',
        tipo: r.recurso_bruto?.formato ?? 'pdf',
        descripcion: r.recurso_bruto?.autor ?? '',
        promedio: r.promedio_calificacion ?? 0,
        url: r.recurso_bruto?.url_fuente ?? '',
        tema: TEMAS[0],
      }))

      setRecursos(mapeados)

      // Cargar "Seguir Viendo" desde historial
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: vistas } = await supabase
          .from('historial_vistas')
          .select('id_recurso')
          .eq('id_usuario', userData.user.id)
          .order('fecha_vista', { ascending: false })
          .limit(3)

        if (vistas && vistas.length > 0) {
          const vistosIds = vistas.map(v => v.id_recurso)
          const vistosRecursos = vistosIds.map(id => mapeados.find(r => r.id === id)).filter(Boolean) as Recurso[]
          // Si el historial devuelve menos de 3, rellenamos con otros recursos
          const faltantes = 3 - vistosRecursos.length
          const relleno = faltantes > 0 ? mapeados.filter(m => !vistosIds.includes(m.id)).slice(0, faltantes) : []
          
          setRecursosSeguirViendo([...vistosRecursos, ...relleno])
        } else {
          setRecursosSeguirViendo(mapeados.slice(0, 3))
        }
      } else {
        setRecursosSeguirViendo(mapeados.slice(0, 3))
      }

      setCargando(false)
    }

    cargarRecursos()
  }, [])

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

  const recursosPorTema = useMemo(
    () => recursos.filter((r) => r.tema === temaActivo),
    [temaActivo, recursos]
  )

  // ELIMINAR ESTA LÍNEA ANTIGUA: const recursosSeguirViendo = recursos.slice(0, 3)

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
          <ChipsTemas temas={TEMAS} temaActivo={temaActivo} onSeleccionar={setTemaActivo} />
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
            <ChipsTemas temas={TEMAS} temaActivo={temaActivo} onSeleccionar={setTemaActivo} />
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
                  urlFuente={r.url}         // <-- AÑADIDO
                  formato={r.tipo}          // <-- AÑADIDO
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
              {recursosPorTema.map((r) => (
                <TarjetaRecurso
                  key={r.id}
                  idRecurso={r.id}
                  titulo={r.titulo}
                  fuente={r.fuente}
                  descripcion={r.descripcion}
                  promedio={r.promedio}
                  urlFuente={r.url}         // <-- AÑADIDO
                  formato={r.tipo}          // <-- AÑADIDO
                  onClick={() => handleVerRecurso(r.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}