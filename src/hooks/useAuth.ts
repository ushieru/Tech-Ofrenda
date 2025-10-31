"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { hasPermission } from "@/lib/auth/permissions"

export function useAuth() {
  const { data: session, status } = useSession()

  const isAuthenticated = status === "authenticated" && !!session
  const isLoading = status === "loading"
  const user = session?.user

  const hasRole = (role: UserRole) => {
    return user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]) => {
    return user?.role ? roles.includes(user.role) : false
  }

  const isCommunityLeader = () => hasRole(UserRole.COMMUNITY_LEADER)
  const isSpeaker = () => hasRole(UserRole.SPEAKER)
  const isAttendee = () => hasRole(UserRole.ATTENDEE)
  const isCollaborator = () => hasRole(UserRole.COLLABORATOR)

  const canManageUserGroup = () => {
    return isCommunityLeader() && !!user?.ledUserGroup
  }

  const canCreateEvents = () => {
    return isCommunityLeader() && !!user?.ledUserGroup
  }

  const checkPermission = (resource: string, action: string, resourceId?: string) => {
    return hasPermission(session, resource, action, resourceId)
  }

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    isCommunityLeader,
    isSpeaker,
    isAttendee,
    isCollaborator,
    canManageUserGroup,
    canCreateEvents,
    checkPermission,
  }
}