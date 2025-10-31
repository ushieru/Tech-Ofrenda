'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { speakerInvitationSchema, type SpeakerInvitation } from '@/lib/validations/speaker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

interface SpeakerInvitationFormProps {
  eventId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SpeakerInvitationForm({ eventId, onSuccess, onCancel }: SpeakerInvitationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SpeakerInvitation>({
    resolver: zodResolver(speakerInvitationSchema),
    defaultValues: {
      eventId
    }
  })

  const onSubmit = async (data: SpeakerInvitation) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/speakers?action=invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      const result = await response.json()
      setSuccess('Invitación enviada exitosamente')
      reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎤 Invitar Speaker
      </h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
            ID del Usuario *
          </label>
          <Input
            id="userId"
            type="text"
            placeholder="Ingresa el ID del usuario a invitar"
            {...register('userId')}
            className={errors.userId ? 'border-red-500' : ''}
          />
          {errors.userId && (
            <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            💡 Puedes encontrar el ID del usuario en su perfil o en la lista de miembros
          </p>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Tema Propuesto
          </label>
          <Input
            id="topic"
            type="text"
            placeholder="Ej: Introducción a React Hooks"
            {...register('topic')}
            className={errors.topic ? 'border-red-500' : ''}
          />
          {errors.topic && (
            <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Biografía Sugerida
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Breve descripción del speaker y su experiencia..."
            {...register('bio')}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.bio ? 'border-red-500' : ''
            }`}
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                📧 Enviar Invitación
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}