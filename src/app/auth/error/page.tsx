"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const errorMessages: Record<string, string> = {
  Configuration: "Hay un problema con la configuración del servidor.",
  AccessDenied: "No tienes permisos para acceder.",
  Verification: "El token de verificación ha expirado o ya fue usado.",
  Default: "Ha ocurrido un error durante la autenticación.",
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const message = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/signin" className="btn btn-primary w-full">
            Intentar de nuevo
          </Link>
          
          <Link href="/" className="btn btn-outline w-full">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}