'use client'

import { Search, SlidersHorizontal, History as HistoryIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onBuscar?: (termino: string) => void
  onFiltrar?: () => void
  valor?: string
  onChange?: (termino: string) => void
}

export default function Buscador({ onBuscar, onFiltrar, valor = '', onChange }: Props) {
  const [historial, setHistorial] = useState<string[]>([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const supabase = createClient()
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function cargarHistorial() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('historial_busqueda')
        .select('termino')
        .eq('id_usuario', user.id)
        .order('fecha_busqueda', { ascending: false })
        .limit(6) // Traemos 6 para asegurar tener al menos 4-5 únicos
      
      if (data) {
        const terminosUnicos = Array.from(new Set(data.map(d => d.termino))).slice(0, 5)
        setHistorial(terminosUnicos)
      }
    }
    cargarHistorial()
  }, [])

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setMostrarHistorial(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const guardarBusqueda = async (term: string) => {
    if (!term.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('historial_busqueda').insert({
        id_usuario: user.id,
        termino: term.trim()
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setMostrarHistorial(false)
      guardarBusqueda(valor)
      onBuscar?.(valor)
    }
  }

  const seleccionarHistorial = (term: string) => {
    onChange?.(term)
    setMostrarHistorial(false)
    guardarBusqueda(term)
    onBuscar?.(term)
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div ref={contenedorRef} className="relative flex-1">
        <div className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#003087]/20 focus-within:border-[#003087]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar recurso"
            value={valor}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setMostrarHistorial(true)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          />
          {valor && (
            <button
              onClick={() => onChange?.('')}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown de Historial */}
        {mostrarHistorial && historial.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-2">
            <ul>
              {historial.map((term, index) => (
                <li 
                  key={index}
                  onClick={() => seleccionarHistorial(term)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition"
                >
                  {/* Aquí cambiamos <History /> por <HistoryIcon /> */}
                  <HistoryIcon size={16} className="text-gray-400" />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={onFiltrar}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm hover:bg-gray-50 transition text-sm text-gray-600"
      >
        Filtros
        <SlidersHorizontal size={16} className="text-gray-500" />
      </button>
    </div>
  )
}