// app/admin/repositorios/[id]/repositorio-detalle-client.tsx
'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import TablaRecursosRepositorio from '@/components/admin/tabla-recursos-repositorio'

interface RecursoFila {
  id: string
  titulo: string
  autores: string
  formato: string
  disponibilidad: string
}

interface Props {
  nombreRepo: string
  recursosIniciales: RecursoFila[]
}

export default function RepositorioDetalleClient({ nombreRepo, recursosIniciales }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [recursos, setRecursos] = useState<RecursoFila[]>(recursosIniciales)

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