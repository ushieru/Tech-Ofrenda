import { z } from 'zod'

export const registerAttendeeSchema = z.object({
  eventId: z.string().cuid('ID de evento inválido'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'El email no puede exceder 255 caracteres'),
  addToCalendar: z.boolean().optional()
})

export const checkInSchema = z.object({
  qrCode: z.string().min(1, 'Código QR requerido')
})

export type RegisterAttendeeInput = z.input<typeof registerAttendeeSchema>
export type RegisterAttendeeData = z.output<typeof registerAttendeeSchema>
export type CheckInData = z.infer<typeof checkInSchema>