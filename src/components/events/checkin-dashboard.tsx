'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from './qr-scanner'

interface CheckInStats {
  totalRegistered: number
  checkedIn: number
  checkInRate: number
  capacity: number
  availableSpots: number
}

interface RecentCheckIn {
  id: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  checkedInAt: string
}

interface CheckInDashboardProps {
  eventId: string
  eventTitle: string
}

export function CheckInDashboard({ eventId, eventTitle }: CheckInDashboardProps) {
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/checkin`)
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      const data = await response.json()
      setStats(data.stats)
      setRecentCheckIns(data.recentCheckIns)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [eventId])

  const handleCheckInSuccess = () => {
    // Refresh stats after successful check-in
    fetchStats()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">
          📱 Check-in Dashboard
        </h1>
        <p className="text-gray-600">{eventTitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats?.totalRegistered || 0}
            </div>
            <div className="text-sm text-gray-600">Registrados</div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats?.checkedIn || 0}
            </div>
            <div className="text-sm text-gray-600">Check-in</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats?.checkInRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Asistencia</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats?.availableSpots || 0}
            </div>
            <div className="text-sm text-gray-600">Cupos Disponibles</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <div>
          <QRScanner
            eventId={eventId}
            onCheckInSuccess={handleCheckInSuccess}
            onCheckInError={(error) => console.error('Check-in error:', error)}
          />
        </div>

        {/* Recent Check-ins */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
            <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
              🕐 Check-ins Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentCheckIns.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📱</div>
                <p>No hay check-ins aún</p>
                <p className="text-sm">Los check-ins aparecerán aquí en tiempo real</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-lg">
                      ✅
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {checkIn.user.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {checkIn.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(checkIn.checkedInAt)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats && stats.totalRegistered > 0 && (
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
            <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
              📊 Progreso de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Check-ins realizados
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {stats.checkedIn} de {stats.totalRegistered}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${stats.checkInRate}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">
                  {stats.checkInRate}%
                </span>
                <span className="text-gray-600 ml-2">de asistencia</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}