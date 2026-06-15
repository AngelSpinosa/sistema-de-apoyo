import { Link2, ToggleLeft, ToggleRight } from 'lucide-react'

type Props = {
  nombre: string
  endpoint: string
  activo: boolean
  onToggle: () => void
  onClick?: () => void
}

export default function TarjetaRepositorio({
  nombre,
  endpoint,
  activo,
  onToggle,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3 transition group relative ${
        onClick
          ? 'cursor-pointer hover:shadow-md'
          : 'cursor-default opacity-70'
      }`}
    >
      {/* Toggle de estado */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="absolute top-3 right-3 text-gray-400 hover:text-[#003087] transition"
        title={activo ? 'Deshabilitar' : 'Habilitar'}
      >
        {activo ? (
          <ToggleRight size={20} className="text-[#003087]" />
        ) : (
          <ToggleLeft size={20} className="text-gray-300" />
        )}
      </button>

      {/* Ícono */}
      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-50 transition">
        <Link2 size={32} className="text-gray-800 group-hover:text-[#003087] transition" />
      </div>

      {/* Nombre */}
      <span className="text-sm font-semibold text-gray-800 text-center">
        {nombre}
      </span>

      {/* Indicador de estado */}
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          activo
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  )
}