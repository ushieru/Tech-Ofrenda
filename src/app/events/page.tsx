import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import { EventStatus, EventCategory } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicNav } from '@/components/layout/public-nav'
import Link from 'next/link'

interface EventsPageProps {
  searchParams: Promise<{
    city?: string
    category?: EventCategory
    userGroup?: string
    page?: string
  }>
}

async function getPublicEvents(searchParams: Awaited<EventsPageProps['searchParams']>) {
  const { city, category, userGroup, page = '1' } = searchParams
  const limit = 12
  const skip = (parseInt(page) - 1) * limit

  const where: any = {
    status: EventStatus.PUBLISHED,
    date: {
      gte: new Date() // Only future events
    }
  }

  if (city) {
    where.userGroup = {
      city: {
        contains: city,
        mode: 'insensitive'
      }
    }
  }

  if (userGroup) {
    where.userGroupId = userGroup
  }

  if (category) {
    where.category = category
  }

  const [events, total, cities, userGroups] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        userGroup: {
          include: {
            leader: {
              select: { id: true, name: true }
            }
          }
        },
        contributions: {
          where: { confirmed: true },
          select: { amount: true }
        },
        _count: {
          select: {
            attendees: true,
            speakers: true,
            sponsors: true
          }
        }
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit
    }),
    prisma.event.count({ where }),
    prisma.userGroup.findMany({
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' }
    }),
    prisma.userGroup.findMany({
      select: { id: true, name: true, city: true },
      orderBy: { name: 'asc' }
    })
  ])

  // Calculate funding for each event
  const eventsWithFunding = events.map(event => ({
    ...event,
    totalFunding: event.contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  }))

  return {
    events: eventsWithFunding,
    total,
    cities: cities.map(c => c.city),
    userGroups,
    pagination: {
      page: parseInt(page),
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

function EventCard({ event }: { event: any }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getCategoryEmoji = (category: EventCategory) => {
    switch (category) {
      case EventCategory.MEETUP: return '🍂'
      case EventCategory.HACKATHON: return '💀'
      case EventCategory.CONFERENCE: return '🎭'
      default: return '🎃'
    }
  }

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case EventCategory.MEETUP: return 'from-amber-100 to-orange-100 border-amber-200'
      case EventCategory.HACKATHON: return 'from-purple-100 to-indigo-100 border-purple-200'
      case EventCategory.CONFERENCE: return 'from-red-100 to-pink-100 border-red-200'
      default: return 'from-orange-100 to-red-100 border-orange-200'
    }
  }

  const availableSpots = event.capacity - event._count.attendees
  const attendancePercentage = (event._count.attendees / event.capacity) * 100
  
  // Estimate funding goal based on event type and capacity
  const getFundingGoal = (category: EventCategory, capacity: number) => {
    const baseAmount = {
      [EventCategory.MEETUP]: 50,
      [EventCategory.HACKATHON]: 200,
      [EventCategory.CONFERENCE]: 500
    }
    return baseAmount[category] * Math.ceil(capacity / 10)
  }

  const fundingGoal = getFundingGoal(event.category, event.capacity)
  const fundingPercentage = Math.min((event.totalFunding / fundingGoal) * 100, 100)

  // Days until event
  const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 relative overflow-hidden group">
      {/* Day of the Dead decorative elements */}
      <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
        💀
      </div>
      <div className="absolute bottom-0 left-0 text-4xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
        🌺
      </div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <Badge className={`bg-gradient-to-r ${getCategoryColor(event.category)} px-3 py-1 text-xs font-medium shadow-sm`}>
            {getCategoryEmoji(event.category)} {event.category}
          </Badge>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              📍 {event.userGroup.city}
            </Badge>
            {daysUntilEvent <= 7 && daysUntilEvent > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs animate-pulse">
                🔥 {daysUntilEvent}d restantes
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-700 transition-colors">
          {event.title}
        </CardTitle>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          📅 {formatDate(event.date)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhanced Funding Progress with Day of the Dead theme */}
        <div className="space-y-3 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-100">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700 flex items-center gap-1">
              🎁 Ofrendas Digitales
            </span>
            <span className="text-orange-600 font-bold">
              ${event.totalFunding.toLocaleString('es-MX')} / ${fundingGoal.toLocaleString('es-MX')}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 h-3 rounded-full transition-all duration-700 relative"
                style={{ width: `${fundingPercentage}%` }}
              >
                {fundingPercentage > 0 && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </>
                )}
              </div>
            </div>
            {/* Decorative elements on progress bar */}
            {fundingPercentage > 20 && (
              <div className="absolute top-0 left-2 text-xs">🕯️</div>
            )}
            {fundingPercentage > 60 && (
              <div className="absolute top-0 right-2 text-xs">🌺</div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">
              {fundingPercentage.toFixed(0)}% del objetivo
            </span>
            <span className="text-orange-600 font-medium">
              {fundingPercentage >= 100 ? '🎉 ¡Meta alcanzada!' : `$${(fundingGoal - event.totalFunding).toLocaleString('es-MX')} restantes`}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-bold text-blue-600">{event._count.attendees}</div>
            <div className="text-gray-600">Registrados</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
            <div className="font-bold text-purple-600">{event._count.speakers}</div>
            <div className="text-gray-600">Speakers</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="font-bold text-yellow-600">{event._count.sponsors}</div>
            <div className="text-gray-600">Sponsors</div>
          </div>
        </div>

        {/* Location and Organizer */}
        <div className="space-y-1 text-sm text-gray-600 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
          <p className="line-clamp-1 flex items-center gap-1">
            📍 <span className="font-medium">{event.location}</span>
          </p>
          <p className="line-clamp-1 flex items-center gap-1">
            🏘️ <span className="font-medium text-orange-700">{event.userGroup.name}</span>
          </p>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1 max-w-[80px]">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  attendancePercentage > 90 ? 'bg-red-500' : 
                  attendancePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
            <span className={`font-medium text-xs ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableSpots > 0 ? `${availableSpots} cupos` : 'Lleno'}
            </span>
          </div>
        </div>

        {/* Action Button with enhanced Day of the Dead styling */}
        <Link href={`/events/${event.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 hover:from-orange-700 hover:via-red-700 hover:to-yellow-700 text-white font-medium shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
            <span className="relative z-10 flex items-center justify-center gap-2">
              🎃 Ver Altar Digital 💀
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function FilterBar({ cities, userGroups, searchParams }: { 
  cities: string[], 
  userGroups: Array<{id: string, name: string, city: string}>,
  searchParams: any 
}) {
  return (
    <div className="bg-gradient-to-r from-white via-orange-50/30 to-red-50/30 p-6 rounded-xl shadow-lg border border-orange-200 mb-8 relative overflow-hidden">
      {/* Decorative Day of the Dead elements */}
      <div className="absolute top-2 right-2 text-2xl opacity-10">🌺</div>
      <div className="absolute bottom-2 left-2 text-2xl opacity-10">🕯️</div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🔍 Filtrar Eventos
          <span className="text-sm font-normal text-gray-600 ml-2">
            Encuentra tu evento perfecto
          </span>
        </h3>
        
        <form method="GET" action="/events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* City Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                📍 Ciudad
              </label>
              <select 
                name="city"
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all hover:border-orange-300"
                defaultValue={searchParams.city || ''}
              >
                <option value="">🌎 Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>📍 {city}</option>
                ))}
              </select>
            </div>

            {/* User Group Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                🏘️ Comunidad
              </label>
              <select 
                name="userGroup"
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all hover:border-orange-300"
                defaultValue={searchParams.userGroup || ''}
              >
                <option value="">🌐 Todas las comunidades</option>
                {userGroups.map(group => (
                  <option key={group.id} value={group.id}>🏘️ {group.name} ({group.city})</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                🎭 Categoría
              </label>
              <select 
                name="category"
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all hover:border-orange-300"
                defaultValue={searchParams.category || ''}
              >
                <option value="">🎪 Todas las categorías</option>
                <option value={EventCategory.MEETUP}>🍂 Meetup</option>
                <option value={EventCategory.HACKATHON}>💀 Hackathon</option>
                <option value={EventCategory.CONFERENCE}>🎭 Conferencia</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-2">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-200"
              >
                🔍 Filtrar Eventos
              </Button>
              <Link href="/events">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all"
                >
                  🧹 Limpiar Filtros
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-orange-200">
            <span className="text-sm text-gray-600 font-medium">Filtros rápidos:</span>
            <Link href="/events?category=MEETUP" className="inline-block">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer">
                🍂 Meetups
              </Badge>
            </Link>
            <Link href="/events?category=HACKATHON" className="inline-block">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors cursor-pointer">
                💀 Hackathons
              </Badge>
            </Link>
            <Link href="/events?category=CONFERENCE" className="inline-block">
              <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors cursor-pointer">
                🎭 Conferencias
              </Badge>
            </Link>
            {cities.slice(0, 3).map(city => (
              <Link key={city} href={`/events?city=${encodeURIComponent(city)}`} className="inline-block">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 transition-colors cursor-pointer">
                  📍 {city}
                </Badge>
              </Link>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = await searchParams
  const { events, total, cities, userGroups, pagination } = await getPublicEvents(resolvedSearchParams)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Navigation */}
      <PublicNav currentCategory={resolvedSearchParams.category} />
      
      {/* Enhanced Header with Day of the Dead theme */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center items-center gap-3 text-7xl mb-6 animate-pulse">
            🎃 💀 🌺 🕯️ 🎭
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
            Eventos Tech-Ofrenda
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Descubre eventos tecnológicos únicos en tu ciudad, donde la innovación se encuentra 
            con la tradición del Día de Muertos mexicano
          </p>
          
          {/* Decorative elements */}
          <div className="flex justify-center items-center gap-8 text-4xl opacity-60 mb-4">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🕯️</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🌺</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💀</span>
            <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🌺</span>
            <span className="animate-bounce" style={{ animationDelay: '0.8s' }}>🕯️</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <Suspense fallback={<div>Cargando filtros...</div>}>
          <FilterBar cities={cities} userGroups={userGroups} searchParams={resolvedSearchParams} />
        </Suspense>

        {/* Enhanced Results Summary with Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white via-orange-50/50 to-red-50/50 p-6 rounded-xl border border-orange-200 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  🎭 {total > 0 ? `${total} eventos encontrados` : 'No se encontraron eventos'}
                </h2>
                {resolvedSearchParams.city && (
                  <p className="text-lg text-gray-600 flex items-center gap-1">
                    📍 en <span className="font-semibold text-orange-700">{resolvedSearchParams.city}</span>
                  </p>
                )}
                {resolvedSearchParams.category && (
                  <p className="text-lg text-gray-600 flex items-center gap-1">
                    🎪 categoría: <span className="font-semibold text-orange-700">{resolvedSearchParams.category}</span>
                  </p>
                )}
              </div>
              
              {/* Quick Stats */}
              {events.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  <div className="text-center bg-white/80 p-3 rounded-lg border border-orange-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      ${events.reduce((sum, e) => sum + e.totalFunding, 0).toLocaleString('es-MX')}
                    </div>
                    <div className="text-xs text-gray-600">💰 Total recaudado</div>
                  </div>
                  <div className="text-center bg-white/80 p-3 rounded-lg border border-orange-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {events.reduce((sum, e) => sum + e._count.attendees, 0)}
                    </div>
                    <div className="text-xs text-gray-600">👥 Registrados</div>
                  </div>
                  <div className="text-center bg-white/80 p-3 rounded-lg border border-orange-200 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {events.reduce((sum, e) => sum + e._count.speakers, 0)}
                    </div>
                    <div className="text-xs text-gray-600">🎤 Speakers</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card className="border-orange-200 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
            <CardContent className="p-16 text-center relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-4 left-4 text-4xl opacity-10">🌺</div>
              <div className="absolute top-4 right-4 text-4xl opacity-10">🕯️</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-10">🎭</div>
              <div className="absolute bottom-4 right-4 text-4xl opacity-10">🌺</div>
              
              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-pulse">🎃💀</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No hay eventos en esta búsqueda
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Los espíritus de la tecnología no han encontrado eventos que coincidan con tus filtros. 
                  Intenta cambiar los criterios o explora todas las ofrendas digitales disponibles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/events">
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-all">
                      🔄 Ver Todos los Eventos
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold px-8 py-3">
                      🎭 Crear Mi Evento
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Enhanced Pagination with Day of the Dead theme */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 shadow-md">
                  <span className="text-sm text-gray-600 mr-2 flex items-center gap-1">
                    📄 Página:
                  </span>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={{
                        pathname: '/events',
                        query: { ...resolvedSearchParams, page: page.toString() }
                      }}
                    >
                      <Button
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        className={
                          page === pagination.page 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md' 
                            : 'border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-all'
                        }
                      >
                        {page}
                      </Button>
                    </Link>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    de {pagination.totalPages}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}