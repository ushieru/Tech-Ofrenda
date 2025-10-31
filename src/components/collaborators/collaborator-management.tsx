'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollaboratorForm } from './collaborator-form'
import { collaboratorRoleLabels } from '@/lib/validations/collaborator'

interface Collaborator {
  id: string
  role: keyof typeof collaboratorRoleLabels
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
  }
  createdAt: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface CollaboratorManagementProps {
  eventId: string
  userGroupId: string
}

export function CollaboratorManagement({ eventId, userGroupId }: CollaboratorManagementProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/collaborators?eventId=${eventId}`)
      if (!response.ok) throw new Error('Failed to fetch collaborators')
      const data = await response.json()
      setCollaborators(data)
    } catch (error) {
      setError('Error loading collaborators')
      console.error('Error fetching collaborators:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/usergroups/${userGroupId}/members`)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchCollaborators(), fetchUsers()])
      setIsLoading(false)
    }
    loadData()
  }, [eventId, userGroupId])

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este colaborador?')) {
      return
    }

    try {
      const response = await fetch(`/api/collaborators/${collaboratorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove collaborator')
      }

      await fetchCollaborators()
    } catch (error) {
      setError('Error removing collaborator')
      console.error('Error removing collaborator:', error)
    }
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    await fetchCollaborators()
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Colaboradores</h2>
        <Button onClick={() => setShowForm(true)}>
          Agregar Colaborador
        </Button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <CollaboratorForm
          eventId={eventId}
          users={users}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-4">
        {collaborators.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No hay colaboradores asignados a este evento.</p>
          </Card>
        ) : (
          collaborators.map((collaborator) => (
            <Card key={collaborator.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {collaborator.user.image && (
                    <img
                      src={collaborator.user.image}
                      alt={collaborator.user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {collaborator.user.name || collaborator.user.email}
                    </h3>
                    <p className="text-sm text-gray-500">{collaborator.user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {collaboratorRoleLabels[collaborator.role]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover
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