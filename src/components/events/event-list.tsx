'use client'

import { useState, useEffect } from 'react'
import { Event, EventCategory, EventStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'

interface EventWithStats extends Event {
  userGroup: {
    id: string
    name: string
    city: string
    leader: {
      id: string
      name: string
      email: string
    }
  }
  totalFunding: number
  attendeeCount: number
  checkedInCount: number
  _count: {
    attendees: number
    speakers: number
    sponsors: number
    contributions: number
  }
}

interface EventListProps {
  userGroupId: string
  onEditEvent?: (event: Event) => void
  onCreateEvent?: () => void
}

export function EventList({ userGroupId, onEditEvent, onCreateEvent }: EventListProps) {
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [userGroupId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events?userGroupId=${userGroupId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar eventos')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (event: EventWithStats) => {
    try {
      const action = event.status === EventStatus.PUBLISHED ? 'unpublish' : 'publish'
      const response = await fetch(`/api/events/${event.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error('Error al cambiar estado del evento')
      }

      // Refresh events list
      fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar evento')
      }

      // Refresh events list
      fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getCategoryEmoji = (category: EventCategory) => {
    switch (category) {
      case EventCategory.MEETUP: return '🍂'
      case EventCategory.HACKATHON: return '💀'
      case EventCategory.CONFERENCE: return '🎭'
      default: return '🎃'
    }
  }

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED: return 'bg-green-100 text-green-800 border-green-200'
      case EventStatus.DRAFT: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case EventStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200'
      case EventStatus.COMPLETED: return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600">Cargando eventos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        {error}
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🎃 Mis Eventos
        </h2>
        {onCreateEvent && (
          <Button 
            onClick={onCreateEvent}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            ➕ Crear Evento
          </Button>
        )}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="border-orange-200">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay eventos aún
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primer evento para comenzar a construir tu comunidad tech
            </p>
            {onCreateEvent && (
              <Button 
                onClick={onCreateEvent}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                🎭 Crear Mi Primer Evento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`${getStatusColor(event.status)} px-2 py-1 text-xs font-medium`}>
                    {event.status}
                  </Badge>
                  <span className="text-2xl">{getCategoryEmoji(event.category)}</span>
                </div>
                <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                  {event.title}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  📅 {formatDate(event.date)}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-bold text-orange-600">{event.attendeeCount}</div>
                    <div className="text-gray-600">Registrados</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-600">${event.totalFunding}</div>
                    <div className="text-gray-600">Fondeo</div>
                  </div>
                </div>

                {/* Location */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  📍 {event.location}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditEvent?.(event)}
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    ✏️ Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handlePublishToggle(event)}
                    className={`flex-1 ${
                      event.status === EventStatus.PUBLISHED
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {event.status === EventStatus.PUBLISHED ? '📝 Borrador' : '🚀 Publicar'}
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/events/${event.id}`, '_blank')}
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    👁️ Ver Altar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}