import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const createSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
  userGroupId: z.string(),
  eventId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const userGroupId = searchParams.get('userGroupId')

    let whereClause: any = {}
    
    if (eventId) {
      whereClause.eventId = eventId
    }
    
    if (userGroupId) {
      whereClause.userGroupId = userGroupId
    }

    const sponsors = await prisma.sponsor.findMany({
      where: whereClause,
      include: {
        userGroup: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: [
        { level: 'desc' }, // PLATINUM first, then GOLD, SILVER, BRONZE
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSponsorSchema.parse(body)

    // Verify the user has permission to add sponsors to this user group
    const userGroup = await prisma.userGroup.findUnique({
      where: { id: validatedData.userGroupId },
      select: {
        leaderId: true
      }
    })

    if (!userGroup) {
      return NextResponse.json({ error: 'User group not found' }, { status: 404 })
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If eventId is provided, verify the event belongs to the user group
    if (validatedData.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: validatedData.eventId },
        select: {
          userGroupId: true
        }
      })

      if (!event || event.userGroupId !== validatedData.userGroupId) {
        return NextResponse.json({ error: 'Event not found or does not belong to user group' }, { status: 400 })
      }
    }

    const sponsor = await prisma.sponsor.create({
      data: validatedData,
      include: {
        userGroup: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      }
    })

    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating sponsor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}