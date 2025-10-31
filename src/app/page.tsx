import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicNav } from '@/components/layout/public-nav'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center items-center gap-4 text-8xl mb-8">
            🎃 💀 🌺 🎭 🕯️
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Tech-Ofrenda
          </h1>
          
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Celebra la tecnología con tradición. Plataforma de gestión de eventos comunitarios 
            inspirada en el Día de Muertos mexicano.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 text-lg">
                🎃 Explorar Eventos
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 py-4 text-lg">
                💀 Crear Comunidad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            ¿Qué es Tech-Ofrenda?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Una plataforma única que combina la gestión moderna de eventos tecnológicos 
            con la rica tradición cultural del Día de Muertos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🎭</div>
              <CardTitle className="text-xl text-orange-800">Eventos Únicos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Crea meetups, hackathons y conferencias con temática del Día de Muertos. 
                Cada evento tiene su propio "Altar Digital" único.
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <CardTitle className="text-xl text-orange-800">Ofrendas Digitales</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Sistema de fondeo comunitario donde patrocinadores pueden hacer 
                "ofrendas" monetarias o en especie para apoyar eventos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏘️</div>
              <CardTitle className="text-xl text-orange-800">Comunidades Locales</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Organiza por ciudades con líderes de comunidad. Cada User Group 
                tiene autonomía para crear y gestionar sus propios eventos.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Events Preview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              🎭 Eventos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre los próximos eventos tecnológicos en tu ciudad
            </p>
          </div>
          
          {/* Enhanced Quick Category Navigation */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link href="/events?category=MEETUP">
              <Button 
                variant="outline" 
                className="border-amber-300 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 flex items-center gap-2 px-6 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                🍂 Meetups
                <span className="text-sm opacity-70">Encuentros casuales</span>
              </Button>
            </Link>
            <Link href="/events?category=HACKATHON">
              <Button 
                variant="outline" 
                className="border-purple-300 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-400 flex items-center gap-2 px-6 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                💀 Hackathons
                <span className="text-sm opacity-70">Competencias intensas</span>
              </Button>
            </Link>
            <Link href="/events?category=CONFERENCE">
              <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-400 flex items-center gap-2 px-6 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                🎭 Conferencias
                <span className="text-sm opacity-70">Eventos formales</span>
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/events">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3">
                🎃 Ver Todos los Eventos
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-8 text-center border border-orange-200">
          <div className="text-4xl mb-4">🌺</div>
          <h3 className="text-2xl font-bold text-orange-800 mb-4">
            ¿Listo para crear tu comunidad tech?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Únete a Tech-Ofrenda y comienza a organizar eventos tecnológicos únicos 
            en tu ciudad, honrando nuestras tradiciones mientras construimos el futuro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3">
                🎃 Comenzar Ahora
              </Button>
            </Link>
            <Link href="/usergroups">
              <Button size="lg" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 font-bold px-8 py-3">
                🏘️ Ver Comunidades
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-800 to-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 text-4xl mb-6">
            🕯️ 💀 🌺 🎃 🕯️
          </div>
          <h3 className="text-2xl font-bold mb-4">Tech-Ofrenda</h3>
          <p className="text-orange-200 mb-6 max-w-2xl mx-auto">
            Conectando comunidades tecnológicas a través de México, 
            celebrando nuestras tradiciones mientras construimos el futuro digital.
          </p>
          <div className="flex justify-center gap-6 text-sm text-orange-200">
            <Link href="/events" className="hover:text-white transition-colors">
              Eventos
            </Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Crear Cuenta
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
