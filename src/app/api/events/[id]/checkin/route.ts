import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { checkInSchema } from '@/lib/validations/attendee'
import { parseQRCode, validateQRCodeFormat } from '@/lib/services/qr'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = checkInSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { qrCode } = validatedData.data

    // Validate QR code format
    if (!validateQRCodeFormat(qrCode)) {
      return NextResponse.json(
        { error: 'Formato de código QR inválido' },
        { status: 400 }
      )
    }

    // Parse QR code to get attendee and event IDs
    const qrData = parseQRCode(qrCode)
    if (!qrData) {
      return NextResponse.json(
        { error: 'Código QR inválido' },
        { status: 400 }
      )
    }

    // Verify that the QR code is for the correct event
    if (qrData.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Este código QR no corresponde a este evento' },
        { status: 400 }
      )
    }

    // Check if event exists and user has permission to check-in attendees
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        userGroup: {
          include: { leader: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Only event organizer (community leader) or collaborators can perform check-ins
    const isAuthorized = event.userGroup.leaderId === session.user.id ||
      await prisma.collaborator.findFirst({
        where: {
          userId: session.user.id,
          eventId: eventId
        }
      })

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar check-in en este evento' },
        { status: 403 }
      )
    }

    // Find the attendee by QR code
    const attendee = await prisma.attendee.findUnique({
      where: { qrCode },
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
            location: true
          }
        }
      }
    })

    if (!attendee) {
      return NextResponse.json(
        { error: 'Código QR no válido o asistente no encontrado' },
        { status: 404 }
      )
    }

    // Verify the attendee belongs to the correct event
    if (attendee.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Este código QR no corresponde a este evento' },
        { status: 400 }
      )
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      return NextResponse.json({
        message: 'Asistente ya registrado',
        attendee: {
          id: attendee.id,
          user: attendee.user,
          checkedIn: true,
          checkedInAt: attendee.checkedInAt,
          alreadyCheckedIn: true
        },
        event: attendee.event
      })
    }

    // Perform check-in
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendee.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date()
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
            location: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Check-in exitoso',
      attendee: {
        id: updatedAttendee.id,
        user: updatedAttendee.user,
        checkedIn: updatedAttendee.checkedIn,
        checkedInAt: updatedAttendee.checkedInAt,
        alreadyCheckedIn: false
      },
      event: updatedAttendee.event
    })

  } catch (error) {
    console.error('Error during check-in:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params

    // Check if event exists and user has permission to view check-in stats
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        userGroup: {
          include: { leader: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Only event organizer (community leader) or collaborators can view check-in stats
    const isAuthorized = event.userGroup.leaderId === session.user.id ||
      await prisma.collaborator.findFirst({
        where: {
          userId: session.user.id,
          eventId: eventId
        }
      })

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las estadísticas de check-in' },
        { status: 403 }
      )
    }

    // Get check-in statistics
    const [totalAttendees, checkedInAttendees, recentCheckIns] = await Promise.all([
      prisma.attendee.count({
        where: { eventId }
      }),
      prisma.attendee.count({
        where: { eventId, checkedIn: true }
      }),
      prisma.attendee.findMany({
        where: { eventId, checkedIn: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { checkedInAt: 'desc' },
        take: 10
      })
    ])

    return NextResponse.json({
      stats: {
        totalRegistered: totalAttendees,
        checkedIn: checkedInAttendees,
        checkInRate: totalAttendees > 0 ? Math.round((checkedInAttendees / totalAttendees) * 100) : 0,
        capacity: event.capacity,
        availableSpots: event.capacity - totalAttendees
      },
      recentCheckIns: recentCheckIns.map(attendee => ({
        id: attendee.id,
        user: attendee.user,
        checkedInAt: attendee.checkedInAt
      })),
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location
      }
    })

  } catch (error) {
    console.error('Error fetching check-in stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}