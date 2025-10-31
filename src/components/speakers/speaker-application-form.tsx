'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { speakerApplicationSchema, type SpeakerApplication } from '@/lib/validations/speaker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

interface SpeakerApplicationFormProps {
  eventId: string
  eventTitle: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SpeakerApplicationForm({ 
  eventId, 
  eventTitle, 
  onSuccess, 
  onCancel 
}: SpeakerApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SpeakerApplication>({
    resolver: zodResolver(speakerApplicationSchema),
    defaultValues: {
      eventId
    }
  })

  const onSubmit = async (data: SpeakerApplication) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/speakers?action=apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const result = await response.json()
      setSuccess('¡Solicitud enviada exitosamente! Los organizadores revisarán tu propuesta.')
      reset()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting application')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        🎤 Solicitar Participar como Speaker
      </h3>
      <p className="text-gray-600 mb-4">
        Evento: <strong>{eventTitle}</strong>
      </p>

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
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Tema de tu Presentación *
          </label>
          <Input
            id="topic"
            type="text"
            placeholder="Ej: Introducción a React Hooks, Machine Learning con Python..."
            {...register('topic')}
            className={errors.topic ? 'border-red-500' : ''}
          />
          {errors.topic && (
            <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            💡 Sé específico sobre el tema que quieres presentar
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Tu Biografía y Experiencia *
          </label>
          <textarea
            id="bio"
            rows={6}
            placeholder="Cuéntanos sobre tu experiencia, proyectos relevantes, y por qué eres la persona indicada para hablar sobre este tema..."
            {...register('bio')}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.bio ? 'border-red-500' : ''
            }`}
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            💡 Incluye tu experiencia relevante, proyectos, y por qué quieres compartir este conocimiento
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 mb-2">📋 Información importante:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Los organizadores revisarán tu solicitud</li>
            <li>• Recibirás una respuesta por email</li>
            <li>• El proceso puede tomar algunos días</li>
            <li>• Asegúrate de que tu información de contacto esté actualizada</li>
          </ul>
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
                📤 Enviar Solicitud
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