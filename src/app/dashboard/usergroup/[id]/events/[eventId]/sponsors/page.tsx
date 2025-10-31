import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { SponsorManagement } from '@/components/sponsors/sponsor-management'

interface PageProps {
  params: Promise<{
    id: string
    eventId: string
  }>
}

export default async function SponsorsPage({ params }: PageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Verify user is the leader of this user group
  const userGroup = await prisma.userGroup.findUnique({
    where: { id: resolvedParams.id },
    select: {
      leaderId: true,
      name: true,
      city: true
    }
  })

  if (!userGroup || userGroup.leaderId !== session.user.id) {
    redirect('/dashboard')
  }

  // Verify event belongs to this user group
  const event = await prisma.event.findUnique({
    where: { 
      id: resolvedParams.eventId,
      userGroupId: resolvedParams.id
    },
    select: {
      id: true,
      title: true,
      date: true
    }
  })

  if (!event) {
    redirect(`/dashboard/usergroup/${resolvedParams.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Sponsors
        </h1>
        <p className="text-gray-600">
          Evento: <span className="font-semibold">{event.title}</span>
        </p>
        <p className="text-gray-600">
          Comunidad: <span className="font-semibold">{userGroup.name} - {userGroup.city}</span>
        </p>
      </div>

      <SponsorManagement 
        userGroupId={resolvedParams.id}
        eventId={resolvedParams.eventId}
      />
    </div>
  )
}