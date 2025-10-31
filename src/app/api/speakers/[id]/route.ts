import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { updateSpeakerSchema } from '@/lib/validations/speaker'
import { z } from 'zod'

/**
 * GET /api/speakers/[id] - Get specific speaker details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: speakerId } = await params

    const speaker = await prisma.speaker.findUnique({
      where: { id: speakerId },
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
            description: true,
            date: true,
            location: true,
            userGroup: {
              select: {
                id: true,
                name: true,
                city: true,
                leaderId: true
              }
            }
          }
        }
      }
    })

    if (!speaker) {
      return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
    }

    // Check permissions - user can see their own speaker records or community leader can see their events
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ledUserGroup: true }
    })

    const canAccess = 
      speaker.userId === session.user.id || // User's own speaker record
      (user?.role === 'COMMUNITY_LEADER' && user.ledUserGroup?.id === speaker.event.userGroup.id) // Community leader's event

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ speaker })
  } catch (error) {
    console.error('Error fetching speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/speakers/[id] - Update speaker (confirm/reject invitation, update details)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: speakerId } = await params
    const body = await request.json()
    const validatedData = updateSpeakerSchema.parse(body)

    // Get the speaker record
    const existingSpeaker = await prisma.speaker.findUnique({
      where: { id: speakerId },
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
                id: true,
                name: true,
                city: true,
                leaderId: true,
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

    if (!existingSpeaker) {
      return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ledUserGroup: true }
    })

    const isOwnRecord = existingSpeaker.userId === session.user.id
    const isCommunityLeader = user?.role === 'COMMUNITY_LEADER' && user.ledUserGroup?.id === existingSpeaker.event.userGroup.id

    if (!isOwnRecord && !isCommunityLeader) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.topic !== undefined) {
      updateData.topic = validatedData.topic
    }
    
    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio
    }

    // Handle confirmation logic
    if (validatedData.confirmed !== undefined) {
      updateData.confirmed = validatedData.confirmed
      
      if (validatedData.confirmed) {
        updateData.confirmedAt = new Date()
      } else {
        updateData.confirmedAt = null
      }
    }

    // Update the speaker record
    const updatedSpeaker = await prisma.speaker.update({
      where: { id: speakerId },
      data: updateData,
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
      }
    })

    // Send notification emails based on the action
    try {
      if (validatedData.confirmed === true && isOwnRecord) {
        // Speaker accepted invitation - notify community leader
        await sendSpeakerAcceptanceNotificationEmail({
          leaderName: existingSpeaker.event.userGroup.leader.name || 'Community Leader',
          leaderEmail: existingSpeaker.event.userGroup.leader.email,
          speakerName: existingSpeaker.user.name || 'Speaker',
          eventTitle: existingSpeaker.event.title,
          topic: updatedSpeaker.topic || 'To be determined'
        })
      } else if (validatedData.confirmed === false && isOwnRecord) {
        // Speaker declined invitation - notify community leader
        await sendSpeakerDeclineNotificationEmail({
          leaderName: existingSpeaker.event.userGroup.leader.name || 'Community Leader',
          leaderEmail: existingSpeaker.event.userGroup.leader.email,
          speakerName: existingSpeaker.user.name || 'Speaker',
          eventTitle: existingSpeaker.event.title
        })
      } else if (validatedData.confirmed === true && isCommunityLeader) {
        // Community leader approved speaker application
        await sendSpeakerApprovalEmail({
          speakerName: existingSpeaker.user.name || 'Speaker',
          speakerEmail: existingSpeaker.user.email,
          eventTitle: existingSpeaker.event.title,
          eventDate: existingSpeaker.event.date.toISOString(),
          userGroupName: existingSpeaker.event.userGroup.name,
          city: existingSpeaker.event.userGroup.city,
          topic: updatedSpeaker.topic || 'To be determined'
        })
      } else if (validatedData.confirmed === false && isCommunityLeader) {
        // Community leader rejected speaker application
        await sendSpeakerRejectionEmail({
          speakerName: existingSpeaker.user.name || 'Speaker',
          speakerEmail: existingSpeaker.user.email,
          eventTitle: existingSpeaker.event.title,
          userGroupName: existingSpeaker.event.userGroup.name
        })
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ speaker: updatedSpeaker })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/speakers/[id] - Remove speaker invitation/application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: speakerId } = await params

    // Get the speaker record
    const speaker = await prisma.speaker.findUnique({
      where: { id: speakerId },
      include: {
        event: {
          select: {
            userGroup: {
              select: {
                leaderId: true
              }
            }
          }
        }
      }
    })

    if (!speaker) {
      return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
    }

    // Check permissions - only the speaker themselves or community leader can delete
    const canDelete = 
      speaker.userId === session.user.id || 
      speaker.event.userGroup.leaderId === session.user.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the speaker record
    await prisma.speaker.delete({
      where: { id: speakerId }
    })

    return NextResponse.json({ message: 'Speaker removed successfully' })
  } catch (error) {
    console.error('Error deleting speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Import email functions
import { 
  sendSpeakerAcceptanceNotificationEmail,
  sendSpeakerDeclineNotificationEmail,
  sendSpeakerApprovalEmail,
  sendSpeakerRejectionEmail
} from '@/lib/services/email'