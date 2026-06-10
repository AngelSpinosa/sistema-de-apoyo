import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Falta la URL del recurso', { status: 400 });
  }

  // 1. Validar que la URL sea completa (evita el "Error interno" por mala escritura)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return new NextResponse('La URL proporcionada no es válida. Debe incluir https://...', { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    // 2. Si Cloudinary responde con error (como el 401), se lo pasamos directo a la pantalla
    // para saber exactamente por qué falló.
    if (!res.ok) {
      return new NextResponse(
        `Error del servidor de origen (Cloudinary): HTTP ${res.status} - ${res.statusText}`, 
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', 
        'Cache-Control': 'public, max-age=86400', 
        'Content-Length': buffer.byteLength.toString(), 
      },
    });
  } catch (error: any) {
    // 3. Mostramos el error real en pantalla si el servidor falla
    console.error('Error en el proxy del PDF:', error);
    return new NextResponse(`Error interno del proxy: ${error.message}`, { status: 500 });
  }
}