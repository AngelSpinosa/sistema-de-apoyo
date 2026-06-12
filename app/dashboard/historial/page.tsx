'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TarjetaRecursoBusqueda from '@/components/recursos/tarjeta-recurso-busqueda'
import { History, Trash2 } from 'lucide-react'

type VistaHistorial = {
  id_vista: string
  fecha_vista: string
  recurso: {
    id: string
    titulo: string
    promedio: number
    url: string
    tipo: string
    fuente: string
    descripcion: string
  }
}

export default function HistorialPage() {
  const [historial, setHistorial] = useState<VistaHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    cargarHistorial()
  }, [])

  async function cargarHistorial() {
    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('historial_vistas')
      .select(`
        id_vista,
        fecha_vista,
        recurso:id_recurso (
          id_recurso,
          titulo,
          promedio_calificacion,
          recurso_bruto (
            url_fuente,
            formato,
            autor,
            repositorio_externo (nombre_fuente)
          )
        )
      `)
      .eq('id_usuario', user.id)
      .order('fecha_vista', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error al cargar historial:', error)
      setCargando(false)
      return
    }

    // Mapear la respuesta compleja a nuestro tipo
    const mapeado: VistaHistorial[] = (data || []).map((item: any) => ({
      id_vista: item.id_vista,
      fecha_vista: item.fecha_vista,
      recurso: {
        id: item.recurso.id_recurso,
        titulo: item.recurso.titulo,
        promedio: item.recurso.promedio_calificacion || 0,
        url: item.recurso.recurso_bruto?.url_fuente || '',
        tipo: item.recurso.recurso_bruto?.formato || 'pdf',
        fuente: item.recurso.recurso_bruto?.repositorio_externo?.nombre_fuente || 'Desconocido',
        descripcion: item.recurso.recurso_bruto?.autor || '',
      }
    }))

    setHistorial(mapeado)
    setCargando(false)
  }

  const handleVerRecurso = (id: string) => {
    router.push(`/dashboard/recurso/${id}`)
  }

  const limpiarHistorial = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('historial_vistas').delete().eq('id_usuario', user.id)
    setHistorial([])
  }

  // Formatear la fecha para que sea legible (Ej: "Hoy a las 14:30" o "12 oct 2023")
  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString)
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha)
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-gray-400 text-sm">Cargando tu historial...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003087]/10 text-[#003087] rounded-full flex items-center justify-center">
            <History size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de visualizaciones</h1>
        </div>

        {historial.length > 0 && (
          <button
            onClick={limpiarHistorial}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={16} />
            Limpiar historial
          </button>
        )}
      </div>

      {historial.length > 0 ? (
        <div className="flex flex-col gap-4">
          {historial.map((item) => (
            <div key={item.id_vista} className="relative">
              <span className="absolute -left-2 top-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md transform -translate-x-full">
                {formatearFecha(item.fecha_vista)}
              </span>
              <TarjetaRecursoBusqueda
                idRecurso={item.recurso.id}
                titulo={item.recurso.titulo}
                fuente={item.recurso.fuente}
                tipo={item.recurso.tipo}
                descripcion={item.recurso.descripcion}
                promedio={item.recurso.promedio}
                urlFuente={item.recurso.url}
                formato={item.recurso.tipo}
                onClick={() => handleVerRecurso(item.recurso.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <History size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Aún no hay historial</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm">
            Los recursos que leas o los videos que veas aparecerán aquí para que puedas volver a ellos fácilmente.
          </p>
        </div>
      )}
    </div>
  )
}