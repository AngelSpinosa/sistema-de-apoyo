'use client'

type Props = {
  nombre: string
  apellidos: string
  correo: string
}

export default function TarjetaInfoPerfil({ nombre, apellidos, correo }: Props) {
  return (
    <div className="w-full rounded-2xl border-2 border-[#003087] p-6 flex flex-col gap-4">
      <Campo label="Nombre" valor={nombre} />
      <Campo label="Apellidos" valor={apellidos} />
      <Campo label="Correo institucional" valor={correo} />
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