import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/db/prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        // Get user with userGroup information
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userGroup: true,
            ledUserGroup: true,
          },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.userGroupId = dbUser.userGroupId
          session.user.userGroup = dbUser.userGroup
          session.user.ledUserGroup = dbUser.ledUserGroup
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userGroupId = user.userGroupId
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      // Set default role for new users
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.ATTENDEE },
      })
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
}