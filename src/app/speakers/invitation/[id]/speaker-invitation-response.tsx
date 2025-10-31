'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'

interface Speaker {
  id: string
  topic: string | null
  bio: string | null
  confirmed: boolean
  user: {
    id: string
    name: string | null
    email: string
  }
  event: {
    id: string
    title: string
    description: string
    date: string
    location: string
    category: string
    userGroup: {
      id: string
      name: string
      city: string
      leader: {
        name: string | null
        email: string
      }
    }
  }
}

interface SpeakerInvitationResponseProps {
  speaker: Speaker
  initialAction?: 'accept' | 'decline'
}

export function SpeakerInvitationResponse({ speaker, initialAction }: SpeakerInvitationResponseProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [topic, setTopic] = useState(speaker.topic || '')
  const [bio, setBio] = useState(speaker.bio || '')

  useEffect(() => {
    if (initialAction && !speaker.confirmed) {
      if (initialAction === 'accept') {
        setShowForm(true)
      } else if (initialAction === 'decline') {
        handleDecline()
      }
    }
  }, [initialAction])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/speakers/${speaker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmed: true,
          topic: topic.trim() || undefined,
          bio: bio.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept invitation')
      }

      setSuccess('¡Invitación aceptada exitosamente! Los organizadores han sido notificados.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accepting invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm('¿Estás seguro de que quieres declinar esta invitación?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/speakers/${speaker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmed: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to decline invitation')
      }

      setSuccess('Invitación declinada. Los organizadores han sido notificados.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error declining invitation')
    } finally {
      setIsLoading(false)
    }
  }

  if (speaker.confirmed) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            ¡Invitación ya confirmada!
          </h1>
          <p className="text-gray-600 mb-6">
            Ya has aceptado la invitación para participar como speaker en este evento.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Ir al Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            ¡Perfecto!
          </h1>
          <Alert variant="default" className="mb-6 border-green-200 bg-green-50 text-green-800">
            {success}
          </Alert>
          <p className="text-gray-600">
            Serás redirigido al dashboard en unos segundos...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Te invitamos a ser Speaker!
          </h1>
          <p className="text-gray-600">
            Has sido invitado a participar en el siguiente evento
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Event details */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {speaker.event.title}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700">📅 Fecha y hora</p>
              <p className="text-gray-900">{formatDate(speaker.event.date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">📍 Ubicación</p>
              <p className="text-gray-900">{speaker.event.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">🏢 Organizador</p>
              <p className="text-gray-900">{speaker.event.userGroup.name} - {speaker.event.userGroup.city}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">🎯 Categoría</p>
              <p className="text-gray-900">{speaker.event.category}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">📝 Descripción del evento</p>
            <p className="text-gray-700">{speaker.event.description}</p>
          </div>
        </div>

        {/* Current topic and bio if any */}
        {(speaker.topic || speaker.bio) && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-4">📋 Información actual de tu participación:</h3>
            {speaker.topic && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-700">🎯 Tema propuesto:</p>
                <p className="text-blue-900">{speaker.topic}</p>
              </div>
            )}
            {speaker.bio && (
              <div>
                <p className="text-sm font-medium text-blue-700">📝 Biografía:</p>
                <p className="text-blue-900">{speaker.bio}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons or form */}
        {!showForm ? (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  ✅ Aceptar Invitación
                </>
              )}
            </Button>
            <Button
              onClick={handleDecline}
              disabled={isLoading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 px-8 py-3 text-lg"
            >
              ❌ Declinar
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              🎯 Completa tu información como Speaker
            </h3>
            
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Tema de tu presentación
              </label>
              <Input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Introducción a React Hooks, Machine Learning con Python..."
                className="w-full"
              />
              <p className="text-gray-500 text-sm mt-1">
                💡 Puedes modificar el tema propuesto o agregar uno nuevo
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Tu biografía y experiencia
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Cuéntanos sobre tu experiencia, proyectos relevantes, y por qué eres la persona indicada para hablar sobre este tema..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                💡 Esta información se mostrará en la página del evento
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleAccept}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirmando...
                  </>
                ) : (
                  <>
                    🎤 Confirmar Participación
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                disabled={isLoading}
                variant="outline"
              >
                ← Volver
              </Button>
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes preguntas? Contacta al organizador: {' '}
            <a 
              href={`mailto:${speaker.event.userGroup.leader.email}`}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {speaker.event.userGroup.leader.name || speaker.event.userGroup.leader.email}
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}