// --- Enums ---
export type RolUsuario = 'docente' | 'estudiante' | 'administrador'
export type DisponibilidadRecurso = 'activo' | 'bloqueado' | 'obsoleto' | 'retirado'
export type EstadoValidacion = 'sin_aval' | 'avalado'
export type EstadoSello = 'pendiente' | 'aprobado' | 'rechazado'

// --- Entidades base ---
export interface Usuario {
  id_usuario: string
  nombre: string
  apellidos: string
  correo_institucional: string
  rol: RolUsuario
  fecha_registro: string
}

export interface Estudiante extends Usuario {
  matricula: string
}

export interface Docente extends Usuario {
  num_personal: string
  es_miembro_academia: boolean
}

export interface Administrador extends Usuario {
  area_adscripcion: string
}

// --- Recursos ---
export interface Recurso {
  id_recurso: string
  titulo: string
  disponibilidad: DisponibilidadRecurso
  estado_validacion: EstadoValidacion
  promedio_calificacion: number | null
}

export interface RecursoBruto {
  id_recurso: string        // FK → recurso
  id_repositorio: string    // FK → repositorio_externo
  id_original: string
  autor: string
  url_fuente: string
  formato: string
  fecha_publicacion: string
}

export interface RepositorioExterno {
  id_repositorio: string
  nombre_fuente: string
  endpoint_api: string
  api_key: string
  estado_activo: boolean
}

// --- Curación ---
export interface RecursoCurado {
  id_curacion: string
  id_recurso: string        // FK → recurso
  id_docente: string        // FK → usuario (docente)
}

export interface MetadatoPedagogico {
  id_metadato: string
  id_curacion: string       // FK → recurso_curado
  objetivo_aprendizaje: string
  nivel_dificultad: string
  notas_uso: string
  tiempo_estimado_uso: string
  perfil_estudiante_sugerido: string
}

// --- Colecciones ---
export interface Coleccion {
  id_coleccion: string
  id_usuario: string        // FK → usuario
  nombre: string
  privacidad: boolean
  descripcion: string
  fecha_creacion: string
}

export interface ColeccionRecurso {
  id_coleccion: string      // FK → coleccion
  id_recurso: string        // FK → recurso
  fecha_agregado: string
}

// --- Calificación y validación ---
export interface Calificacion {
  id_calificacion: string
  id_usuario: string        // FK → usuario
  id_recurso: string        // FK → recurso
  puntuacion: number        // 1-5
  comentario: string
  fecha: string
}

export interface SelloValidacion {
  id_validacion: string
  id_recurso: string        // FK → recurso
  id_docente: string        // FK → usuario (docente miembro academia)
  estado: EstadoSello
  fecha_resolucion: string
}