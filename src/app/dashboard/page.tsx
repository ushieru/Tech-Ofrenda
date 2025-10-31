import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserGroupCard } from "@/components/usergroups/user-group-card"
import { CreateUserGroupForm } from "@/components/usergroups/create-user-group-form"
import { Users, Calendar, MapPin, Plus, Crown } from "lucide-react"
import Link from "next/link"

async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userGroup: {
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              status: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
      },
      ledUserGroup: {
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          events: {
            select: {
              id: true,
              title: true,
              date: true,
              status: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
      },
      attendeeRecords: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              userGroup: {
                select: {
                  name: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userData = await getUserData(session.user.id)

  if (!userData) {
    redirect("/auth/signin")
  }

  const isLeader = userData.ledUserGroup !== null
  const isMember = userData.userGroup !== null
  const hasGroup = isLeader || isMember
  const userGroup = userData.ledUserGroup || userData.userGroup

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {userData.name || userData.email}
        </p>
      </div>

      {/* User Group Status */}
      <div className="mb-8">
        {isLeader && userGroup ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Crown className="h-5 w-5" />
                Líder de Comunidad
              </CardTitle>
              <CardDescription className="text-orange-700">
                Estás liderando el grupo {userGroup.name} en {userGroup.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href={`/dashboard/usergroup/${userGroup.id}`}>
                    Gestionar Grupo
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/usergroups/${userGroup.id}`}>
                    Ver Página Pública
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isMember && userGroup ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Users className="h-5 w-5" />
                Miembro del Grupo
              </CardTitle>
              <CardDescription className="text-blue-700">
                Eres miembro de {userGroup.name} en {userGroup.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/usergroups/${userGroup.id}`}>
                  Ver Mi Grupo
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sin User Group
              </CardTitle>
              <CardDescription>
                No perteneces a ningún grupo aún. Únete a uno existente o crea el tuyo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/usergroups">
                    Explorar Grupos
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/usergroups?create=true">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Grupo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Group Details */}
          {userGroup && (
            <Card>
              <CardHeader>
                <CardTitle>Mi User Group</CardTitle>
                <CardDescription>
                  Información de tu grupo de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserGroupCard
                  userGroup={userGroup}
                  showActions={true}
                  currentUserId={userData.id}
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Events Attended */}
          {userData.attendeeRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Eventos Recientes
                </CardTitle>
                <CardDescription>
                  Eventos a los que te has registrado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userData.attendeeRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{record.event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {record.event.userGroup.name} • {record.event.userGroup.city}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.checkedIn 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {record.checkedIn ? "Asistió" : "Registrado"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Group Form for users without groups */}
          {!hasGroup && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Tu User Group</CardTitle>
                <CardDescription>
                  Conviértete en Líder de Comunidad creando un grupo para tu ciudad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateUserGroupForm 
                  currentUserId={userData.id}
                  onSuccess={() => {
                    // Form will redirect to dashboard
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rol</span>
                  <span className="font-medium">{userData.role}</span>
                </div>
                
                {userGroup && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Grupo</span>
                      <span className="font-medium">{userGroup.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ciudad</span>
                      <span className="font-medium">{userGroup.city}</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eventos Asistidos</span>
                  <span className="font-medium">{userData.attendeeRecords.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/usergroups">
                    <MapPin className="h-4 w-4 mr-2" />
                    Explorar Grupos
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Eventos
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/profile">
                    <Users className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}