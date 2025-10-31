import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { UserGroupCard } from "@/components/usergroups/user-group-card"
import { CreateUserGroupForm } from "@/components/usergroups/create-user-group-form"
import { PublicNav } from "@/components/layout/public-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Users, Plus } from "lucide-react"
import Link from "next/link"

async function getUserGroups() {
  return await prisma.userGroup.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  })
}

interface UserGroupsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserGroupsPage({ searchParams }: UserGroupsPageProps) {
  const resolvedSearchParams = await searchParams
  const session = await getServerSession(authOptions)
  const userGroups = await getUserGroups()
  
  const showCreateForm = resolvedSearchParams.create === "true"
  const currentUser = session?.user

  // Check if user already leads a group or is a member
  const userGroup = currentUser ? await prisma.userGroup.findFirst({
    where: {
      OR: [
        { leaderId: currentUser.id },
        { members: { some: { id: currentUser.id } } }
      ]
    },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  }) : null

  const canCreateGroup = currentUser && !userGroup

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          User Groups de Tech-Ofrenda
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Descubre y únete a comunidades tecnológicas en tu ciudad
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{userGroups.length}</p>
                  <p className="text-sm text-gray-600">Grupos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(userGroups.map(g => g.city)).size}
                  </p>
                  <p className="text-sm text-gray-600">Ciudades</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Plus className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {userGroups.reduce((acc, g) => acc + g._count.events, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Eventos Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input 
              placeholder="Buscar por ciudad..." 
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {currentUser && userGroup && (
              <Button asChild>
                <Link href={`/dashboard/usergroup/${userGroup.id}`}>
                  Mi Grupo: {userGroup.leader.id === currentUser.id ? "Gestionar" : "Ver"}
                </Link>
              </Button>
            )}
            
            {canCreateGroup && (
              <Button asChild variant={showCreateForm ? "secondary" : "default"}>
                <Link href={showCreateForm ? "/usergroups" : "/usergroups?create=true"}>
                  {showCreateForm ? "Cancelar" : "Crear Grupo"}
                </Link>
              </Button>
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
      </div>

      {/* Create Form */}
      {showCreateForm && canCreateGroup && (
        <div className="mb-8 flex justify-center">
          <CreateUserGroupForm 
            currentUserId={currentUser.id}
            onSuccess={() => {
              // Form will redirect to dashboard
            }}
          />
        </div>
      )}

      {/* User Groups Grid */}
      {userGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userGroups.map((userGroup) => (
            <UserGroupCard
              key={userGroup.id}
              userGroup={userGroup}
              showActions={true}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <CardTitle className="mb-2">No hay User Groups aún</CardTitle>
            <CardDescription className="mb-6">
              Sé el primero en crear un grupo para tu ciudad
            </CardDescription>
            {canCreateGroup && (
              <Button asChild>
                <Link href="/usergroups?create=true">
                  Crear Primer Grupo
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>¿Qué es un User Group?</CardTitle>
          <CardDescription>
            Los User Groups son comunidades locales de tecnología organizadas por ciudad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Para Líderes de Comunidad</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Organiza eventos tecnológicos en tu ciudad</li>
                <li>• Gestiona miembros y colaboradores</li>
                <li>• Recibe patrocinios y contribuciones</li>
                <li>• Crea una comunidad tech local</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Para Miembros</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Participa en eventos locales</li>
                <li>• Conecta con otros desarrolladores</li>
                <li>• Aprende nuevas tecnologías</li>
                <li>• Contribuye a la comunidad</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}