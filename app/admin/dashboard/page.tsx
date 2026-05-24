'use client'

import { useState } from 'react'
import TarjetaRepositorio from '@/components/admin/tarjeta-repositorio'

const REPOSITORIOS_INICIALES = [
  { id: '1', nombre: 'MERLOT', endpoint: 'https://api.merlot.org/v1', activo: true },
  { id: '2', nombre: 'Biblioteca CIIES', endpoint: 'https://ciies.uv.mx/api', activo: true },
  { id: '3', nombre: 'Cloudinary REA', endpoint: 'https://api.cloudinary.com/v1_1', activo: true },
  { id: '4', nombre: 'OER Commons', endpoint: 'https://www.oercommons.org/api/v2', activo: false },
  { id: '5', nombre: 'Khan Academy', endpoint: 'https://api.khanacademy.org', activo: false },
  { id: '6', nombre: 'MIT OpenCourseWare', endpoint: 'https://ocw.mit.edu/api', activo: false },
]

export default function AdminDashboardPage() {
  const [repositorios, setRepositorios] = useState(REPOSITORIOS_INICIALES)

  function toggleRepositorio(id: string) {
    setRepositorios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, activo: !r.activo } : r))
    )
  }

  const activos = repositorios.filter((r) => r.activo).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
        Repositorios conectados
      </h1>
      <p className="text-sm text-gray-400 text-center mb-8">
        {activos} de {repositorios.length} repositorios activos
      </p>

      <div className="grid grid-cols-3 gap-6">
        {repositorios.map((repo) => (
          <TarjetaRepositorio
            key={repo.id}
            nombre={repo.nombre}
            endpoint={repo.endpoint}
            activo={repo.activo}
            onToggle={() => toggleRepositorio(repo.id)}
            onClick={() => console.log('Ver repositorio:', repo.nombre)}
          />
        ))}
      </div>
    </div>
  )
}