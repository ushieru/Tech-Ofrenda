'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sponsorSchema, type SponsorFormData, sponsorLevelLabels } from '@/lib/validations/sponsor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SponsorFormProps {
  userGroupId: string
  eventId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function SponsorForm({ userGroupId, eventId, onSuccess, onCancel }: SponsorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      userGroupId,
      eventId: eventId || undefined
    }
  })

  const onSubmit = async (data: SponsorFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        email: data.email || undefined,
        website: data.website || undefined,
        logo: data.logo || undefined,
        eventId: data.eventId || undefined
      }

      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add sponsor')
      }

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Agregar Sponsor</h3>
      
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Nombre *</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="input input-bordered w-full"
            placeholder="Nombre del sponsor"
            disabled={isLoading}
          />
          {errors.name && (
            <span className="text-error text-sm">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            {...register('email')}
            type="email"
            className="input input-bordered w-full"
            placeholder="email@ejemplo.com"
            disabled={isLoading}
          />
          {errors.email && (
            <span className="text-error text-sm">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Sitio Web</span>
          </label>
          <input
            {...register('website')}
            type="url"
            className="input input-bordered w-full"
            placeholder="https://ejemplo.com"
            disabled={isLoading}
          />
          {errors.website && (
            <span className="text-error text-sm">{errors.website.message}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Logo URL</span>
          </label>
          <input
            {...register('logo')}
            type="url"
            className="input input-bordered w-full"
            placeholder="https://ejemplo.com/logo.png"
            disabled={isLoading}
          />
          {errors.logo && (
            <span className="text-error text-sm">{errors.logo.message}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Nivel de Patrocinio *</span>
          </label>
          <select
            {...register('level')}
            className="select select-bordered w-full"
            disabled={isLoading}
          >
            <option value="">Seleccionar nivel</option>
            {Object.entries(sponsorLevelLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.level && (
            <span className="text-error text-sm">{errors.level.message}</span>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Agregando...' : 'Agregar Sponsor'}
          </Button>
        </div>
      </form>
    </Card>
  )
}