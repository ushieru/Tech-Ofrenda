import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PageProps {
  params: Promise<{
    id: string
    eventId: string
  }>
}

export default async function EventDashboardPage({ params }: PageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Verify user is the leader of this user group
  const userGroup = await prisma.userGroup.findUnique({
    where: { id: resolvedParams.id },
    select: {
      leaderId: true,
      name: true,
      city: true
    }
  })

  if (!userGroup || userGroup.leaderId !== session.user.id) {
    redirect('/dashboard')
  }

  // Get event details with related data
  const event = await prisma.event.findUnique({
    where: { 
      id: resolvedParams.eventId,
      userGroupId: resolvedParams.id
    },
    include: {
      attendees: {
        select: {
          id: true,
          checkedIn: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      speakers: {
        select: {
          id: true,
          confirmed: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      collaborators: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      sponsors: {
        select: {
          id: true,
          name: true,
          level: true
        }
      },
      contributions: {
        select: {
          id: true,
          type: true,
          amount: true,
          confirmed: true
        }
      }
    }
  })

  if (!event) {
    redirect(`/dashboard/usergroup/${resolvedParams.id}`)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const attendeeStats = {
    total: event.attendees.length,
    checkedIn: event.attendees.filter(a => a.checkedIn).length,
    capacity: event.capacity
  }

  const speakerStats = {
    total: event.speakers.length,
    confirmed: event.speakers.filter(s => s.confirmed).length
  }

  const totalFunding = event.contributions
    .filter(c => c.confirmed && c.amount)
    .reduce((sum, c) => sum + (c.amount || 0), 0)

  const inKindContributions = event.contributions.filter(c => c.type === 'IN_KIND').length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600">
              {formatDate(event.date)} • {event.location}
            </p>
            <p className="text-gray-600">
              Comunidad: <span className="font-semibold">{userGroup.name} - {userGroup.city}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
            <Badge variant="outline">
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Link href={`/events/${event.id}`}>
            <Button variant="outline">
              Ver Altar Digital
            </Button>
          </Link>
          <Link href={`/dashboard/usergroup/${resolvedParams.id}/events`}>
            <Button variant="outline">
              Volver a Eventos
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {attendeeStats.total}
            </div>
            <div className="text-sm text-gray-600">
              Registrados de {attendeeStats.capacity}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {attendeeStats.checkedIn} confirmados
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {speakerStats.total}
            </div>
            <div className="text-sm text-gray-600">
              Speakers
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {speakerStats.confirmed} confirmados
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${totalFunding.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Fondos recaudados
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {inKindContributions} contribuciones en especie
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {event.collaborators.length}
            </div>
            <div className="text-sm text-gray-600">
              Colaboradores
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {event.sponsors.length} sponsors
            </div>
          </div>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendees & Check-in */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Asistentes</h2>
            <Link href={`/dashboard/usergroup/${resolvedParams.id}/events/${resolvedParams.eventId}/checkin`}>
              <Button size="sm">
                Gestionar Check-in
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {event.attendees.slice(0, 5).map((attendee) => (
              <div key={attendee.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">
                  {attendee.user.name || attendee.user.email}
                </span>
                <Badge variant={attendee.checkedIn ? 'default' : 'secondary'} className="text-xs">
                  {attendee.checkedIn ? 'Confirmado' : 'Pendiente'}
                </Badge>
              </div>
            ))}
            {event.attendees.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                y {event.attendees.length - 5} más...
              </p>
            )}
          </div>
        </Card>

        {/* Speakers */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Speakers</h2>
            <Link href={`/dashboard/usergroup/${resolvedParams.id}`}>
              <Button size="sm">
                Gestionar Speakers
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {event.speakers.slice(0, 5).map((speaker) => (
              <div key={speaker.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">
                  {speaker.user.name || speaker.user.email}
                </span>
                <Badge variant={speaker.confirmed ? 'default' : 'secondary'} className="text-xs">
                  {speaker.confirmed ? 'Confirmado' : 'Pendiente'}
                </Badge>
              </div>
            ))}
            {event.speakers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay speakers asignados
              </p>
            )}
          </div>
        </Card>

        {/* Collaborators */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Colaboradores</h2>
            <Link href={`/dashboard/usergroup/${resolvedParams.id}/events/${resolvedParams.eventId}/collaborators`}>
              <Button size="sm">
                Gestionar Colaboradores
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {event.collaborators.slice(0, 5).map((collaborator) => (
              <div key={collaborator.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">
                  {collaborator.user.name || collaborator.user.email}
                </span>
                <Badge variant="outline" className="text-xs">
                  {collaborator.role}
                </Badge>
              </div>
            ))}
            {event.collaborators.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay colaboradores asignados
              </p>
            )}
          </div>
        </Card>

        {/* Sponsors */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sponsors</h2>
            <Link href={`/dashboard/usergroup/${resolvedParams.id}/events/${resolvedParams.eventId}/sponsors`}>
              <Button size="sm">
                Gestionar Sponsors
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {event.sponsors.slice(0, 5).map((sponsor) => (
              <div key={sponsor.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">
                  {sponsor.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {sponsor.level}
                </Badge>
              </div>
            ))}
            {event.sponsors.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay sponsors registrados
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}