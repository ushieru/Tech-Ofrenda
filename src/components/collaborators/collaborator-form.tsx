'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { collaboratorSchema, type CollaboratorFormData, collaboratorRoleLabels } from '@/lib/validations/collaborator'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CollaboratorFormProps {
  eventId: string
  users: Array<{
    id: string
    name: string | null
    email: string
  }>
  onSuccess: () => void
  onCancel: () => void
}

export function CollaboratorForm({ eventId, users, onSuccess, onCancel }: CollaboratorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      eventId
    }
  })

  const onSubmit = async (data: CollaboratorFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add collaborator')
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
      <h3 className="text-lg font-semibold mb-4">Agregar Colaborador</h3>
      
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Usuario</span>
          </label>
          <select
            {...register('userId')}
            className="select select-bordered w-full"
            disabled={isLoading}
          >
            <option value="">Seleccionar usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          {errors.userId && (
            <span className="text-error text-sm">{errors.userId.message}</span>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Rol</span>
          </label>
          <select
            {...register('role')}
            className="select select-bordered w-full"
            disabled={isLoading}
          >
            <option value="">Seleccionar rol</option>
            {Object.entries(collaboratorRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.role && (
            <span className="text-error text-sm">{errors.role.message}</span>
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
            {isLoading ? 'Agregando...' : 'Agregar Colaborador'}
          </Button>
        </div>
      </form>
    </Card>
  )
}