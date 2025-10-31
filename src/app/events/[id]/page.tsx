import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { AltarDigital } from '@/components/events/altar-digital'
import { EventStatus } from '@prisma/client'

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

async function getEvent(id: string) {
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
    return null
  }

  // Calculate additional stats
  const totalFunding = event.contributions.reduce((sum, contribution) => {
    return sum + (contribution.amount || 0)
  }, 0)

  const checkedInCount = event.attendees.filter(a => a.checkedIn).length
  const availableSpots = event.capacity - event._count.attendees

  return {
    ...event,
    totalFunding,
    attendeeCount: event._count.attendees,
    checkedInCount,
    availableSpots
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params
  const event = await getEvent(id)
  
  if (!event) {
    return {
      title: 'Evento no encontrado - Tech-Ofrenda'
    }
  }

  const eventDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(event.date))

  return {
    title: `${event.title} - Tech-Ofrenda`,
    description: `Únete a ${event.title} el ${eventDate} en ${event.location}. Organizado por ${event.userGroup.name} en ${event.userGroup.city}.`,
    openGraph: {
      title: event.title,
      description: `Evento de ${event.category.toLowerCase()} en ${event.userGroup.city}`,
      type: 'website',
      locale: 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: `${event.category} en ${event.userGroup.city} - ${eventDate}`,
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  // Only show published events to public
  if (event.status !== EventStatus.PUBLISHED) {
    notFound()
  }

  return <AltarDigital event={event as any} />
}

export async function generateStaticParams() {
  // Generate static params for published events
  const events = await prisma.event.findMany({
    where: {
      status: EventStatus.PUBLISHED
    },
    select: {
      id: true
    }
  })

  return events.map((event) => ({
    id: event.id
  }))
}