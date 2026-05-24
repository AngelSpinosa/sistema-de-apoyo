'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useParams } from 'next/navigation'
import TablaRecursosRepositorio from '@/components/admin/tabla-recursos-repositorio'

const REPOSITORIOS: Record<string, string> = {
  '1': 'MERLOT',
  '2': 'Biblioteca CIIES',
  '3': 'Cloudinary REA',
  '4': 'OER Commons',
  '5': 'Khan Academy',
  '6': 'MIT OpenCourseWare',
}

const RECURSOS_PRUEBA = [
  { id: '1', titulo: 'Introducción a React', autores: 'Dan Abramov', formato: 'Video', disponibilidad: 'activo' },
  { id: '2', titulo: 'Patrones de diseño en Java', autores: 'Gamma et al.', formato: 'PDF', disponibilidad: 'activo' },
  { id: '3', titulo: 'Clean Code', autores: 'Robert C. Martin', formato: 'Paper', disponibilidad: 'obsoleto' },
  { id: '4', titulo: 'UML para principiantes', autores: 'Martin Fowler', formato: 'Infografía', disponibilidad: 'bloqueado' },
  { id: '5', titulo: 'Metodologías ágiles', autores: 'Ken Schwaber', formato: 'PDF', disponibilidad: 'retirado' },
]

export default function RepositorioDetallePage() {
  const params = useParams()
  const nombreRepo = REPOSITORIOS[params.id as string] ?? `Repositorio ${params.id}`

  const [busqueda, setBusqueda] = useState('')
  const [recursos, setRecursos] = useState(RECURSOS_PRUEBA)

  const recursosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return recursos
    const t = busqueda.toLowerCase()
    return recursos.filter(
      (r) =>
        r.titulo.toLowerCase().includes(t) ||
        r.autores.toLowerCase().includes(t) ||
        r.id.toLowerCase().includes(t)
    )
  }, [busqueda, recursos])

  function actualizarDisponibilidad(id: string, nuevoEstado: string) {
    setRecursos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, disponibilidad: nuevoEstado } : r))
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
        {nombreRepo}
      </h1>

      {/* Buscador */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-6">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar recurso por ID o por título"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <TablaRecursosRepositorio
        recursos={recursosFiltrados}
        onActualizarDisponibilidad={actualizarDisponibilidad}
      />
    </div>
  )
}