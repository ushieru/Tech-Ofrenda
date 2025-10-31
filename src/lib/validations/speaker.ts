import { z } from 'zod'

export const speakerInvitationSchema = z.object({
  eventId: z.string().cuid('Invalid event ID'),
  userId: z.string().cuid('Invalid user ID'),
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic must be less than 200 characters').optional(),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional()
})

export const speakerApplicationSchema = z.object({
  eventId: z.string().cuid('Invalid event ID'),
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic must be less than 200 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters')
})

export const updateSpeakerSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic must be less than 200 characters').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters').optional(),
  confirmed: z.boolean().optional()
})

export const speakerQuerySchema = z.object({
  eventId: z.string().cuid().optional(),
  status: z.enum(['pending', 'confirmed', 'all']).optional(),
  userGroupId: z.string().cuid().optional()
})

export type SpeakerInvitation = z.infer<typeof speakerInvitationSchema>
export type SpeakerApplication = z.infer<typeof speakerApplicationSchema>
export type UpdateSpeaker = z.infer<typeof updateSpeakerSchema>
export type SpeakerQuery = z.infer<typeof speakerQuerySchema>