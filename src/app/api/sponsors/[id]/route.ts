import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const updateSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  eventId: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: resolvedParams.id },
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

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
    }

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Error fetching sponsor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSponsorSchema.parse(body)

    const resolvedParams = await params
    // Get the sponsor to verify permissions
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userGroup: {
          select: {
            leaderId: true
          }
        }
      }
    })

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
    }

    if (sponsor.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If eventId is being updated, verify the event belongs to the user group
    if (validatedData.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: validatedData.eventId },
        select: {
          userGroupId: true
        }
      })

      if (!event || event.userGroupId !== sponsor.userGroupId) {
        return NextResponse.json({ error: 'Event not found or does not belong to user group' }, { status: 400 })
      }
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { id: resolvedParams.id },
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

    return NextResponse.json(updatedSponsor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating sponsor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    // Get the sponsor to verify permissions
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userGroup: {
          select: {
            leaderId: true
          }
        }
      }
    })

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
    }

    if (sponsor.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.sponsor.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Sponsor removed successfully' })
  } catch (error) {
    console.error('Error deleting sponsor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}