import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Save, 
  ArrowLeft,
  AlertTriangle,
  Trash2,
  MapPin,
  User,
  Users
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
        },
      },
      events: {
        select: {
          id: true,
          title: true,
          status: true,
          date: true,
        },
        where: {
          OR: [
            { status: "PUBLISHED" },
            { status: "DRAFT" },
          ],
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

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
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

  const hasActiveEvents = userGroup.events.some(
    event => event.status === "PUBLISHED" && new Date(event.date) > new Date()
  )

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
          Configuración - {userGroup.name}
        </h1>
        <p className="text-gray-600">
          Administra la configuración de tu User Group
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Actualiza la información principal de tu User Group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre del Grupo
                  </label>
                  <Input
                    id="name"
                    defaultValue={userGroup.name}
                    placeholder="ej. Tech Community CDMX"
                  />
                  <p className="text-xs text-gray-500">
                    El nombre público de tu User Group
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Ciudad
                  </label>
                  <Input
                    id="city"
                    defaultValue={userGroup.city}
                    placeholder="ej. Ciudad de México"
                  />
                  <p className="text-xs text-gray-500">
                    Solo puede existir un User Group por ciudad
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Button variant="outline">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Leader Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Liderazgo del Grupo
              </CardTitle>
              <CardDescription>
                Gestiona el liderazgo de tu User Group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-orange-50 border-orange-200">
                  {userGroup.leader.image && (
                    <img 
                      src={userGroup.leader.image} 
                      alt={userGroup.leader.name || "Leader"}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{userGroup.leader.name || "Sin nombre"}</h3>
                    <p className="text-sm text-gray-600">{userGroup.leader.email}</p>
                    <p className="text-xs text-orange-700">Líder actual del grupo</p>
                  </div>
                </div>

                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Como líder del grupo, tienes permisos completos para gestionar eventos, 
                    miembros y configuración. Solo puede haber un líder por User Group.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label htmlFor="newLeader" className="text-sm font-medium">
                    Transferir Liderazgo
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="newLeader"
                      placeholder="Email del nuevo líder..."
                      disabled
                    />
                    <Button variant="outline" disabled>
                      Transferir
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Funcionalidad disponible próximamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription>
                Acciones irreversibles que afectan permanentemente tu User Group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Eliminar User Group:</strong> Esta acción no se puede deshacer. 
                    Se eliminará permanentemente el grupo, todos sus datos y configuraciones.
                  </AlertDescription>
                </Alert>

                {hasActiveEvents && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      No puedes eliminar el grupo mientras tengas eventos activos programados.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  variant="destructive" 
                  disabled={hasActiveEvents}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar User Group Permanentemente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estadísticas del Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Miembros</span>
                  <span className="font-semibold">{userGroup._count.members}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eventos</span>
                  <span className="font-semibold">{userGroup._count.events}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ciudad</span>
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {userGroup.city}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creado</span>
                  <span className="font-semibold">
                    {new Date(userGroup.createdAt).toLocaleDateString()}
                  </span>
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
                  <Link href={`/dashboard/usergroup/${userGroup.id}/members`}>
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Miembros
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/dashboard/usergroup/${userGroup.id}/events`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar Eventos
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/usergroups/${userGroup.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver Página Pública
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>¿Necesitas Ayuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Si tienes problemas con la configuración de tu User Group, 
                  consulta nuestra documentación o contacta al soporte.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Documentación
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}