'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SponsorForm } from './sponsor-form'
import { sponsorLevelLabels, sponsorLevelColors } from '@/lib/validations/sponsor'

interface Sponsor {
  id: string
  name: string
  email: string | null
  website: string | null
  logo: string | null
  level: keyof typeof sponsorLevelLabels
  userGroup: {
    id: string
    name: string
    city: string
  }
  event: {
    id: string
    title: string
    date: string
  } | null
  createdAt: string
}

interface SponsorManagementProps {
  userGroupId: string
  eventId?: string
}

export function SponsorManagement({ userGroupId, eventId }: SponsorManagementProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSponsors = async () => {
    try {
      const params = new URLSearchParams({ userGroupId })
      if (eventId) {
        params.append('eventId', eventId)
      }
      
      const response = await fetch(`/api/sponsors?${params}`)
      if (!response.ok) throw new Error('Failed to fetch sponsors')
      const data = await response.json()
      setSponsors(data)
    } catch (error) {
      setError('Error loading sponsors')
      console.error('Error fetching sponsors:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchSponsors()
      setIsLoading(false)
    }
    loadData()
  }, [userGroupId, eventId])

  const handleRemoveSponsor = async (sponsorId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este sponsor?')) {
      return
    }

    try {
      const response = await fetch(`/api/sponsors/${sponsorId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove sponsor')
      }

      await fetchSponsors()
    } catch (error) {
      setError('Error removing sponsor')
      console.error('Error removing sponsor:', error)
    }
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    await fetchSponsors()
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
        <h2 className="text-xl font-semibold">Sponsors</h2>
        <Button onClick={() => setShowForm(true)}>
          Agregar Sponsor
        </Button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <SponsorForm
          userGroupId={userGroupId}
          eventId={eventId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-4">
        {sponsors.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No hay sponsors registrados.</p>
          </Card>
        ) : (
          sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sponsor.logo && (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{sponsor.name}</h3>
                    {sponsor.email && (
                      <p className="text-sm text-gray-500">{sponsor.email}</p>
                    )}
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {sponsor.website}
                      </a>
                    )}
                    {sponsor.event && (
                      <p className="text-sm text-gray-500">
                        Evento: {sponsor.event.title}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-white ${sponsorLevelColors[sponsor.level]}`}
                  >
                    {sponsorLevelLabels[sponsor.level]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSponsor(sponsor.id)}
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