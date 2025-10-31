import { z } from 'zod'
import { EventCategory, EventStatus } from '@prisma/client'

export const createEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string().refine((date) => {
    const eventDate = new Date(date)
    const now = new Date()
    return eventDate > now
  }, 'La fecha del evento debe ser futura'),
  location: z.string().min(1, 'La ubicación es requerida').max(500, 'La ubicación no puede exceder 500 caracteres'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1').max(10000, 'La capacidad no puede exceder 10,000'),
  category: z.nativeEnum(EventCategory, {
    message: 'Categoría de evento inválida'
  }),
  userGroupId: z.string().cuid('ID de grupo de usuario inválido')
})

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().cuid('ID de evento inválido'),
  status: z.nativeEnum(EventStatus).optional()
})

export const eventQuerySchema = z.object({
  userGroupId: z.string().cuid().optional(),
  category: z.nativeEnum(EventCategory).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  city: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional()
})

export type CreateEventData = z.infer<typeof createEventSchema>
export type UpdateEventData = z.infer<typeof updateEventSchema>
export type EventQueryParams = z.infer<typeof eventQuerySchema>