'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from('usuario')
      .select('rol')
      .eq('id_usuario', data.user.id)
      .single()

    console.log('ID del usuario:', data.user.id)
    console.log('Perfil obtenido:', perfil)
    console.log('Error del perfil:', errorPerfil)

    const rutas: Record<string, string> = {
      docente: '/dashboard',
      estudiante: '/dashboard',
      administrador: '/admin/dashboard',
    }

    router.push(rutas[perfil?.rol ?? 'estudiante'])
  }

  return (
    <div className="flex h-screen w-full">

      {/* Panel izquierdo — imagen */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">
        <img
          src="../fei2.jpg"
          alt="Imagen de bienvenida"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center bg-uv-azul px-10">

        {/* Logo DUNA */}
        <img
          src="/logo-login.png"
          alt="DUNA - Sistema de apoyo"
          className="w-80 h-auto mb-2"
        />

        <div className="flex flex-col w-full max-w-sm gap-5">

          {/* Campo correo */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm">
              Nombre de usuario
            </label>
            <input
              type="email"
              placeholder="Ingresa tu nombre de usuario/Correo I."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-full px-4 py-2 text-sm outline-none text-gray-800 placeholder-gray-400 border border-gray-300 transition focus:border-uv-verde focus:ring-2 focus:ring-uv-verde"
            />
          </div>

          {/* Campo contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-sm">Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="rounded-full px-4 py-2 text-sm outline-none text-gray-800 placeholder-gray-400 border border-gray-300 transition focus:border-uv-verde focus:ring-2 focus:ring-uv-verde"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          {/* Botón */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-uv-verde text-white font-semibold px-10 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'INGRESAR'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}