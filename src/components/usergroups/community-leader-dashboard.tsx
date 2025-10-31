"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Plus,
  Eye,
  Settings,
  BarChart3,
  Mic
} from "lucide-react"
import Link from "next/link"
import { FundingDashboard } from "@/components/contributions/funding-dashboard"
import { SpeakerManagementDashboard } from "@/components/speakers/speaker-management-dashboard"

interface DashboardStats {
  overview: {
    totalMembers: number
    totalEvents: number
    publishedEvents: number
    upcomingEvents: number
    completedEvents: number
    totalAttendees: number
    totalContributions: number
    totalFunding: number
  }
  recentEvents: Array<{
    id: string
    title: string
    date: string
    status: string
    category: string
    attendeesCount: number
    speakersCount: number
    contributionsCount: number
  }>
  topContributors: Array<{
    name: string
    totalAmount: number
    contributionsCount: number
  }>
  monthlyData: Array<{
    month: string
    events: number
  }>
}

interface UserGroupWithDetails {
  id: string
  name: string
  city: string
  leaderId: string
  leader: {
    id: string
    name: string | null
    email: string
  }
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

interface CommunityLeaderDashboardProps {
  userGroup: UserGroupWithDetails
  currentUserId: string
}

export function CommunityLeaderDashboard({ 
  userGroup, 
  currentUserId 
}: CommunityLeaderDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'funding' | 'speakers'>('overview')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/usergroups/${userGroup.id}/stats`)
        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }
        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userGroup.id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - {userGroup.name}</h1>
          <p className="text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {userGroup.city}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/usergroups/${userGroup.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Público
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/usergroup/${userGroup.id}/events/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'funding'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DollarSign className="h-4 w-4 inline mr-2" />
            Gestión de Fondos
          </button>
          <button
            onClick={() => setActiveTab('speakers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'speakers'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mic className="h-4 w-4 inline mr-2" />
            Gestión de Speakers
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Miembros activos en el grupo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.upcomingEvents} próximos eventos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asistentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalAttendees}</div>
                <p className="text-xs text-muted-foreground">
                  Total de registros a eventos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fondeo</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.overview.totalFunding.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.totalContributions} contribuciones
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Eventos Recientes
                </CardTitle>
                <CardDescription>
                  Últimos eventos organizados por tu grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentEvents.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.category}
                          </p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>{event.attendeesCount} asistentes</span>
                            <span>{event.speakersCount} speakers</span>
                            <span>{event.contributionsCount} contribuciones</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === "PUBLISHED" 
                              ? "bg-green-100 text-green-800"
                              : event.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay eventos aún</p>
                    <Button asChild className="mt-4" size="sm">
                      <Link href={`/dashboard/usergroup/${userGroup.id}/events/create`}>
                        Crear Primer Evento
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Principales Contribuyentes
                </CardTitle>
                <CardDescription>
                  Patrocinadores que más han apoyado tus eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topContributors.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topContributors.slice(0, 5).map((contributor, index) => (
                      <div key={contributor.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{contributor.name}</p>
                            <p className="text-sm text-gray-600">
                              {contributor.contributionsCount} contribuciones
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${contributor.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay contribuciones aún</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Gestiona tu User Group y eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href={`/dashboard/usergroup/${userGroup.id}/members`}>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <div>
                        <p className="font-medium">Gestionar Miembros</p>
                        <p className="text-sm text-gray-600">Agregar o remover miembros</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href={`/dashboard/usergroup/${userGroup.id}/events`}>
                    <div className="text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2" />
                      <div>
                        <p className="font-medium">Gestionar Eventos</p>
                        <p className="text-sm text-gray-600">Ver y editar eventos</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href={`/dashboard/usergroup/${userGroup.id}/settings`}>
                    <div className="text-center">
                      <Settings className="h-8 w-8 mx-auto mb-2" />
                      <div>
                        <p className="font-medium">Configuración</p>
                        <p className="text-sm text-gray-600">Editar información del grupo</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Funding Tab */}
      {activeTab === 'funding' && (
        <FundingDashboard userGroupId={userGroup.id} />
      )}

      {/* Speakers Tab */}
      {activeTab === 'speakers' && (
        <SpeakerManagementDashboard userGroupId={userGroup.id} />
      )}
    </div>
  )
}