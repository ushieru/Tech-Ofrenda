import { z } from 'zod'

export const collaboratorRoles = [
  'ORGANIZER',
  'VOLUNTEER', 
  'TECHNICAL_SUPPORT',
  'MARKETING'
] as const

export const collaboratorSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  eventId: z.string().min(1, 'Event is required'),
  role: z.enum(collaboratorRoles, {
    message: 'Role is required'
  })
})

export const updateCollaboratorSchema = z.object({
  role: z.enum(collaboratorRoles, {
    message: 'Role is required'
  }).optional()
})

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>
export type UpdateCollaboratorFormData = z.infer<typeof updateCollaboratorSchema>

export const collaboratorRoleLabels = {
  ORGANIZER: 'Organizador',
  VOLUNTEER: 'Voluntario',
  TECHNICAL_SUPPORT: 'Soporte Técnico',
  MARKETING: 'Marketing'
} as const