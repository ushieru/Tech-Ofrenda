import { UserRole } from "@prisma/client"
import { Session } from "next-auth"

export interface Permission {
  resource: string
  action: string
  condition?: (session: Session, resourceId?: string) => boolean
}

export const permissions: Record<UserRole, Permission[]> = {
  [UserRole.COMMUNITY_LEADER]: [
    // User Group management
    { resource: "usergroup", action: "read" },
    { resource: "usergroup", action: "update", condition: (session, resourceId) => session.user.ledUserGroup?.id === resourceId },
    
    // Event management
    { resource: "event", action: "create", condition: (session) => !!session.user.ledUserGroup },
    { resource: "event", action: "read" },
    { resource: "event", action: "update", condition: (session, resourceId) => {
      // Can update events from their user group
      return !!session.user.ledUserGroup
    }},
    { resource: "event", action: "delete", condition: (session, resourceId) => {
      // Can delete events from their user group
      return !!session.user.ledUserGroup
    }},
    
    // Attendee management
    { resource: "attendee", action: "read" },
    { resource: "attendee", action: "create" },
    { resource: "attendee", action: "update" },
    
    // Speaker management
    { resource: "speaker", action: "read" },
    { resource: "speaker", action: "create" },
    { resource: "speaker", action: "update" },
    { resource: "speaker", action: "invite" },
    
    // Collaborator management
    { resource: "collaborator", action: "read" },
    { resource: "collaborator", action: "create" },
    { resource: "collaborator", action: "update" },
    { resource: "collaborator", action: "delete" },
    
    // Sponsor management
    { resource: "sponsor", action: "read" },
    { resource: "sponsor", action: "create" },
    { resource: "sponsor", action: "update" },
    
    // Contribution management
    { resource: "contribution", action: "read" },
    { resource: "contribution", action: "update" },
    
    // Analytics and reports
    { resource: "analytics", action: "read" },
    { resource: "report", action: "generate" },
  ],

  [UserRole.SPEAKER]: [
    // Event participation
    { resource: "event", action: "read" },
    { resource: "speaker", action: "read", condition: (session, resourceId) => session.user.id === resourceId },
    { resource: "speaker", action: "update", condition: (session, resourceId) => session.user.id === resourceId },
    { resource: "speaker", action: "apply" },
    
    // Profile management
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
  ],

  [UserRole.ATTENDEE]: [
    // Event participation
    { resource: "event", action: "read" },
    { resource: "attendee", action: "create", condition: (session, resourceId) => session.user.id === resourceId },
    { resource: "attendee", action: "read", condition: (session, resourceId) => session.user.id === resourceId },
    
    // Contributions
    { resource: "contribution", action: "create" },
    
    // Profile management
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
  ],

  [UserRole.COLLABORATOR]: [
    // Event support
    { resource: "event", action: "read" },
    { resource: "attendee", action: "read" },
    { resource: "attendee", action: "checkin" },
    
    // Limited speaker management
    { resource: "speaker", action: "read" },
    
    // Profile management
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
  ],
}

export function hasPermission(
  session: Session | null,
  resource: string,
  action: string,
  resourceId?: string
): boolean {
  if (!session?.user?.role) {
    return false
  }

  const userPermissions = permissions[session.user.role] || []
  
  const permission = userPermissions.find(
    p => p.resource === resource && p.action === action
  )

  if (!permission) {
    return false
  }

  // Check condition if it exists
  if (permission.condition) {
    return permission.condition(session, resourceId)
  }

  return true
}

export function requirePermission(
  session: Session | null,
  resource: string,
  action: string,
  resourceId?: string
): void {
  if (!hasPermission(session, resource, action, resourceId)) {
    throw new Error(`Insufficient permissions for ${action} on ${resource}`)
  }
}

// Helper function to check if user can access a user group
export function canAccessUserGroup(session: Session | null, userGroupId: string): boolean {
  if (!session?.user) {
    return false
  }

  const { role, userGroupId: userUserGroupId, ledUserGroup } = session.user

  // Community leaders can access their led user group
  if (role === UserRole.COMMUNITY_LEADER && ledUserGroup?.id === userGroupId) {
    return true
  }

  // Members can access their own user group
  if (userUserGroupId === userGroupId) {
    return true
  }

  return false
}

// Helper function to check if user can manage events
export function canManageEvents(session: Session | null): boolean {
  if (!session?.user) {
    return false
  }

  return session.user.role === UserRole.COMMUNITY_LEADER && !!session.user.ledUserGroup
}