import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const assignUserGroupSchema = z.object({
  userId: z.string(),
  userGroupId: z.string(),
  role: z.nativeEnum(UserRole).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only community leaders can assign users to user groups
    if (session.user.role !== UserRole.COMMUNITY_LEADER) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, userGroupId, role } = assignUserGroupSchema.parse(body)

    // Verify the community leader owns the user group
    const userGroup = await prisma.userGroup.findUnique({
      where: { id: userGroupId },
      include: { leader: true },
    })

    if (!userGroup || userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Cannot assign to this user group" }, { status: 403 })
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user's user group assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        userGroupId: userGroupId,
        ...(role && { role }),
      },
      include: {
        userGroup: true,
      },
    })

    return NextResponse.json({
      message: "User assigned to user group successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error assigning user to user group:", error)
    
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only community leaders can remove users from user groups
    if (session.user.role !== UserRole.COMMUNITY_LEADER) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user to verify they belong to the leader's user group
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userGroup: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the community leader owns the user group
    if (!targetUser.userGroup || targetUser.userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Cannot remove user from this user group" }, { status: 403 })
    }

    // Remove user from user group
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        userGroupId: null,
      },
    })

    return NextResponse.json({
      message: "User removed from user group successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error removing user from user group:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}