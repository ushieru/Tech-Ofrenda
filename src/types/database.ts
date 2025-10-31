import { 
  User, 
  UserGroup, 
  Event, 
  Attendee, 
  Speaker, 
  Sponsor, 
  Collaborator, 
  Contribution,
  UserRole,
  EventCategory,
  EventStatus,
  SponsorLevel,
  CollaboratorRole,
  ContributionType
} from '@prisma/client'

// Export Prisma types
export type {
  User,
  UserGroup,
  Event,
  Attendee,
  Speaker,
  Sponsor,
  Collaborator,
  Contribution,
  UserRole,
  EventCategory,
  EventStatus,
  SponsorLevel,
  CollaboratorRole,
  ContributionType
}

// Extended types with relations
export type UserWithUserGroup = User & {
  userGroup: UserGroup | null
  ledUserGroup: UserGroup | null
}

export type UserGroupWithLeader = UserGroup & {
  leader: User
  members: User[]
  events: Event[]
}

export type EventWithDetails = Event & {
  userGroup: UserGroup & {
    leader: User
  }
  attendees: Attendee[]
  speakers: (Speaker & { user: User })[]
  sponsors: Sponsor[]
  collaborators: (Collaborator & { user: User })[]
  contributions: Contribution[]
  totalFunding?: number
  attendeeCount?: number
  checkedInCount?: number
  availableSpots?: number
}

export type AttendeeWithUser = Attendee & {
  user: User
  event: Event
}

export type SpeakerWithUser = Speaker & {
  user: User
  event: Event
}

export type CollaboratorWithUser = Collaborator & {
  user: User
  event: Event
  userGroup: UserGroup
}

// Form types for creating/updating entities
export type CreateUserGroupData = {
  name: string
  city: string
  leaderId: string
}

export type CreateEventData = {
  title: string
  description: string
  date: Date
  location: string
  capacity: number
  category: EventCategory
  userGroupId: string
}

export type CreateAttendeeData = {
  userId: string
  eventId: string
}

export type CreateSpeakerData = {
  userId: string
  eventId: string
  topic?: string
  bio?: string
}

export type CreateContributionData = {
  eventId: string
  type: ContributionType
  amount?: number
  description?: string
  donorName: string
  donorEmail?: string
}

// Statistics types
export type EventStats = {
  totalEvents: number
  publishedEvents: number
  totalAttendees: number
  totalContributions: number
  totalFunding: number
}

export type UserGroupStats = {
  totalMembers: number
  totalEvents: number
  totalFunding: number
  upcomingEvents: number
}