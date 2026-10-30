import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'El nombre del servicio debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  durationMinutes: z.number().int().min(5, 'La duración mínima es de 5 minutos').max(480, 'La duración máxima es de 480 minutos'),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, 'El nombre del servicio debe tener al menos 2 caracteres').optional(),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').optional(),
  durationMinutes: z.number().int().min(5, 'La duración mínima es de 5 minutos').max(480, 'La duración máxima es de 480 minutos').optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
