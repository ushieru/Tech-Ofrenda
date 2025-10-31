import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search,
  Mail,
  Calendar,
  ArrowLeft
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
      _count: {
        select: {
          members: true,
          events: true,
        },
      },
    },
  })
}

interface MembersPageProps {
  params: Promise<{ id: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userGroup = await getUserGroup(id)

  if (!userGroup) {
    notFound()
  }

  // Check if user is the leader of this group
  if (userGroup.leaderId !== session.user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/usergroup/${userGroup.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Miembros - {userGroup.name}
        </h1>
        <p className="text-gray-600">
          Administra los miembros de tu User Group
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroup._count.members}</div>
            <p className="text-xs text-muted-foreground">
              Incluyendo al líder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGroup.members.filter(m => m.role !== "ATTENDEE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con roles específicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroup._count.events}</div>
            <p className="text-xs text-muted-foreground">
              Eventos organizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar y Agregar Miembros
          </CardTitle>
          <CardDescription>
            Busca usuarios por email para agregarlos al grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Buscar por email..." 
                className="w-full"
              />
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </div>
          
          <Alert className="mt-4">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Los usuarios deben estar registrados en la plataforma para poder ser agregados al grupo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros del Grupo ({userGroup._count.members})
          </CardTitle>
          <CardDescription>
            Lista de todos los miembros del User Group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Leader */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="flex items-center gap-4">
                {userGroup.leader.image && (
                  <img 
                    src={userGroup.leader.image} 
                    alt={userGroup.leader.name || "Leader"}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{userGroup.leader.name || "Sin nombre"}</h3>
                    <Badge className="bg-orange-100 text-orange-800">
                      Líder de Comunidad
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{userGroup.leader.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Fundador del grupo</p>
              </div>
            </div>

            {/* Members */}
            {userGroup.members.length > 0 ? (
              userGroup.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {member.image && (
                      <img 
                        src={member.image} 
                        alt={member.name || "Member"}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{member.name || "Sin nombre"}</h3>
                        <Badge variant="outline">
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">
                        Miembro desde {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Editar Rol
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay miembros adicionales en el grupo</p>
                <p className="text-sm">Invita a otros usuarios a unirse a tu comunidad</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}