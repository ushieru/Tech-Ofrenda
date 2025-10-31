'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Event } from '@prisma/client'
import { EventList } from '@/components/events/event-list'
import { EventForm } from '@/components/events/event-form'

export default function UserGroupEventsPage() {
  const params = useParams()
  const userGroupId = params.id as string
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEvent(null)
    // The EventList component will automatically refresh
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <EventForm
          userGroupId={userGroupId}
          event={editingEvent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventList
        userGroupId={userGroupId}
        onEditEvent={handleEditEvent}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  )
}