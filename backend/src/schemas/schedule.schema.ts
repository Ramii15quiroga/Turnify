import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Formato de hora de inicio inválido (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Formato de hora de fin inválido (HH:mm)'),
  slotDurationMinutes: z.number().int().min(5).max(240).default(30),
  isActive: z.boolean().default(true),
}).refine((data) => data.startTime < data.endTime, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime'],
});

export const updateSchedulesSchema = z.object({
  schedules: z.array(scheduleItemSchema).min(1, 'Debe especificar al menos una franja horaria'),
});

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1, 'El serviceId es requerido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
export type UpdateSchedulesInput = z.infer<typeof updateSchedulesSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;

