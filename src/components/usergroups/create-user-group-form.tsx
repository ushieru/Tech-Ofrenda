"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

const createUserGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Nombre muy largo"),
  city: z.string().min(1, "La ciudad es requerida").max(50, "Nombre de ciudad muy largo"),
  leaderId: z.string().cuid("ID de líder inválido"),
})

type CreateUserGroupData = z.infer<typeof createUserGroupSchema>

interface CreateUserGroupFormProps {
  currentUserId: string
  onSuccess?: () => void
}

export function CreateUserGroupForm({ currentUserId, onSuccess }: CreateUserGroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserGroupData>({
    resolver: zodResolver(createUserGroupSchema),
    defaultValues: {
      leaderId: currentUserId,
    },
  })

  const onSubmit = async (data: CreateUserGroupData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/usergroups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el grupo")
      }

      reset()
      onSuccess?.()
      router.push(`/dashboard/usergroup/${result.userGroup.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear User Group</CardTitle>
        <CardDescription>
          Crea un nuevo grupo de usuarios para tu ciudad y conviértete en el Líder de Comunidad
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del Grupo
            </label>
            <Input
              id="name"
              placeholder="ej. Tech Community CDMX"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              Ciudad
            </label>
            <Input
              id="city"
              placeholder="ej. Ciudad de México"
              {...register("city")}
              disabled={isLoading}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-sm text-orange-800">
              <strong>Nota:</strong> Al crear este grupo, te convertirás automáticamente en el 
              Líder de Comunidad y podrás gestionar eventos, miembros y patrocinadores.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear User Group
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}