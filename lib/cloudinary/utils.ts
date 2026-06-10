/**
 * Transforma una URL original de Cloudinary (Video o PDF) en una URL de imagen (Thumbnail).
 * * @param url La URL segura (secure_url) proveniente de tu BD.
 * @param formato 'pdf' | 'video' | 'imagen'
 * @returns URL de la imagen generada por Cloudinary.
 */
export function generarMiniaturaCloudinary(url: string | undefined, formato: string = 'pdf'): string | undefined {
  if (!url || !url.includes('cloudinary.com')) return url;

  const f = formato.toLowerCase();

  try {
    // 1. MINIATURAS PARA PDF
    // Cambiamos /upload/ por transformaciones: recortar, escalar, y tomar la página 1 (pg_1)
    // Luego reemplazamos el .pdf del final por .jpg
    if (f === 'pdf' || url.toLowerCase().endsWith('.pdf')) {
      return url
        .replace('/upload/', '/upload/c_fill,w_600,h_400,pg_1/')
        .replace(/\.pdf$/i, '.jpg');
    }

    // 2. MINIATURAS PARA VIDEO
    // Transformación so_0 (start_offset_0) extrae el primer frame del video
    if (f === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(url)) {
      return url
        .replace('/upload/', '/upload/c_fill,w_600,h_400,so_0/')
        .replace(/\.[^/.]+$/, '.jpg'); // reemplaza cualquier extensión final por .jpg
    }

    // Si ya es imagen, podemos simplemente optimizarla
    if (f === 'imagen') {
      return url.replace('/upload/', '/upload/c_fill,w_600,h_400,q_auto,f_auto/');
    }

    return url;
  } catch (error) {
    console.error('Error generando miniatura:', error);
    return url;
  }
}