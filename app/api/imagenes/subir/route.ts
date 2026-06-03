import cloudinary from '@/lib/cloudinary/client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData  = await req.formData()
    const archivo   = formData.get('file')    as File   | null
    const publicId  = formData.get('publicId') as string | null
    const folder    = formData.get('folder')   as string | null

    if (!archivo || !publicId || !folder) {
      return NextResponse.json({ error: 'Faltan parámetros: file, publicId, folder' }, { status: 400 })
    }

    const arrayBuffer = await archivo.arrayBuffer()
    const base64      = Buffer.from(arrayBuffer).toString('base64')
    const dataUri     = `data:${archivo.type};base64,${base64}`

    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id:     publicId,
      overwrite:     true,
      resource_type: 'image',
    })

    return NextResponse.json({ url: resultado.secure_url })
  } catch (error) {
    console.error('→ ERROR Cloudinary:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}