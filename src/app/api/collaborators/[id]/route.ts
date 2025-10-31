import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const updateCollaboratorSchema = z.object({
  role: z.enum(['ORGANIZER', 'VOLUNTEER', 'TECHNICAL_SUPPORT', 'MARKETING']).optional()
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
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: resolvedParams.id },
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
        },
        userGroup: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      }
    })

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 })
    }

    return NextResponse.json(collaborator)
  } catch (error) {
    console.error('Error fetching collaborator:', error)
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
    const validatedData = updateCollaboratorSchema.parse(body)

    const resolvedParams = await params
    // Get the collaborator to verify permissions
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: resolvedParams.id },
      include: {
        event: {
          include: {
            userGroup: {
              select: {
                leaderId: true
              }
            }
          }
        }
      }
    })

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 })
    }

    if (collaborator.event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedCollaborator = await prisma.collaborator.update({
      where: { id: resolvedParams.id },
      data: validatedData,
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
      }
    })

    return NextResponse.json(updatedCollaborator)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating collaborator:', error)
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
    // Get the collaborator to verify permissions
    const collaborator = await prisma.collaborator.findUnique({
      where: { id: resolvedParams.id },
      include: {
        event: {
          include: {
            userGroup: {
              select: {
                leaderId: true
              }
            }
          }
        }
      }
    })

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 })
    }

    if (collaborator.event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.collaborator.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Collaborator removed successfully' })
  } catch (error) {
    console.error('Error deleting collaborator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}