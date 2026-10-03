import { SupabaseClient } from '@supabase/supabase-js'

export type Privacidad = 'privada' | 'publica'

export type Coleccion = {
  id:            string
  nombre:        string
  privacidad:    Privacidad
  descripcion?:  string
  fotografia?:   string
  totalRecursos?: number
}

export type DatosColeccion = {
  nombre:      string
  privacidad:  Privacidad
  descripcion?: string
  /** Archivo nuevo a subir; si se omite, no se toca la foto existente */
  fotografia?: File
}

// ── Lectura ───────────────────────────────────────────────────────────────────

/**
 * Lista las colecciones del usuario autenticado, con el total de recursos
 * de cada una.
 */
export async function listarMisColecciones(
  supabase: SupabaseClient
): Promise<{ colecciones: Coleccion[]; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { colecciones: [], error: 'Usuario no autenticado' }

  const { data, error } = await supabase
    .from('coleccion')
    .select(`
      id_coleccion,
      nombre,
      privacidad,
      descripcion,
      fecha_creacion,
      url_fotografia,
      coleccion_recurso (id_recurso)
    `)
    .eq('id_usuario', user.id)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error al listar colecciones:', error)
    return { colecciones: [], error: error.message }
  }

  const colecciones: Coleccion[] = (data ?? []).map((c: any) => ({
    id:            c.id_coleccion,
    nombre:        c.nombre,
    privacidad:    c.privacidad === true ? 'privada' : 'publica',
    descripcion:   c.descripcion ?? '',
    fotografia:    c.url_fotografia ?? undefined,
    totalRecursos: c.coleccion_recurso?.length ?? 0,
  }))

  return { colecciones, error: null }
}

// ── Escritura ─────────────────────────────────────────────────────────────────

/**
 * Sube la fotografía de una colección y devuelve su URL pública.
 * No es una llamada a Supabase: usa el endpoint propio de subida (Cloudinary).
 */
async function subirFotoColeccion(archivo: File, idColeccion: string): Promise<string> {
  const formData = new FormData()
  formData.append('file',     archivo)
  formData.append('folder',   'colecciones')
  formData.append('publicId', idColeccion)

  const res = await fetch('/api/imagenes/subir', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Error al subir imagen de colección')
  const json = await res.json()
  return json.url as string
}

/**
 * Crea una colección nueva. Si se pasa `fotografia`, se sube después del
 * INSERT (porque la subida usa el id generado) y la colección queda creada
 * aunque la foto falle.
 */
export async function crearColeccion(
  supabase: SupabaseClient,
  datos: DatosColeccion
): Promise<{ id: string | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { id: null, error: 'Usuario no autenticado' }

  const { data: nueva, error } = await supabase
    .from('coleccion')
    .insert({
      id_usuario:  user.id,
      nombre:      datos.nombre,
      privacidad:  datos.privacidad === 'privada',
      descripcion: datos.descripcion,
    })
    .select('id_coleccion')
    .single()

  if (error || !nueva) {
    console.error('Error creando colección:', error)
    return { id: null, error: error?.message ?? 'No se pudo crear la colección' }
  }

  if (datos.fotografia) {
    try {
      const url = await subirFotoColeccion(datos.fotografia, nueva.id_coleccion)
      await supabase
        .from('coleccion')
        .update({ url_fotografia: url })
        .eq('id_coleccion', nueva.id_coleccion)
    } catch (e) {
      console.error('Error subiendo foto:', e)
      // La colección ya se creó; la foto falló y no bloqueamos al usuario.
    }
  }

  return { id: nueva.id_coleccion, error: null }
}

/**
 * Edita una colección existente. Si se pasa `fotografia`, se sube y se
 * reemplaza `url_fotografia`; si no, la foto actual se conserva.
 */
export async function editarColeccion(
  supabase: SupabaseClient,
  idColeccion: string,
  datos: DatosColeccion
): Promise<{ error: string | null }> {
  let url_fotografia: string | undefined = undefined

  if (datos.fotografia) {
    try {
      url_fotografia = await subirFotoColeccion(datos.fotografia, idColeccion)
    } catch (e) {
      console.error('Error subiendo foto:', e)
    }
  }

  const { error } = await supabase
    .from('coleccion')
    .update({
      nombre:      datos.nombre,
      privacidad:  datos.privacidad === 'privada',
      descripcion: datos.descripcion,
      ...(url_fotografia ? { url_fotografia } : {}),
    })
    .eq('id_coleccion', idColeccion)

  if (error) {
    console.error('Error editando colección:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * Elimina una colección. El borrado de coleccion_recurso y
 * coleccion_compartida queda a cargo de los ON DELETE CASCADE en la BD.
 */
export async function eliminarColeccion(
  supabase: SupabaseClient,
  idColeccion: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('coleccion')
    .delete()
    .eq('id_coleccion', idColeccion)

  if (error) {
    console.error('Error eliminando colección:', error)
    return { error: error.message }
  }

  return { error: null }
}

// ── Compartir ─────────────────────────────────────────────────────────────────

/**
 * Obtiene el token de enlace público de una colección, creándolo si todavía
 * no existe. Solo funciona si la colección es pública y pertenece al usuario
 * autenticado (lo exige la política RLS de coleccion_compartida).
 */
export async function obtenerOCrearTokenColeccion(
  supabase: SupabaseClient,
  idColeccion: string
): Promise<{ token: string | null; error: string | null }> {
  const { data: existente, error: errorBusqueda } = await supabase
    .from('coleccion_compartida')
    .select('token')
    .eq('id_coleccion', idColeccion)
    .maybeSingle()

  if (errorBusqueda) {
    console.error('Error buscando token existente:', errorBusqueda)
    return { token: null, error: errorBusqueda.message }
  }

  if (existente) return { token: existente.token, error: null }

  const { data: nuevo, error: errorInsert } = await supabase
    .from('coleccion_compartida')
    .insert({ id_coleccion: idColeccion })
    .select('token')
    .single()

  if (errorInsert || !nuevo) {
    console.error('Error creando token:', errorInsert)
    return { token: null, error: errorInsert?.message ?? 'No se pudo generar el enlace' }
  }

  return { token: nuevo.token, error: null }
}