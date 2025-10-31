import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { CheckInDashboard } from '@/components/events/checkin-dashboard'

interface PageProps {
  params: Promise<{
    id: string
    eventId: string
  }>
}

export default async function CheckInPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { id: userGroupId, eventId } = await params

  // Verify user has permission to access this event's check-in
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      userGroup: {
        include: {
          leader: true
        }
      }
    }
  })

  if (!event) {
    redirect('/dashboard')
  }

  // Check if user is the community leader or a collaborator
  const isLeader = event.userGroup.leaderId === session.user.id
  const isCollaborator = await prisma.collaborator.findFirst({
    where: {
      userId: session.user.id,
      eventId: eventId
    }
  })

  if (!isLeader && !isCollaborator) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CheckInDashboard
          eventId={eventId}
          eventTitle={event.title}
        />
      </div>
    </div>
  )
}