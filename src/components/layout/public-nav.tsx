'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface PublicNavProps {
  currentCategory?: string
}

export function PublicNav({ currentCategory }: PublicNavProps = {}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])

  // Fetch available cities for quick navigation
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/usergroups')
        if (response.ok) {
          const data = await response.json()
          const cityList = data.userGroups?.map((ug: any) => ug.city).filter((city: any): city is string => typeof city === 'string') || []
          const uniqueCities = [...new Set(cityList)] as string[]
          setCities(uniqueCities.slice(0, 5)) // Show top 5 cities
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }
    fetchCities()
  }, [])

  const navItems = [
    { href: '/events', label: 'Todos los Eventos', icon: '🎭', isActive: pathname === '/events' && !currentCategory },
    { href: '/usergroups', label: 'Comunidades', icon: '🏘️', isActive: pathname === '/usergroups' },
    { href: '/events?category=MEETUP', label: 'Meetups', icon: '🍂', isActive: currentCategory === 'MEETUP' },
    { href: '/events?category=HACKATHON', label: 'Hackathons', icon: '💀', isActive: currentCategory === 'HACKATHON' },
    { href: '/events?category=CONFERENCE', label: 'Conferencias', icon: '🎪', isActive: currentCategory === 'CONFERENCE' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo with Day of the Dead elements */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-1">
              <span className="text-2xl animate-pulse">🎃</span>
              <span className="text-lg">💀</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Tech-Ofrenda
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-all duration-200 flex items-center gap-1 px-3 py-2 rounded-lg border ${
                  item.isActive
                    ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-sm'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 border-transparent hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Quick City Navigation (Desktop) */}
          {cities.length > 0 && (
            <div className="hidden xl:flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Ciudades:</span>
              {cities.slice(0, 3).map((city) => (
                <Link
                  key={city}
                  href={`/events?city=${encodeURIComponent(city)}`}
                  className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors border border-orange-200"
                >
                  📍 {city}
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </Button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/events">
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all">
                🎭 Ver Eventos
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all">
                💀 Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-orange-200 pt-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-lg">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    item.isActive
                      ? 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-sm'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 border-transparent hover:border-orange-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile City Navigation */}
              {cities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs text-gray-500 font-medium mb-2 px-3">Ciudades populares:</p>
                  <div className="flex flex-wrap gap-2 px-3">
                    {cities.map((city) => (
                      <Link
                        key={city}
                        href={`/events?city=${encodeURIComponent(city)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors border border-orange-200"
                      >
                        📍 {city}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-orange-200">
                <Link href="/events" className="flex-1">
                  <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                    🎭 Ver Eventos
                  </Button>
                </Link>
                <Link href="/auth/signin" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                    💀 Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}