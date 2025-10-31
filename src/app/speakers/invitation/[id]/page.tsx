import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { SpeakerInvitationResponse } from './speaker-invitation-response'

interface SpeakerInvitationPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    action?: 'accept' | 'decline'
  }>
}

export default async function SpeakerInvitationPage({ 
  params, 
  searchParams 
}: SpeakerInvitationPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const { action } = await searchParams

  // Get the speaker invitation
  const speaker = await prisma.speaker.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          category: true,
          userGroup: {
            select: {
              id: true,
              name: true,
              city: true,
              leader: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitación no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            La invitación que buscas no existe o ha expirado.
          </p>
          <a 
            href="/dashboard"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Check if the user is the invited speaker
  if (speaker.userId !== session.user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso denegado
          </h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para ver esta invitación.
          </p>
          <a 
            href="/dashboard"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <SpeakerInvitationResponse 
          speaker={{
            ...speaker,
            event: {
              ...speaker.event,
              date: speaker.event.date.toISOString()
            }
          }}
          initialAction={action}
        />
      </div>
    </div>
  )
}