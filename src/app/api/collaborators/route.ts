import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { sendCollaboratorNotification } from '@/lib/services/notifications'
import { z } from 'zod'

const createCollaboratorSchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  role: z.enum(['ORGANIZER', 'VOLUNTEER', 'TECHNICAL_SUPPORT', 'MARKETING'])
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

    const collaborators = await prisma.collaborator.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(collaborators)
  } catch (error) {
    console.error('Error fetching collaborators:', error)
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
    const validatedData = createCollaboratorSchema.parse(body)

    // Verify the user has permission to add collaborators to this event
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      include: {
        userGroup: {
          select: {
            leaderId: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if collaborator already exists for this event
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        userId_eventId: {
          userId: validatedData.userId,
          eventId: validatedData.eventId
        }
      }
    })

    if (existingCollaborator) {
      return NextResponse.json(
        { error: 'User is already a collaborator for this event' },
        { status: 400 }
      )
    }

    const collaborator = await prisma.collaborator.create({
      data: {
        userId: validatedData.userId,
        eventId: validatedData.eventId,
        userGroupId: event.userGroupId,
        role: validatedData.role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            userGroup: {
              select: {
                leader: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Send notification to the collaborator
    try {
      await sendCollaboratorNotification({
        collaboratorName: collaborator.user.name || collaborator.user.email,
        collaboratorEmail: collaborator.user.email,
        eventTitle: collaborator.event.title,
        eventDate: collaborator.event.date,
        eventLocation: collaborator.event.location,
        role: collaborator.role,
        organizerName: collaborator.event.userGroup.leader.name || 'Organizador'
      })
    } catch (error) {
      console.error('Failed to send collaborator notification:', error)
      // Don't fail the request if notification fails
    }

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating collaborator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}