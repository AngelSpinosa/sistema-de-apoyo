import { z } from 'zod'

export const curacionSchema = z.object({
  objetivo_aprendizaje: z
    .string()
    .min(10, 'El objetivo debe tener al menos 10 caracteres'),
  nivel_dificultad: z.enum(['básico', 'intermedio', 'avanzado']),
  notas_uso: z.string().min(5, 'Agrega notas de uso pedagógico'),
  tiempo_estimado_uso: z.string().min(1, 'Indica el tiempo estimado'),
  perfil_estudiante_sugerido: z.string().optional(),
})

export type CuracionFormData = z.infer<typeof curacionSchema>