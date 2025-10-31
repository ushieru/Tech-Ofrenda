'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerAttendeeSchema, type RegisterAttendeeInput } from '@/lib/validations/attendee'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

interface AttendeeRegistrationFormProps {
  eventId: string
  eventTitle: string
  eventDate: Date
  capacity: number
  currentAttendees: number
  onRegistrationSuccess?: (data: any) => void
}

export function AttendeeRegistrationForm({
  eventId,
  eventTitle,
  eventDate,
  capacity,
  currentAttendees,
  onRegistrationSuccess
}: AttendeeRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterAttendeeInput>({
    resolver: zodResolver(registerAttendeeSchema),
    defaultValues: {
      eventId,
      name: '',
      email: '',
      addToCalendar: false
    }
  })

  const availableSpots = capacity - currentAttendees
  const isEventFull = availableSpots <= 0
  const isEventPast = new Date(eventDate) <= new Date()

  const onSubmit = async (data: RegisterAttendeeInput) => {
    if (isEventFull || isEventPast) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrarse')
      }

      setRegistrationSuccess(result)
      reset()
      onRegistrationSuccess?.(result)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            ¡Registro Exitoso!
          </h3>
          <p className="text-gray-600 mb-4">
            Te has registrado exitosamente para <strong>{eventTitle}</strong>
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-800 mb-2">📧 Revisa tu email</h4>
            <p className="text-sm text-green-700">
              Hemos enviado un email de confirmación con tu ticket QR. 
              Preséntalo el día del evento para hacer check-in.
            </p>
          </div>

          {registrationSuccess.attendee?.calendarUrl && (
            <div className="mb-4">
              <a
                href={registrationSuccess.attendee.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                📅 Agregar a Google Calendar
              </a>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>ID de registro: {registrationSuccess.attendee?.id}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isEventPast) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">⏰</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Evento Finalizado
        </h3>
        <p className="text-gray-500">
          Este evento ya ha pasado y no está disponible para registro.
        </p>
      </div>
    )
  }

  if (isEventFull) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🎫</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Evento Lleno
        </h3>
        <p className="text-red-500">
          Este evento ha alcanzado su capacidad máxima de {capacity} asistentes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-orange-600 mb-2">
          🎫 Registrarse al Evento
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            👥 {currentAttendees}/{capacity} registrados
          </span>
          <span className="flex items-center gap-1">
            🎯 {availableSpots} lugares disponibles
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre completo"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="addToCalendar"
            type="checkbox"
            {...register('addToCalendar')}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="addToCalendar" className="text-sm text-gray-700">
            📅 Generar enlace para agregar a Google Calendar
          </label>
        </div>

        {submitError && (
          <Alert variant="destructive">
            <p>{submitError}</p>
          </Alert>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">📋 Qué esperar después del registro:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Recibirás un email de confirmación con tu ticket QR</li>
            <li>• Presenta el QR el día del evento para hacer check-in</li>
            <li>• Llega 15 minutos antes del evento</li>
            <li>• Trae una identificación válida</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isEventFull || isEventPast}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Registrando...
            </span>
          ) : (
            '🎫 Registrarse al Evento'
          )}
        </Button>
      </form>
    </div>
  )
}