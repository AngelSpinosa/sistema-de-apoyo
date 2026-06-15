// app/admin/repositorios/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getRecursosPorRepositorio, getRepositorioById } from '@/lib/api/recursos'
import RepositorioDetalleClient from './repositorio-detalle-client'

interface Props {
  params: Promise<{ id: string }>
}

interface RecursoBruto {
  autor: string | null
  formato: string | null
}

export default async function RepositorioDetallePage({ params }: Props) {
  const { id } = await params

  const repositorio = await getRepositorioById(id).catch(() => null)

  if (!repositorio) notFound()

  const recursosRaw = await getRecursosPorRepositorio(id)

  const recursos = recursosRaw.map((r) => {
    const bruto = Array.isArray(r.recurso_bruto)
      ? (r.recurso_bruto[0] as RecursoBruto | undefined)
      : (r.recurso_bruto as RecursoBruto | null)

    return {
      id: r.id_recurso,
      titulo: r.titulo,
      autores: bruto?.autor ?? 'Autor desconocido',
      formato: bruto?.formato ?? '—',
      disponibilidad: r.disponibilidad,
    }
  })

  return (
    <RepositorioDetalleClient
      nombreRepo={repositorio.nombre_fuente}
      recursosIniciales={recursos}
    />
  )
} 