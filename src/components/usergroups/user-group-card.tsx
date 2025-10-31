"use client"

import { UserGroup, User, Event } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

type UserGroupWithDetails = UserGroup & {
  leader: Pick<User, "id" | "email"> & { name: string | null }
  events: Array<{
    id: string
    title: string
    date: Date
    status: string
  }>
  _count: {
    members: number
    events: number
  }
}

interface UserGroupCardProps {
  userGroup: UserGroupWithDetails
  showActions?: boolean
  currentUserId?: string
}

export function UserGroupCard({ 
  userGroup, 
  showActions = false, 
  currentUserId 
}: UserGroupCardProps) {
  const isLeader = currentUserId === userGroup.leaderId
  const upcomingEvents = userGroup.events.filter(
    event => event.status === "PUBLISHED" && new Date(event.date) > new Date()
  ).length

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{userGroup.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {userGroup.city}
            </CardDescription>
          </div>
          {isLeader && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Líder
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Leader Info */}
          <div>
            <p className="text-sm font-medium text-gray-700">Líder de Comunidad</p>
            <p className="text-sm text-gray-600">{userGroup.leader.name || userGroup.leader.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-semibold">{userGroup._count.members}</span>
              </div>
              <p className="text-xs text-gray-600">Miembros</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">{userGroup._count.events}</span>
              </div>
              <p className="text-xs text-gray-600">Eventos</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-lg font-semibold">{upcomingEvents}</span>
              </div>
              <p className="text-xs text-gray-600">Próximos</p>
            </div>
          </div>

          {/* Recent Events */}
          {userGroup.events.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Eventos Recientes</p>
              <div className="space-y-1">
                {userGroup.events.slice(0, 2).map((event) => (
                  <div key={event.id} className="text-xs text-gray-600 flex justify-between">
                    <span className="truncate">{event.title}</span>
                    <span className="text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/usergroups/${userGroup.id}`}>
                  Ver Detalles
                </Link>
              </Button>
              {isLeader && (
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/dashboard/usergroup/${userGroup.id}`}>
                    Gestionar
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}