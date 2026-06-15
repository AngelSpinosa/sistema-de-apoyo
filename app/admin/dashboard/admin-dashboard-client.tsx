// app/admin/dashboard/admin-dashboard-client.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TarjetaRepositorio from '@/components/admin/tarjeta-repositorio'

interface RepositorioDB {
  id_repositorio: string
  nombre_fuente: string
  endpoint_api: string
  estado_activo: boolean
}

interface Props {
  repositoriosDB: RepositorioDB[]
}

export default function AdminDashboardClient({ repositoriosDB }: Props) {
  const router = useRouter()

  const [reposDB, setReposDB] = useState(repositoriosDB)

  function toggleDB(id: string) {
    setReposDB((prev) =>
      prev.map((r) => (r.id_repositorio === id ? { ...r, estado_activo: !r.estado_activo } : r))
    )
  }

  const activos = reposDB.filter((r) => r.estado_activo).length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
        Repositorios conectados
      </h1>
      <p className="text-sm text-gray-400 text-center mb-8">
        {activos} de {reposDB.length} repositorios activos
      </p>

      <div className="grid grid-cols-3 gap-6">
        {reposDB.map((repo) => (
          <TarjetaRepositorio
            key={repo.id_repositorio}
            nombre={repo.nombre_fuente}
            endpoint={repo.endpoint_api}
            activo={repo.estado_activo}
            onToggle={() => toggleDB(repo.id_repositorio)}
            onClick={() => router.push(`/admin/repositorios/${repo.id_repositorio}`)}
          />
        ))}
      </div>
    </div>
  )
}