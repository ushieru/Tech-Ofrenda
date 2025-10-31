import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
      return NextResponse.next()
    }

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Role-based access control
    const userRole = token.role as UserRole
    const userGroupId = token.userGroupId

    // Community Leader specific routes
    if (pathname.startsWith("/dashboard/community")) {
      if (userRole !== UserRole.COMMUNITY_LEADER) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Admin/Management routes (for community leaders and collaborators)
    if (pathname.startsWith("/dashboard/manage")) {
      if (!["COMMUNITY_LEADER", "COLLABORATOR"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Speaker specific routes
    if (pathname.startsWith("/dashboard/speaker")) {
      if (!["SPEAKER", "COMMUNITY_LEADER"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // API routes protection
    if (pathname.startsWith("/api/")) {
      // Protected API routes
      const protectedApiRoutes = [
        "/api/events",
        "/api/usergroups",
        "/api/users",
        "/api/attendees",
        "/api/speakers",
        "/api/collaborators",
        "/api/sponsors",
        "/api/contributions"
      ]

      const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
      
      if (isProtectedApi && !token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Community Leader API access control
      if (pathname.includes("/usergroups") || pathname.includes("/events")) {
        // Community leaders can only access their own user group data
        if (userRole === "COMMUNITY_LEADER" && !userGroupId) {
          return NextResponse.json({ error: "No user group assigned" }, { status: 403 })
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without token
        const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"]
        const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
        
        if (isPublicRoute) {
          return true
        }

        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}