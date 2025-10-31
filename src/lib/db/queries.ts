import { prisma } from './prisma'
import { 
  UserRole, 
  EventStatus, 
  ContributionType
} from '@prisma/client'
import type {
  UserWithUserGroup,
  UserGroupWithLeader,
  EventWithDetails,
  EventStats,
  UserGroupStats
} from '@/types/database'

// User queries
export async function getUserById(id: string): Promise<UserWithUserGroup | null> {
  return prisma.user.findUnique({
    where: { id },
    include: {
      userGroup: true,
      ledUserGroup: true,
    },
  })
}

export async function getUserByEmail(email: string): Promise<UserWithUserGroup | null> {
  return prisma.user.findUnique({
    where: { email },
    include: {
      userGroup: true,
      ledUserGroup: true,
    },
  })
}

// UserGroup queries
export async function getUserGroupById(id: string): Promise<UserGroupWithLeader | null> {
  return prisma.userGroup.findUnique({
    where: { id },
    include: {
      leader: true,
      members: true,
      events: {
        orderBy: { date: 'desc' },
      },
    },
  })
}

export async function getUserGroupByCity(city: string): Promise<UserGroupWithLeader | null> {
  return prisma.userGroup.findUnique({
    where: { city },
    include: {
      leader: true,
      members: true,
      events: {
        orderBy: { date: 'desc' },
      },
    },
  })
}

export async function getAllUserGroups(): Promise<UserGroupWithLeader[]> {
  return prisma.userGroup.findMany({
    include: {
      leader: true,
      members: true,
      events: {
        where: { status: EventStatus.PUBLISHED },
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { city: 'asc' },
  })
}

// Event queries
export async function getEventById(id: string): Promise<EventWithDetails | null> {
  return prisma.event.findUnique({
    where: { id },
    include: {
      userGroup: {
        include: {
          leader: true
        }
      },
      attendees: {
        include: { user: true },
      },
      speakers: {
        include: { user: true },
      },
      sponsors: true,
      collaborators: {
        include: { user: true },
      },
      contributions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  }) as Promise<EventWithDetails | null>
}

export async function getPublishedEvents(): Promise<EventWithDetails[]> {
  return prisma.event.findMany({
    where: { status: EventStatus.PUBLISHED },
    include: {
      userGroup: {
        include: {
          leader: true
        }
      },
      attendees: {
        include: { user: true },
      },
      speakers: {
        include: { user: true },
      },
      sponsors: true,
      collaborators: {
        include: { user: true },
      },
      contributions: {
        where: { confirmed: true },
      },
    },
    orderBy: { date: 'asc' },
  }) as Promise<EventWithDetails[]>
}

export async function getEventsByUserGroup(userGroupId: string): Promise<EventWithDetails[]> {
  return prisma.event.findMany({
    where: { userGroupId },
    include: {
      userGroup: {
        include: {
          leader: true
        }
      },
      attendees: {
        include: { user: true },
      },
      speakers: {
        include: { user: true },
      },
      sponsors: true,
      collaborators: {
        include: { user: true },
      },
      contributions: true,
    },
    orderBy: { date: 'desc' },
  }) as Promise<EventWithDetails[]>
}

// Attendee queries
export async function getAttendeeByQRCode(qrCode: string) {
  return prisma.attendee.findUnique({
    where: { qrCode },
    include: {
      user: true,
      event: {
        include: { userGroup: true },
      },
    },
  })
}

export async function checkInAttendee(qrCode: string) {
  return prisma.attendee.update({
    where: { qrCode },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
    include: {
      user: true,
      event: true,
    },
  })
}

// Statistics queries
export async function getEventStats(): Promise<EventStats> {
  const [totalEvents, publishedEvents, totalAttendees, totalContributions, fundingResult] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),
    prisma.attendee.count(),
    prisma.contribution.count({ where: { confirmed: true } }),
    prisma.contribution.aggregate({
      where: { 
        confirmed: true,
        type: ContributionType.MONETARY,
      },
      _sum: { amount: true },
    }),
  ])

  return {
    totalEvents,
    publishedEvents,
    totalAttendees,
    totalContributions,
    totalFunding: fundingResult._sum.amount || 0,
  }
}

export async function getUserGroupStats(userGroupId: string): Promise<UserGroupStats> {
  const [totalMembers, totalEvents, upcomingEvents, fundingResult] = await Promise.all([
    prisma.user.count({ where: { userGroupId } }),
    prisma.event.count({ where: { userGroupId } }),
    prisma.event.count({ 
      where: { 
        userGroupId,
        status: EventStatus.PUBLISHED,
        date: { gte: new Date() },
      } 
    }),
    prisma.contribution.aggregate({
      where: { 
        confirmed: true,
        type: ContributionType.MONETARY,
        event: { userGroupId },
      },
      _sum: { amount: true },
    }),
  ])

  return {
    totalMembers,
    totalEvents,
    totalFunding: fundingResult._sum.amount || 0,
    upcomingEvents,
  }
}

// Utility functions
export async function generateUniqueQRCode(): Promise<string> {
  let qrCode: string
  let exists = true

  do {
    qrCode = 'QR_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    const existingAttendee = await prisma.attendee.findUnique({
      where: { qrCode },
    })
    exists = !!existingAttendee
  } while (exists)

  return qrCode
}

export async function isCityAvailable(city: string, excludeId?: string): Promise<boolean> {
  const existingUserGroup = await prisma.userGroup.findUnique({
    where: { city },
  })

  if (!existingUserGroup) return true
  if (excludeId && existingUserGroup.id === excludeId) return true
  
  return false
}