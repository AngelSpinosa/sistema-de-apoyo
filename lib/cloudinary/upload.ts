type ResultadoUpload = {
  url: string
  formato: string
  nombre: string
}

export async function subirRecurso(
  archivo: File,
  carpeta: 'videos' | 'pdfs' | 'imagenes' | 'infografias'
): Promise<ResultadoUpload> {
  const formData = new FormData()
  formData.append('file', archivo)
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  )
  formData.append('folder', `rea/${carpeta}`)

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!respuesta.ok) {
    throw new Error('Error al subir el archivo a Cloudinary')
  }

  const datos = await respuesta.json()

  return {
    url: datos.secure_url,
    formato: datos.resource_type === 'video' ? 'video' : datos.format,
    nombre: datos.original_filename,
  }
}