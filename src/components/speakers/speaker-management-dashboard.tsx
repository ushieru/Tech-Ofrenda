'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { SpeakerInvitationForm } from './speaker-invitation-form'

interface Speaker {
  id: string
  topic: string | null
  bio: string | null
  confirmed: boolean
  invitedAt: string
  confirmedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  event: {
    id: string
    title: string
    date: string
    userGroup: {
      id: string
      name: string
      city: string
    }
  }
}

interface SpeakerManagementDashboardProps {
  eventId?: string
  userGroupId?: string
}

export function SpeakerManagementDashboard({ eventId, userGroupId }: SpeakerManagementDashboardProps) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSpeakers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (eventId) params.append('eventId', eventId)
      if (filter !== 'all') params.append('status', filter)

      const response = await fetch(`/api/speakers?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch speakers')
      }

      const data = await response.json()
      setSpeakers(data.speakers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching speakers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSpeakers()
  }, [eventId, filter])

  const handleSpeakerAction = async (speakerId: string, action: 'approve' | 'reject') => {
    setActionLoading(speakerId)
    try {
      const response = await fetch(`/api/speakers/${speakerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmed: action === 'approve'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update speaker')
      }

      // Refresh the speakers list
      await fetchSpeakers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating speaker')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveSpeaker = async (speakerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este speaker?')) {
      return
    }

    setActionLoading(speakerId)
    try {
      const response = await fetch(`/api/speakers/${speakerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove speaker')
      }

      // Refresh the speakers list
      await fetchSpeakers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing speaker')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (speaker: Speaker) => {
    if (speaker.confirmed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">✅ Confirmado</Badge>
    } else {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ Pendiente</Badge>
    }
  }

  const filteredSpeakers = speakers.filter(speaker => {
    if (filter === 'pending') return !speaker.confirmed
    if (filter === 'confirmed') return speaker.confirmed
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600">Cargando speakers...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          🎤 Gestión de Speakers
        </h2>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {showInviteForm ? 'Cancelar' : '➕ Invitar Speaker'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {showInviteForm && eventId && (
        <SpeakerInvitationForm
          eventId={eventId}
          onSuccess={() => {
            setShowInviteForm(false)
            fetchSpeakers()
          }}
          onCancel={() => setShowInviteForm(false)}
        />
      )}

      {/* Filter tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'Todos', count: speakers.length },
          { key: 'pending', label: 'Pendientes', count: speakers.filter(s => !s.confirmed).length },
          { key: 'confirmed', label: 'Confirmados', count: speakers.filter(s => s.confirmed).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Speakers list */}
      <div className="space-y-4">
        {filteredSpeakers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No hay speakers' : `No hay speakers ${filter === 'pending' ? 'pendientes' : 'confirmados'}`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Invita speakers o espera solicitudes de participación'
                : `No tienes speakers ${filter === 'pending' ? 'pendientes de confirmación' : 'confirmados'} en este momento`
              }
            </p>
          </Card>
        ) : (
          filteredSpeakers.map(speaker => (
            <Card key={speaker.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      {speaker.user.image ? (
                        <img 
                          src={speaker.user.image} 
                          alt={speaker.user.name || 'Speaker'} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          {(speaker.user.name || speaker.user.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {speaker.user.name || 'Usuario sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-600">{speaker.user.email}</p>
                    </div>
                    {getStatusBadge(speaker)}
                  </div>

                  {!eventId && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{speaker.event.title}</p>
                      <p className="text-sm text-gray-600">
                        📅 {formatDate(speaker.event.date)} • 📍 {speaker.event.userGroup.city}
                      </p>
                    </div>
                  )}

                  {speaker.topic && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">🎯 Tema:</p>
                      <p className="text-gray-900">{speaker.topic}</p>
                    </div>
                  )}

                  {speaker.bio && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">📝 Biografía:</p>
                      <p className="text-gray-700 text-sm">{speaker.bio}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Invitado: {formatDate(speaker.invitedAt)}
                    {speaker.confirmedAt && (
                      <> • Confirmado: {formatDate(speaker.confirmedAt)}</>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {!speaker.confirmed && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSpeakerAction(speaker.id, 'approve')}
                        disabled={actionLoading === speaker.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === speaker.id ? '...' : '✅ Aprobar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSpeakerAction(speaker.id, 'reject')}
                        disabled={actionLoading === speaker.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === speaker.id ? '...' : '❌ Rechazar'}
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveSpeaker(speaker.id)}
                    disabled={actionLoading === speaker.id}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    {actionLoading === speaker.id ? '...' : '🗑️ Eliminar'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}