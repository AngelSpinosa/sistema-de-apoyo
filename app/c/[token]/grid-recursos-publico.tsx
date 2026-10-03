'use client'

import TarjetaRecurso from '@/components/recursos/tarjeta-recurso'

type RecursoPublico = {
  id:          string
  titulo:      string
  fuente:      string
  descripcion: string
  promedio:    number
  urlFuente?:  string
  formato?:    string
}

export default function GridRecursosPublico({ recursos }: { recursos: RecursoPublico[] }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {recursos.map((r) => (
        <TarjetaRecurso
          key={r.id}
          idRecurso={r.id}
          titulo={r.titulo}
          fuente={r.fuente}
          descripcion={r.descripcion}
          promedio={r.promedio}
          urlFuente={r.urlFuente}
          formato={r.formato}
          // Sin sesión: el clic abre el archivo original, no /dashboard/recurso/[id]
          // (esa ruta exige login). Ajustar si se crea una vista pública de recurso individual.
          onClick={() => {
            if (r.urlFuente) window.open(r.urlFuente, '_blank')
          }}
        />
      ))}
    </div>
  )
}