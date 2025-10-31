import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { EventStatus } from '@prisma/client'

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

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'publish' or 'unpublish'

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Use "publish" o "unpublish"' },
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
        { error: 'No tienes permisos para modificar este evento' },
        { status: 403 }
      )
    }

    const newStatus = action === 'publish' ? EventStatus.PUBLISHED : EventStatus.DRAFT

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: newStatus },
      include: {
        userGroup: {
          include: {
            leader: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: `Evento ${action === 'publish' ? 'publicado' : 'despublicado'} exitosamente`,
      event: updatedEvent
    })
  } catch (error) {
    console.error('Error publishing/unpublishing event:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}