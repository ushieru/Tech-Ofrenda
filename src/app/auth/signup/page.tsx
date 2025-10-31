"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { UserRole } from "@prisma/client"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ATTENDEE" as UserRole,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // Create user account via email sign in
      // NextAuth will create the user automatically on first sign in
      const result = await signIn("email", {
        email: formData.email,
        redirect: false,
      })

      if (result?.error) {
        setMessage("Error al crear la cuenta")
      } else {
        setMessage("Revisa tu email para activar tu cuenta")
      }
    } catch (error) {
      setMessage("Error al procesar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech-Ofrenda</h1>
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>

        {message && (
          <div className={`alert ${message.includes("Error") ? "alert-error" : "alert-success"} mb-6`}>
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Registrarse con Google
          </button>

          <div className="divider">O</div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre completo</span>
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo de cuenta</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <option value="ATTENDEE">Asistente</option>
                <option value="SPEAKER">Speaker</option>
                <option value="COMMUNITY_LEADER">Líder de Comunidad</option>
              </select>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/signin" className="link link-primary">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}