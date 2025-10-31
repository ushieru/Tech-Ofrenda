import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event'
import { EventStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = eventQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: 'Parámetros de consulta inválidos', details: validatedQuery.error.issues },
        { status: 400 }
      )
    }

    const { userGroupId, category, status, city, page = 1, limit = 10 } = validatedQuery.data
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (userGroupId) where.userGroupId = userGroupId
    if (category) where.category = category
    if (status) where.status = status
    if (city) {
      where.userGroup = {
        city: {
          contains: city,
          mode: 'insensitive'
        }
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          userGroup: {
            include: {
              leader: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          attendees: {
            select: { id: true, checkedIn: true }
          },
          speakers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          sponsors: true,
          contributions: {
            where: { confirmed: true },
            select: { type: true, amount: true, description: true, donorName: true }
          },
          _count: {
            select: {
              attendees: true,
              speakers: true,
              sponsors: true,
              contributions: true
            }
          }
        },
        orderBy: { date: 'asc' },
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ])

    // Calculate funding totals for each event
    const eventsWithFunding = events.map(event => ({
      ...event,
      totalFunding: event.contributions.reduce((sum, contribution) => {
        return sum + (contribution.amount || 0)
      }, 0),
      attendeeCount: event._count.attendees,
      checkedInCount: event.attendees.filter(a => a.checkedIn).length
    }))

    return NextResponse.json({
      events: eventsWithFunding,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createEventSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { title, description, date, location, capacity, category, userGroupId } = validatedData.data

    // Verify user is the leader of the user group
    const userGroup = await prisma.userGroup.findUnique({
      where: { id: userGroupId },
      include: { leader: true }
    })

    if (!userGroup) {
      return NextResponse.json(
        { error: 'Grupo de usuarios no encontrado' },
        { status: 404 }
      )
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear eventos en este grupo' },
        { status: 403 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity,
        category,
        userGroupId,
        status: EventStatus.DRAFT
      },
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

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}