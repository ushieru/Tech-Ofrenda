import { UserRole, UserGroup } from "@prisma/client"
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      userGroupId: string | null
      userGroup: UserGroup | null
      ledUserGroup: UserGroup | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: UserRole
    userGroupId: string | null
    userGroup?: UserGroup | null
    ledUserGroup?: UserGroup | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole
    userGroupId: string | null
  }
}