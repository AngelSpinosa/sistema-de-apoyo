'use client'

type Props = {
  temas: string[]
  temaActivo?: string
  onSeleccionar?: (tema: string) => void
}

export default function ChipsTemas({ temas, temaActivo, onSeleccionar }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {temas.map((tema) => (
        <button
          key={tema}
          onClick={() => onSeleccionar?.(tema)}
          className={`
            px-4 py-1 rounded-full text-sm border transition
            ${
              temaActivo === tema
                ? 'bg-[#003087] text-white border-[#003087]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#003087] hover:text-[#003087]'
            }
          `}
        >
          {tema}
        </button>
      ))}
    </div>
  )
}