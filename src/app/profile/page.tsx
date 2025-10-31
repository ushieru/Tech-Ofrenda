"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "@prisma/client"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ATTENDEE" as UserRole,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || "ATTENDEE",
      })
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage("Perfil actualizado correctamente")
        // Update the session
        await update()
      } else {
        setMessage("Error al actualizar el perfil")
      }
    } catch (error) {
      setMessage("Error al procesar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <button
              onClick={handleSignOut}
              className="btn btn-outline btn-error"
            >
              Cerrar Sesión
            </button>
          </div>

          {message && (
            <div className={`alert ${message.includes("Error") ? "alert-error" : "alert-success"} mb-6`}>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Nombre completo</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={formData.email}
                disabled
              />
              <label className="label">
                <span className="label-text-alt">El email no se puede cambiar</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Rol</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <option value="ATTENDEE">Asistente</option>
                <option value="SPEAKER">Speaker</option>
                <option value="COMMUNITY_LEADER">Líder de Comunidad</option>
                <option value="COLLABORATOR">Colaborador</option>
              </select>
            </div>

            {session.user.userGroup && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">User Group</span>
                </label>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="font-medium">{session.user.userGroup.name}</p>
                  <p className="text-sm text-gray-600">{session.user.userGroup.city}</p>
                </div>
              </div>
            )}

            {session.user.ledUserGroup && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Lideras el User Group</span>
                </label>
                <div className="bg-primary bg-opacity-10 p-4 rounded-lg border border-primary border-opacity-20">
                  <p className="font-medium text-primary">{session.user.ledUserGroup.name}</p>
                  <p className="text-sm text-primary-focus">{session.user.ledUserGroup.city}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className={`btn btn-primary flex-1 ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
              
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="btn btn-outline flex-1"
              >
                Volver al Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}