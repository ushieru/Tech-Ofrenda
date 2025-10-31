import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const createUserGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  city: z.string().min(1, "City is required").max(50, "City name too long"),
  leaderId: z.string().cuid("Invalid leader ID"),
})

const updateUserGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  city: z.string().min(1, "City is required").max(50, "City name too long").optional(),
  leaderId: z.string().cuid("Invalid leader ID").optional(),
})

// GET /api/usergroups - List all user groups
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const includeMembers = searchParams.get("includeMembers") === "true"

    const userGroups = await prisma.userGroup.findMany({
      where: city ? { city: { contains: city } } : undefined,
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: includeMembers ? {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        } : false,
        events: {
          select: {
            id: true,
            title: true,
            date: true,
            status: true,
          },
          orderBy: {
            date: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ userGroups })
  } catch (error) {
    console.error("Error fetching user groups:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/usergroups - Create new user group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admins or users without a user group to create new groups
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        ledUserGroup: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createUserGroupSchema.parse(body)

    // Check if city already has a user group
    const existingGroup = await prisma.userGroup.findUnique({
      where: { city: validatedData.city },
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: "A user group already exists for this city" },
        { status: 409 }
      )
    }

    // Check if the proposed leader exists and is eligible
    const proposedLeader = await prisma.user.findUnique({
      where: { id: validatedData.leaderId },
      include: {
        ledUserGroup: true,
      },
    })

    if (!proposedLeader) {
      return NextResponse.json(
        { error: "Proposed leader not found" },
        { status: 404 }
      )
    }

    if (proposedLeader.ledUserGroup) {
      return NextResponse.json(
        { error: "User is already leading another group" },
        { status: 409 }
      )
    }

    // Create the user group and update the leader's role
    const userGroup = await prisma.$transaction(async (tx) => {
      // Create the user group
      const newGroup = await tx.userGroup.create({
        data: {
          name: validatedData.name,
          city: validatedData.city,
          leaderId: validatedData.leaderId,
        },
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
      })

      // Update the leader's role and assign them to the group
      await tx.user.update({
        where: { id: validatedData.leaderId },
        data: {
          role: UserRole.COMMUNITY_LEADER,
          userGroupId: newGroup.id,
        },
      })

      return newGroup
    })

    return NextResponse.json({
      message: "User group created successfully",
      userGroup,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating user group:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}