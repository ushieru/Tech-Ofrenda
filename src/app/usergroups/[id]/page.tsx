import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  User,
  Settings,
  Eye
} from "lucide-react"
import Link from "next/link"

async function getUserGroup(id: string) {
  return await prisma.userGroup.findUnique({
    where: { id },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      events: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          capacity: true,
          category: true,
          status: true,
          _count: {
            select: {
              attendees: true,
              speakers: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      },
      sponsors: {
        select: {
          id: true,
          name: true,
          level: true,
          website: true,
          logo: true,
        },
      },
      _count: {
        select: {
          members: true,
          events: true,
          sponsors: true,
          collaborators: true,
        },
      },
    },
  })
}

interface UserGroupPageProps {
  params: Promise<{ id: string }>
}

export default async function UserGroupPage({ params }: UserGroupPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userGroup = await getUserGroup(id)

  if (!userGroup) {
    notFound()
  }

  const currentUser = session?.user
  const isLeader = currentUser?.id === userGroup.leaderId
  const isMember = userGroup.members.some(member => member.id === currentUser?.id)

  const upcomingEvents = userGroup.events.filter(
    event => event.status === "PUBLISHED" && new Date(event.date) > new Date()
  )

  const pastEvents = userGroup.events.filter(
    event => event.status === "COMPLETED" || new Date(event.date) <= new Date()
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{userGroup.name}</h1>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {userGroup.city}
            </p>
          </div>
          
          <div className="flex gap-2">
            {isLeader && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/usergroup/${userGroup.id}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar
                  </Link>
                </Button>
              </>
            )}
            
            {!currentUser && (
              <Button asChild>
                <Link href="/auth/signin">
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Leader Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Líder de Comunidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {userGroup.leader.image && (
                <img 
                  src={userGroup.leader.image} 
                  alt={userGroup.leader.name || "Leader"}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{userGroup.leader.name || "Sin nombre"}</p>
                <p className="text-sm text-gray-600">{userGroup.leader.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGroup._count.members}</div>
              <p className="text-xs text-muted-foreground">
                Miembros activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGroup._count.events}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingEvents.length} próximos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGroup._count.sponsors}</div>
              <p className="text-xs text-muted-foreground">
                Patrocinadores activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGroup._count.collaborators}</div>
              <p className="text-xs text-muted-foreground">
                Ayudando en eventos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Eventos programados para las próximas fechas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{event._count.attendees} asistentes</span>
                          <span>{event._count.speakers} speakers</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm">
                          <Link href={`/events/${event.id}`}>
                            Ver Evento
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay eventos próximos programados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eventos Pasados</CardTitle>
                <CardDescription>
                  Historial de eventos organizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()} • {event.category}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{event._count.attendees} asistentes</div>
                        <div>{event._count.speakers} speakers</div>
                      </div>
                    </div>
                  ))}
                </div>
                {pastEvents.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      Ver Todos los Eventos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros ({userGroup._count.members})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userGroup.members.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    {member.image && (
                      <img 
                        src={member.image} 
                        alt={member.name || "Member"}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {userGroup._count.members > 8 && (
                <div className="text-center mt-4">
                  <Button variant="outline" size="sm">
                    Ver Todos los Miembros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sponsors */}
          {userGroup.sponsors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Patrocinadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userGroup.sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {sponsor.logo && (
                          <img 
                            src={sponsor.logo} 
                            alt={sponsor.name}
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{sponsor.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {sponsor.level}
                          </Badge>
                        </div>
                      </div>
                      {sponsor.website && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}