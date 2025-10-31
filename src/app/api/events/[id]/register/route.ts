import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { registerAttendeeSchema } from '@/lib/validations/attendee'
import { generateQRTicket } from '@/lib/services/qr'
import { sendAttendeeConfirmationEmail } from '@/lib/services/email'
import { generateGoogleCalendarUrl, createCalendarEventData } from '@/lib/services/calendar'
import { EventStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    // Validate request data
    const validatedData = registerAttendeeSchema.safeParse({ ...body, eventId })
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { name, email, addToCalendar } = validatedData.data

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        userGroup: {
          include: {
            leader: {
              select: { name: true, email: true }
            }
          }
        },
        _count: {
          select: { attendees: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (event.status !== EventStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'El evento no está disponible para registro' },
        { status: 400 }
      )
    }

    // Check if event is in the future
    if (new Date(event.date) <= new Date()) {
      return NextResponse.json(
        { error: 'No se puede registrar a eventos pasados' },
        { status: 400 }
      )
    }

    // Check capacity
    if (event._count.attendees >= event.capacity) {
      return NextResponse.json(
        { error: 'El evento ha alcanzado su capacidad máxima' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create new user as ATTENDEE
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'ATTENDEE'
        }
      })
    }

    // Check if user is already registered for this event
    const existingAttendee = await prisma.attendee.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId
        }
      }
    })

    if (existingAttendee) {
      return NextResponse.json(
        { error: 'Ya estás registrado para este evento' },
        { status: 400 }
      )
    }

    // Create attendee record first to get the ID
    const attendee = await prisma.attendee.create({
      data: {
        userId: user.id,
        eventId: eventId,
        qrCode: 'temp' // Temporary value, will be updated
      }
    })

    try {
      // Generate QR code
      const { qrCode, qrDataUrl } = await generateQRTicket(attendee.id, eventId)

      // Update attendee with actual QR code
      await prisma.attendee.update({
        where: { id: attendee.id },
        data: { qrCode }
      })

      // Generate Google Calendar URL if requested
      let calendarUrl: string | undefined
      if (addToCalendar) {
        const calendarEventData = createCalendarEventData(event)
        calendarUrl = generateGoogleCalendarUrl(calendarEventData)
      }

      // Send confirmation email
      await sendAttendeeConfirmationEmail({
        attendeeName: name,
        attendeeEmail: email,
        eventTitle: event.title,
        eventDate: event.date.toISOString(),
        eventLocation: event.location,
        eventDescription: event.description,
        qrDataUrl,
        calendarUrl
      })

      // Return success response
      return NextResponse.json({
        message: 'Registro exitoso',
        attendee: {
          id: attendee.id,
          qrCode,
          calendarUrl
        },
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location
        }
      }, { status: 201 })

    } catch (error) {
      // If QR generation or email sending fails, clean up the attendee record
      await prisma.attendee.delete({
        where: { id: attendee.id }
      })
      throw error
    }

  } catch (error) {
    console.error('Error registering attendee:', error)
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

    // Check if event exists and user has permission to view attendees
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

    // Only event organizer (community leader) can view attendee list
    if (event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver la lista de asistentes' },
        { status: 403 }
      )
    }

    // Get attendees list
    const attendees = await prisma.attendee.findMany({
      where: { eventId },
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
      orderBy: { createdAt: 'desc' }
    })

    const attendeesWithStats = attendees.map(attendee => ({
      id: attendee.id,
      user: attendee.user,
      checkedIn: attendee.checkedIn,
      checkedInAt: attendee.checkedInAt,
      registeredAt: attendee.createdAt
    }))

    return NextResponse.json({
      attendees: attendeesWithStats,
      stats: {
        total: attendees.length,
        checkedIn: attendees.filter(a => a.checkedIn).length,
        capacity: event.capacity,
        availableSpots: event.capacity - attendees.length
      }
    })

  } catch (error) {
    console.error('Error fetching attendees:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}