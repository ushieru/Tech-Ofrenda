import { z } from 'zod';

export const monetaryContributionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  amount: z.number().min(1, 'Amount must be at least $1').max(100000, 'Amount cannot exceed $100,000'),
  donorName: z.string().min(1, 'Donor name is required').max(100, 'Name is too long'),
  donorEmail: z.string().email('Invalid email format').optional(),
  message: z.string().max(500, 'Message is too long').optional(),
});

export const inKindContributionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  donorName: z.string().min(1, 'Donor name is required').max(100, 'Name is too long'),
  donorEmail: z.string().email('Invalid email format').optional(),
  estimatedValue: z.number().min(0, 'Estimated value cannot be negative').optional(),
});

export const contributionFilterSchema = z.object({
  eventId: z.string().optional(),
  userGroupId: z.string().optional(),
  type: z.enum(['MONETARY', 'IN_KIND']).optional(),
  confirmed: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type MonetaryContributionInput = z.infer<typeof monetaryContributionSchema>;
export type InKindContributionInput = z.infer<typeof inKindContributionSchema>;
export type ContributionFilter = z.infer<typeof contributionFilterSchema>;