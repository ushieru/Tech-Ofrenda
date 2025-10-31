'use client'

import { useState } from 'react'
import { EventWithDetails } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AttendeeRegistrationForm } from './attendee-registration-form'
import { ContributionForm } from '@/components/contributions/contribution-form'
import { ContributionsDisplay } from '@/components/contributions/contributions-display'
import { SpeakerApplicationForm } from '@/components/speakers/speaker-application-form'
import { SponsorDisplay } from '@/components/sponsors/sponsor-display'
import { EventCategory, EventStatus } from '@prisma/client'

interface AltarDigitalProps {
  event: EventWithDetails
}

export function AltarDigital({ event }: AltarDigitalProps) {
  const [showRegistration, setShowRegistration] = useState(false)
  const [showContribution, setShowContribution] = useState(false)
  const [showSpeakerApplication, setShowSpeakerApplication] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const fundingPercentage = (event.totalFunding || 0) > 0 ? Math.min(((event.totalFunding || 0) / 10000) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header with Day of the Dead theme */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 text-6xl mb-4">
              {getCategoryEmoji(event.category)}
              <span className="text-4xl">💀</span>
              <span className="text-6xl">🎃</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                {getCategoryEmoji(event.category)} {event.category}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                📍 {event.userGroup.city}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                👥 {event.attendeeCount || 0}/{event.capacity}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
                  📅 Detalles del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">🕐 Fecha y Hora</h4>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">📍 Ubicación</h4>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">👑 Organizador</h4>
                    <p className="text-gray-600">{event.userGroup.leader.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">🏢 Comunidad</h4>
                    <p className="text-gray-600">{event.userGroup.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
                  📜 Descripción
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="prose prose-orange max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </CardContent>
            </Card>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                  <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
                    🎤 Speakers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{speaker.user.name}</h4>
                          {speaker.topic && (
                            <p className="text-sm text-gray-600">{speaker.topic}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration */}
            {event.status === EventStatus.PUBLISHED && (
              showRegistration ? (
                <AttendeeRegistrationForm
                  eventId={event.id}
                  eventTitle={event.title}
                  eventDate={event.date}
                  capacity={event.capacity}
                  currentAttendees={event.attendeeCount || 0}
                  onRegistrationSuccess={() => {
                    setShowRegistration(false)
                    // Optionally refresh the page or update the event data
                    window.location.reload()
                  }}
                />
              ) : (
                <Card className="border-orange-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                      🎫 Registro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        {event.availableSpots || 0} cupos disponibles
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        de {event.capacity} totales
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                      onClick={() => setShowRegistration(true)}
                      disabled={(event.availableSpots || 0) <= 0}
                    >
                      {(event.availableSpots || 0) > 0 ? '🎃 Registrarse Ahora' : '😔 Evento Lleno'}
                    </Button>
                  </CardContent>
                </Card>
              )
            )}

            {/* Speaker Application */}
            {event.status === EventStatus.PUBLISHED && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
                  <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
                    🎤 ¿Quieres ser Speaker?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      ¿Tienes conocimiento que compartir? ¡Aplica para ser speaker en este evento!
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                    onClick={() => setShowSpeakerApplication(true)}
                  >
                    🎯 Aplicar como Speaker
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Los organizadores revisarán tu solicitud y te contactarán
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Funding Progress */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                  💰 Ofrendas Digitales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    ${(event.totalFunding || 0).toLocaleString('es-MX')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">recaudados</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${fundingPercentage}%` }}
                  ></div>
                </div>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
                  onClick={() => setShowContribution(true)}
                >
                  🎁 Hacer una Ofrenda
                </Button>

                {/* Recent Contributions */}
                {event.contributions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Últimas Ofrendas:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {event.contributions.slice(0, 5).map((contribution) => (
                        <div key={contribution.id} className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded">
                          <span className="font-medium">{contribution.donorName}</span>
                          <span className="text-orange-600">
                            {contribution.amount ? `$${contribution.amount}` : '🎁 En especie'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Contribution Form */}
            {showContribution && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Hacer una Ofrenda Digital</h3>
                    <button
                      onClick={() => setShowContribution(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <ContributionForm
                      eventId={event.id}
                      eventTitle={event.title}
                      onSuccess={() => {
                        setShowContribution(false)
                        window.location.reload() // Refresh to show new contribution
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Speaker Application Form */}
            {showSpeakerApplication && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Aplicar como Speaker</h3>
                    <button
                      onClick={() => setShowSpeakerApplication(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <SpeakerApplicationForm
                      eventId={event.id}
                      eventTitle={event.title}
                      onSuccess={() => {
                        setShowSpeakerApplication(false)
                        // Show success message or redirect
                      }}
                      onCancel={() => setShowSpeakerApplication(false)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sponsors Display */}
        {event.sponsors.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <SponsorDisplay sponsors={event.sponsors} />
          </div>
        )}

        {/* Contributions Display */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ContributionsDisplay eventId={event.id} />
        </div>
      </div>

      {/* Footer with Day of the Dead elements */}
      <footer className="bg-gradient-to-r from-orange-800 to-red-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 text-4xl mb-4">
            🕯️ 💀 🌺 🎃 🕯️
          </div>
          <p className="text-lg mb-2">
            Celebrando la tecnología con tradición
          </p>
          <p className="text-orange-200">
            Tech-Ofrenda • Conectando comunidades tech en México
          </p>
        </div>
      </footer>
    </div>
  )
}