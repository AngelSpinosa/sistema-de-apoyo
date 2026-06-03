// --- Enums ---
export type RolUsuario = 'docente' | 'estudiante' | 'administrador'
export type DisponibilidadRecurso = 'activo' | 'bloqueado' | 'obsoleto' | 'retirado'
export type EstadoValidacion = 'sin_aval' | 'avalado'

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
  id_recurso:       string
  id_repositorio:   string
  id_original:      string
  autor:            string
  url_fuente:       string
  formato:          string
  fecha_publicacion: string
}

export interface RepositorioExterno {
  id_repositorio: string
  nombre_fuente:  string
  endpoint_api:   string
  api_key:        string
  estado_activo:  boolean
}

// --- Curación ---
export interface RecursoCurado {
  id_curacion: string
  id_recurso:  string
  id_docente:  string
}

export interface MetadatoPedagogico {
  id_metadato:               string
  id_curacion:               string
  objetivo_aprendizaje:      string
  nivel_dificultad:          string
  notas_uso:                 string
  tiempo_estimado_uso:       string
  perfil_estudiante_sugerido: string
}

// --- Colecciones ---
export interface Coleccion {
  id_coleccion:   string
  id_usuario:     string
  nombre:         string
  privacidad:     boolean
  descripcion:    string
  fecha_creacion: string
}

export interface ColeccionRecurso {
  id_coleccion:   string
  id_recurso:     string
  fecha_agregado: string
}

// --- Calificación ---
export interface Calificacion {
  id_calificacion: string
  id_usuario:      string
  id_recurso:      string
  puntuacion:      number
  comentario:      string
  fecha:           string
}

// --- Sello de academia ---
// La existencia de una fila indica que el recurso tiene sello.
// No hay estados intermedios: o tiene sello o no lo tiene.
export interface SelloValidacion {
  id_validacion:      string
  id_recurso:         string
  id_docente:         string
  fecha_otorgamiento: string
}