import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const updateUserGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  city: z.string().min(1, "City is required").max(50, "City name too long").optional(),
  leaderId: z.string().cuid("Invalid leader ID").optional(),
})

// GET /api/usergroups/[id] - Get specific user group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userGroup = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        events: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            location: true,
            capacity: true,
            category: true,
            status: true,
            _count: {
              select: {
                attendees: true,
                speakers: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        sponsors: {
          select: {
            id: true,
            name: true,
            level: true,
            website: true,
            logo: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
            sponsors: true,
            collaborators: true,
          },
        },
      },
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    return NextResponse.json({ userGroup })
  } catch (error) {
    console.error("Error fetching user group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/usergroups/[id] - Update user group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is the leader of this group or has admin privileges
    const userGroup = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        leader: true,
      },
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateUserGroupSchema.parse(body)

    // If updating city, check for uniqueness
    if (validatedData.city && validatedData.city !== userGroup.city) {
      const existingGroup = await prisma.userGroup.findUnique({
        where: { city: validatedData.city },
      })

      if (existingGroup) {
        return NextResponse.json(
          { error: "A user group already exists for this city" },
          { status: 409 }
        )
      }
    }

    // If updating leader, validate the new leader
    if (validatedData.leaderId && validatedData.leaderId !== userGroup.leaderId) {
      const newLeader = await prisma.user.findUnique({
        where: { id: validatedData.leaderId },
        include: {
          ledUserGroup: true,
        },
      })

      if (!newLeader) {
        return NextResponse.json(
          { error: "New leader not found" },
          { status: 404 }
        )
      }

      if (newLeader.ledUserGroup && newLeader.ledUserGroup.id !== id) {
        return NextResponse.json(
          { error: "User is already leading another group" },
          { status: 409 }
        )
      }
    }

    // Update the user group
    const updatedUserGroup = await prisma.$transaction(async (tx) => {
      const updated = await tx.userGroup.update({
        where: { id },
        data: validatedData,
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

      // If leader changed, update roles
      if (validatedData.leaderId && validatedData.leaderId !== userGroup.leaderId) {
        // Update new leader's role
        await tx.user.update({
          where: { id: validatedData.leaderId },
          data: {
            role: UserRole.COMMUNITY_LEADER,
            userGroupId: id,
          },
        })

        // Update old leader's role (if they're not leading another group)
        const oldLeaderOtherGroups = await tx.userGroup.findMany({
          where: {
            leaderId: userGroup.leaderId,
            id: { not: id },
          },
        })

        if (oldLeaderOtherGroups.length === 0) {
          await tx.user.update({
            where: { id: userGroup.leaderId },
            data: {
              role: UserRole.ATTENDEE,
            },
          })
        }
      }

      return updated
    })

    return NextResponse.json({
      message: "User group updated successfully",
      userGroup: updatedUserGroup,
    })
  } catch (error) {
    console.error("Error updating user group:", error)
    
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

// DELETE /api/usergroups/[id] - Delete user group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is the leader of this group
    const userGroup = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        events: true,
        members: true,
      },
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if there are active events
    const activeEvents = userGroup.events.filter(
      event => event.status === "PUBLISHED" && event.date > new Date()
    )

    if (activeEvents.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete group with active events" },
        { status: 409 }
      )
    }

    // Delete the user group and update members
    await prisma.$transaction(async (tx) => {
      // Update all members to remove userGroupId
      await tx.user.updateMany({
        where: { userGroupId: id },
        data: { userGroupId: null },
      })

      // Update leader role if they're not leading other groups
      const otherGroups = await tx.userGroup.findMany({
        where: {
          leaderId: userGroup.leaderId,
          id: { not: id },
        },
      })

      if (otherGroups.length === 0) {
        await tx.user.update({
          where: { id: userGroup.leaderId },
          data: { role: UserRole.ATTENDEE },
        })
      }

      // Delete the user group
      await tx.userGroup.delete({
        where: { id },
      })
    })

    return NextResponse.json({
      message: "User group deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}