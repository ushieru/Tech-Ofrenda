import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { speakerInvitationSchema, speakerApplicationSchema } from '@/lib/validations/speaker'
import { z } from 'zod'

/**
 * GET /api/speakers - Get speakers for events (filtered by user group if community leader)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status') // 'pending', 'confirmed', 'all'

    // Get user to check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ledUserGroup: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = {}

    // If eventId is provided, filter by event
    if (eventId) {
      // Verify user has access to this event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { userGroup: true }
      })

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      // Check if user is community leader of the event's user group
      if (user.role === 'COMMUNITY_LEADER' && user.ledUserGroup?.id !== event.userGroupId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      whereClause.eventId = eventId
    } else if (user.role === 'COMMUNITY_LEADER' && user.ledUserGroup) {
      // Community leaders can only see speakers from their user group events
      whereClause.event = {
        userGroupId: user.ledUserGroup.id
      }
    }

    // Filter by confirmation status
    if (status === 'pending') {
      whereClause.confirmed = false
    } else if (status === 'confirmed') {
      whereClause.confirmed = true
    }

    const speakers = await prisma.speaker.findMany({
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
            date: true,
            userGroup: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: [
        { confirmed: 'asc' }, // Pending first
        { invitedAt: 'desc' }
      ]
    })

    return NextResponse.json({ speakers })
  } catch (error) {
    console.error('Error fetching speakers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/speakers - Invite speaker or apply as speaker
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'invite' or 'apply'

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ledUserGroup: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'invite') {
      // Community leader inviting a speaker
      if (user.role !== 'COMMUNITY_LEADER') {
        return NextResponse.json({ error: 'Only community leaders can invite speakers' }, { status: 403 })
      }

      const validatedData = speakerInvitationSchema.parse(body)
      const { eventId, userId, topic, bio } = validatedData

      // Verify the event belongs to the community leader's user group
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { userGroup: true }
      })

      if (!event || event.userGroupId !== user.ledUserGroup?.id) {
        return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })
      }

      // Check if speaker is already invited/confirmed for this event
      const existingSpeaker = await prisma.speaker.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        }
      })

      if (existingSpeaker) {
        return NextResponse.json({ error: 'Speaker already invited to this event' }, { status: 400 })
      }

      // Create speaker invitation
      const speaker = await prisma.speaker.create({
        data: {
          userId,
          eventId,
          topic,
          bio,
          confirmed: false
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              userGroup: {
                select: {
                  name: true,
                  city: true
                }
              }
            }
          }
        }
      })

      // Send invitation email (we'll implement this)
      try {
        await sendSpeakerInvitationEmail({
          speakerName: speaker.user.name || 'Speaker',
          speakerEmail: speaker.user.email,
          eventTitle: speaker.event.title,
          eventDate: speaker.event.date.toISOString(),
          userGroupName: speaker.event.userGroup.name,
          city: speaker.event.userGroup.city,
          topic: topic || 'To be determined',
          invitationId: speaker.id
        })
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({ speaker }, { status: 201 })

    } else if (action === 'apply') {
      // User applying to be a speaker
      const validatedData = speakerApplicationSchema.parse(body)
      const { eventId, topic, bio } = validatedData

      // Verify the event exists and is published
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { userGroup: { include: { leader: true } } }
      })

      if (!event || event.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Event not found or not available for applications' }, { status: 404 })
      }

      // Check if user is already a speaker for this event
      const existingSpeaker = await prisma.speaker.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId
          }
        }
      })

      if (existingSpeaker) {
        return NextResponse.json({ error: 'You have already applied to speak at this event' }, { status: 400 })
      }

      // Create speaker application
      const speaker = await prisma.speaker.create({
        data: {
          userId: session.user.id,
          eventId,
          topic,
          bio,
          confirmed: false // Pending approval
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              userGroup: {
                select: {
                  name: true,
                  city: true,
                  leader: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Notify community leader about the application
      try {
        await sendSpeakerApplicationNotificationEmail({
          leaderName: speaker.event.userGroup.leader.name || 'Community Leader',
          leaderEmail: speaker.event.userGroup.leader.email,
          applicantName: speaker.user.name || 'Applicant',
          eventTitle: speaker.event.title,
          topic: topic,
          bio: bio,
          applicationId: speaker.id
        })
      } catch (emailError) {
        console.error('Failed to send application notification email:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({ speaker }, { status: 201 })

    } else {
      return NextResponse.json({ error: 'Invalid action. Use ?action=invite or ?action=apply' }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in speakers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Import email functions
import { 
  sendSpeakerInvitationEmail, 
  sendSpeakerApplicationNotificationEmail 
} from '@/lib/services/email'