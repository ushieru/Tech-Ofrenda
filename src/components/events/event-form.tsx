'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, type CreateEventData } from '@/lib/validations/event'
import { EventCategory, EventStatus, type Event } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Alert } from '@/components/ui/alert'

interface EventFormProps {
  userGroupId: string
  event?: Event
  onSuccess?: (event: Event) => void
  onCancel?: () => void
}

export function EventForm({ userGroupId, event, onSuccess, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [description, setDescription] = useState(event?.description || '')

  const isEditing = !!event

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateEventData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      capacity: event?.capacity || 50,
      category: event?.category || EventCategory.MEETUP,
      userGroupId
    }
  })

  const onSubmit = async (data: CreateEventData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = isEditing ? `/api/events/${event.id}` : '/api/events'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          description
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar el evento')
      }

      const savedEvent = await response.json()
      onSuccess?.(savedEvent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-orange-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          🎃 {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Evento *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ej: Meetup de React - Día de Muertos Tech"
              className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Evento *
            </label>
            <RichTextEditor
              value={description}
              onChange={(value) => {
                setDescription(value)
                setValue('description', value)
              }}
              placeholder="Describe tu evento con detalles sobre la agenda, speakers, y qué pueden esperar los asistentes..."
              className="min-h-[200px]"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora *
              </label>
              <Input
                id="date"
                type="datetime-local"
                {...register('date')}
                className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad Máxima *
              </label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="10000"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="50"
                className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ej: Centro de Innovación Tech, Av. Reforma 123, CDMX"
              className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría del Evento *
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value={EventCategory.MEETUP}>🍂 Meetup</option>
              <option value={EventCategory.HACKATHON}>💀 Hackathon</option>
              <option value={EventCategory.CONFERENCE}>🎭 Conferencia</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEditing ? '✏️ Actualizar Evento' : '🎃 Crear Evento'}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}