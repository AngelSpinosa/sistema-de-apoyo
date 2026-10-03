import { FileText, Video } from 'lucide-react'

type Props = {
  /** Valor del formato/tag del recurso: "pdf" | "video" (u otro texto) */
  formato?: string
  /** URL del archivo; se usa solo como respaldo si formato viene vacío */
  url?: string
  className?: string
}

type Config = { etiqueta: string; icono: React.ReactNode; estilo: string }

function resolverFormato(formato?: string, url?: string): Config | null {
  const f = (formato ?? '').trim().toLowerCase()
  const u = (url ?? '').toLowerCase()

  const esVideo = f === 'video' || (!f && /\.(mp4|webm|ogg|mov)(\?|$)/.test(u))
  const esPdf   = f === 'pdf'   || (!f && /\.pdf(\?|$)/.test(u))

  if (esVideo) {
    return {
      etiqueta: 'Video',
      icono: <Video size={12} />,
      estilo: 'bg-blue-50/95 text-[#003087]',
    }
  }
  if (esPdf) {
    return {
      etiqueta: 'PDF',
      icono: <FileText size={12} />,
      estilo: 'bg-red-50/95 text-red-700',
    }
  }
  // Formato desconocido pero con texto: se muestra tal cual, en estilo neutro
  if (f) {
    return {
      etiqueta: f.charAt(0).toUpperCase() + f.slice(1),
      icono: <FileText size={12} />,
      estilo: 'bg-gray-100/95 text-gray-700',
    }
  }
  return null
}

/**
 * Etiqueta con el tipo de formato del recurso.
 * Debe colocarse dentro de un contenedor con `relative` (la miniatura de la tarjeta).
 */
export default function BadgeFormato({ formato, url, className = '' }: Props) {
  const cfg = resolverFormato(formato, url)
  if (!cfg) return null

  return (
    <span
      className={`absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold shadow-sm ${cfg.estilo} ${className}`}
    >
      {cfg.icono}
      {cfg.etiqueta}
    </span>
  )
}