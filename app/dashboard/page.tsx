'use client'

import BarraBusqueda from '@/components/busqueda/barra-busqueda'
import ChipsTemas from '@/components/busqueda/chips-temas'
import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'
import { useState } from 'react'

// Datos de prueba — después vendrán de Supabase
const TEMAS = ['Tema 1', 'Tema 2', 'Tema 35', 'Tema 777']

const RECURSOS_PRUEBA = [
  { id: '1', titulo: 'Título recurso', fuente: 'Fuente', descripcion: 'Descripción del recurso', promedio: 4 },
  { id: '2', titulo: 'Título recurso', fuente: 'Fuente', descripcion: 'Descripción del recurso', promedio: 3 },
  { id: '3', titulo: 'Título recurso', fuente: 'Fuente', descripcion: 'Descripción del recurso', promedio: 5 },
]

export default function DashboardPage() {
  const [temaActivo, setTemaActivo] = useState(TEMAS[0])

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
        Bienvenido
      </h1>

      {/* Barra de búsqueda */}
      <BarraBusqueda
        onBuscar={(t) => console.log('Buscar:', t)}
        onFiltrar={() => console.log('Filtrar')}
      />

      {/* Chips de temas */}
      <div className="mt-3 flex justify-center">
        <ChipsTemas
          temas={TEMAS}
          temaActivo={temaActivo}
          onSeleccionar={setTemaActivo}
        />
      </div>

      {/* Sección: Seguir viendo */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Seguir viendo
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {RECURSOS_PRUEBA.map((r) => (
            <TarjetaRecurso
              key={r.id}
              titulo={r.titulo}
              fuente={r.fuente}
              descripcion={r.descripcion}
              promedio={r.promedio}
              onClick={() => console.log('Ver recurso:', r.id)}
            />
          ))}
        </div>
      </section>

      <hr className="my-8 border-gray-200" />

      {/* Sección: Más sobre tema activo */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Más sobre {temaActivo}
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {RECURSOS_PRUEBA.map((r) => (
            <TarjetaRecurso
              key={r.id}
              titulo={r.titulo}
              fuente={r.fuente}
              descripcion={r.descripcion}
              promedio={r.promedio}
              onClick={() => console.log('Ver recurso:', r.id)}
            />
          ))}
        </div>
      </section>

    </div>
  )
}