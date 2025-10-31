import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { updateEventSchema } from '@/lib/validations/event'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        userGroup: {
          include: {
            leader: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        speakers: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        sponsors: true,
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        contributions: {
          where: { confirmed: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            attendees: true,
            speakers: true,
            sponsors: true,
            contributions: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Calculate funding totals
    const totalFunding = event.contributions.reduce((sum, contribution) => {
      return sum + (contribution.amount || 0)
    }, 0)

    const checkedInCount = event.attendees.filter(a => a.checkedIn).length

    const eventWithStats = {
      ...event,
      totalFunding,
      attendeeCount: event._count.attendees,
      checkedInCount,
      availableSpots: event.capacity - event._count.attendees
    }

    return NextResponse.json(eventWithStats)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    const validatedData = updateEventSchema.safeParse({ ...body, id })
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        userGroup: {
          include: { leader: true }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (existingEvent.userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este evento' },
        { status: 403 }
      )
    }

    const { id: _, userGroupId, ...updateData } = validatedData.data

    // Convert date string to Date object if provided
    const processedData = {
      ...updateData,
      ...(updateData.date && { date: new Date(updateData.date) })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: processedData,
      include: {
        userGroup: {
          include: {
            leader: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            attendees: true,
            speakers: true,
            sponsors: true,
            contributions: true
          }
        }
      }
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        userGroup: {
          include: { leader: true }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (existingEvent.userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este evento' },
        { status: 403 }
      )
    }

    // Delete the event (cascade will handle related records)
    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Evento eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}