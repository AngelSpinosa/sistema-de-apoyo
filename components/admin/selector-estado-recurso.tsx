type Props = {
  valor: string
  onChange: (valor: string) => void
}

const ESTADOS = [
  { valor: 'activo', etiqueta: 'Activo', color: 'text-green-600' },
  { valor: 'bloqueado', etiqueta: 'Bloqueado', color: 'text-red-500' },
  { valor: 'obsoleto', etiqueta: 'Obsoleto', color: 'text-yellow-600' },
  { valor: 'retirado', etiqueta: 'Retirado', color: 'text-gray-400' },
]

export default function SelectorEstadoRecurso({ valor, onChange }: Props) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#003087] transition"
    >
      <option value="">Disponibilidad</option>
      {ESTADOS.map((e) => (
        <option key={e.valor} value={e.valor}>
          {e.etiqueta}
        </option>
      ))}
    </select>
  )
}