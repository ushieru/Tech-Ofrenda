import { z } from 'zod'

export const sponsorLevels = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM'
] as const

export const sponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  level: z.enum(sponsorLevels, {
    message: 'Sponsor level is required'
  }),
  userGroupId: z.string().min(1, 'User group is required'),
  eventId: z.string().optional()
})

export const updateSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  level: z.enum(sponsorLevels, {
    message: 'Sponsor level is required'
  }).optional(),
  eventId: z.string().optional()
})

export type SponsorFormData = z.infer<typeof sponsorSchema>
export type UpdateSponsorFormData = z.infer<typeof updateSponsorSchema>

export const sponsorLevelLabels = {
  BRONZE: 'Bronce',
  SILVER: 'Plata', 
  GOLD: 'Oro',
  PLATINUM: 'Platino'
} as const

export const sponsorLevelColors = {
  BRONZE: 'bg-amber-600',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-purple-600'
} as const