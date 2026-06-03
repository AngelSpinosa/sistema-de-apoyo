'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/sidebar'
import TarjetaInfoPerfil from '@/components/perfil/tarjeta-info-perfil'
import FormularioEditarPerfil from '@/components/perfil/formulario-editar-perfil'
import FormularioCambiarContrasena from '@/components/perfil/formulario-cambiar-contrasena'

type DatosPerfil = {
  nombre: string
  apellidos: string
  correo: string
  rol: string
  fotoUrl?: string
}

type DatosEditables = {
  nombre: string
  apellidos: string
  correo: string
  fotoUrl?: string
  foto?: File
}

type Props = {
  datosIniciales: DatosPerfil
  userId: string
}

const ETIQUETAS_ROL: Record<string, string> = {
  docente: 'Docente',
  estudiante: 'Estudiante',
  administrador: 'Administrador',
}

export default function PaginaPerfil({ datosIniciales, userId }: Props) {
  const [datos, setDatos]                 = useState<DatosPerfil>(datosIniciales)
  const [modalEditar, setModalEditar]     = useState(false)
  const [modalContrasena, setModalContrasena] = useState(false)
  const supabase = createClient()

  // pagina-perfil.tsx  — solo cambia handleGuardarPerfil

    const handleGuardarPerfil = async (nuevos: DatosEditables) => {
    // 1. Subir foto a tu API Route (que firma y sube a Cloudinary)
    let fotoUrl = datos.fotoUrl
    if (nuevos.foto) {
      const formData = new FormData()
      formData.append('file',     nuevos.foto)
      formData.append('folder',   'usuarios/perfiles')
      formData.append('publicId', userId)

      const res = await fetch('/api/imagenes/subir', {   // ← nueva ruta unificada
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        console.error('Error al subir la foto')
        return
      }

      const json = await res.json()
      fotoUrl = json.url
    }

    // 2. Actualizar tabla usuario
    await supabase.from('usuario').update({
      nombre:                nuevos.nombre,
      apellidos:             nuevos.apellidos,
      correo_institucional:  nuevos.correo,
      url_fotografia:        fotoUrl,
    }).eq('id_usuario', userId)

    // 3. Actualizar correo en auth si cambió
    if (nuevos.correo !== datos.correo) {
      await supabase.auth.updateUser({ email: nuevos.correo })
    }

    setDatos({ ...datos, ...nuevos, fotoUrl })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 pl-14">
        <div className="max-w-md mx-auto py-16 px-6 flex flex-col items-center gap-6">

          {/* Modales */}
          {modalEditar && (
            <FormularioEditarPerfil
              datosIniciales={datos}
              onGuardar={handleGuardarPerfil}
              onCerrar={() => setModalEditar(false)}
            />
          )}
          {modalContrasena && (
            <FormularioCambiarContrasena onCerrar={() => setModalContrasena(false)} />
          )}

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-[#003087] flex items-center justify-center overflow-hidden">
            {datos.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={datos.fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {datos.nombre} {datos.apellidos}
          </h1>

          {/* Rol + botón editar */}
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-600 font-medium">
              {ETIQUETAS_ROL[datos.rol] ?? datos.rol}
            </span>
            <button
              type="button"
              onClick={() => setModalEditar(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#003087] text-white text-sm font-medium hover:bg-[#002070] transition"
            >
              Editar perfil
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          {/* Tarjeta de información */}
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm text-gray-500 font-medium text-center">Información personal</p>
            <TarjetaInfoPerfil
              nombre={datos.nombre}
              apellidos={datos.apellidos}
              correo={datos.correo}
            />
          </div>

          {/* Cambiar contraseña — enlace secundario */}
          <button
            type="button"
            onClick={() => setModalContrasena(true)}
            className="text-sm text-[#003087] underline underline-offset-2 hover:text-[#002070] transition"
          >
            Cambiar contraseña
          </button>

        </div>
      </main>
    </div>
  )
}