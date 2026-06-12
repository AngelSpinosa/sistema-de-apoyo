'use client'

// 1. Añadimos el rol y los atributos opcionales a las props
type Props = {
  nombre: string
  apellidos: string
  correo: string
  rol: string
  carrera?: string
  semestre?: string
  academias?: string[]
}

export default function TarjetaInfoPerfil({ nombre, apellidos, correo, rol, carrera, semestre, academias }: Props) {
  return (
    <div className="w-full rounded-2xl border-2 border-[#003087] p-6 flex flex-col gap-4">
      <Campo label="Nombre" valor={nombre} />
      <Campo label="Apellidos" valor={apellidos} />
      <Campo label="Correo institucional" valor={correo} />
      
      {/* 2. Renderizado condicional para el estudiante */}
      {rol === 'estudiante' && (
        <>
          <Campo label="Carrera" valor={carrera || 'No registrada'} />
          <Campo label="Semestre" valor={semestre ? `${semestre}° Semestre` : 'No registrado'} />
        </>
      )}

      {/* 3. Renderizado condicional para el docente */}
      {rol === 'docente' && (
        <Campo 
          label="Academias a las que pertenece" 
          valor={academias && academias.length > 0 ? academias.join(', ') : 'Ninguna registrada'} 
        />
      )}

      <CampoContrasena />
    </div>
  )
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800">{valor || '—'}</p>
    </div>
  )
}

function CampoContrasena() {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-400 font-medium">Contraseña</p>
      <p className="text-sm text-gray-800 tracking-widest">••••••••</p>
    </div>
  )
}