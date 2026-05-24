'use client'

import { useState, useMemo } from 'react'
import Buscador from '@/components/busqueda/buscador'
import ChipsTemas from '@/components/busqueda/chips-temas'
import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'
import TarjetaRecursoBusqueda from '@/components/recursos/tarjeta-recurso-busqueda'
import PanelFiltros from '@/components/busqueda/panel-filtros'

const TEMAS = ['Tema 1', 'Tema 2', 'Tema 35', 'Tema 777']

const TODOS_LOS_RECURSOS = [
  { id: '1', titulo: 'Introducción a React', fuente: 'YouTube', tipo: 'Video', descripcion: 'Aprende los fundamentos de React desde cero', promedio: 5, tema: 'Tema 1' },
  { id: '2', titulo: 'Patrones de diseño en Java', fuente: 'MERLOT', tipo: 'PDF', descripcion: 'Guía completa de patrones GoF aplicados en Java', promedio: 4, tema: 'Tema 1' },
  { id: '3', titulo: 'Clean Code', fuente: 'Biblioteca CIIES', tipo: 'Paper', descripcion: 'Principios para escribir código limpio y mantenible', promedio: 5, tema: 'Tema 1' },
  { id: '4', titulo: 'Algoritmos y estructuras de datos', fuente: 'YouTube', tipo: 'Video', descripcion: 'Estructuras fundamentales para todo programador', promedio: 4, tema: 'Tema 2' },
  { id: '5', titulo: 'UML para principiantes', fuente: 'MERLOT', tipo: 'Infografía', descripcion: 'Diagramas UML explicados paso a paso', promedio: 3, tema: 'Tema 2' },
  { id: '6', titulo: 'Metodologías ágiles', fuente: 'Biblioteca CIIES', tipo: 'PDF', descripcion: 'Scrum, Kanban y XP explicados con ejemplos reales', promedio: 4, tema: 'Tema 35' },
  { id: '7', titulo: 'Bases de datos relacionales', fuente: 'YouTube', tipo: 'Video', descripcion: 'SQL desde lo básico hasta consultas avanzadas', promedio: 5, tema: 'Tema 35' },
  { id: '8', titulo: 'Arquitectura de software', fuente: 'MERLOT', tipo: 'Paper', descripcion: 'Estilos arquitectónicos y su aplicación práctica', promedio: 4, tema: 'Tema 777' },
  { id: '9', titulo: 'Testing unitario con Jest', fuente: 'YouTube', tipo: 'Video', descripcion: 'Aprende a escribir pruebas unitarias efectivas', promedio: 3, tema: 'Tema 777' },
]

export default function DashboardPage() {
  const [temaActivo, setTemaActivo] = useState(TEMAS[0])
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtrosVisible, setFiltrosVisible] = useState(false)
  const [filtrosActivos, setFiltrosActivos] = useState({
    formato: [] as string[],
    dificultad: [] as string[],
    fechaCarga: '',
    fuente: [] as string[],
    selloAcademia: false,
  })

  const estasBuscando = terminoBusqueda.trim().length > 0

  const resultadosBusqueda = useMemo(() => {
    if (!estasBuscando) return []
    let resultados = TODOS_LOS_RECURSOS.filter(
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
  }, [terminoBusqueda, filtrosActivos, estasBuscando])

  const recursosPorTema = useMemo(
    () => TODOS_LOS_RECURSOS.filter((r) => r.tema === temaActivo),
    [temaActivo]
  )

  const recursosSeguirViendo = TODOS_LOS_RECURSOS.slice(0, 3)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className={`text-3xl font-bold text-gray-900 text-center mb-6 ${estasBuscando ? 'hidden' : 'block'}`}>
        Bienvenido
      </h1>

      {/* Buscador con panel de filtros posicionado relativamente */}
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
                  titulo={r.titulo}
                  fuente={r.fuente}
                  tipo={r.tipo}
                  descripcion={r.descripcion}
                  promedio={r.promedio}
                  onClick={() => console.log('Ver recurso:', r.id)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center mt-10">
                No se encontraron recursos para "{terminoBusqueda}"
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
                <TarjetaRecurso key={r.id} titulo={r.titulo} fuente={r.fuente} descripcion={r.descripcion} promedio={r.promedio} onClick={() => console.log('Ver recurso:', r.id)} />
              ))}
            </div>
          </section>

          <hr className="my-8 border-gray-200" />

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Más sobre {temaActivo}</h2>
            <div className="grid grid-cols-3 gap-6">
              {recursosPorTema.map((r) => (
                <TarjetaRecurso key={r.id} titulo={r.titulo} fuente={r.fuente} descripcion={r.descripcion} promedio={r.promedio} onClick={() => console.log('Ver recurso:', r.id)} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}