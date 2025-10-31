import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
})

const removeMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
})

// POST /api/usergroups/[id]/members - Add member to user group
export async function POST(
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
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = addMemberSchema.parse(body)

    // Check if user exists and is not already in a group
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      include: {
        userGroup: true,
        ledUserGroup: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.userGroupId) {
      return NextResponse.json(
        { error: "User is already a member of another group" },
        { status: 409 }
      )
    }

    if (user.ledUserGroup) {
      return NextResponse.json(
        { error: "User is leading another group" },
        { status: 409 }
      )
    }

    // Add user to the group
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        userGroupId: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "Member added successfully",
      member: updatedUser,
    })
  } catch (error) {
    console.error("Error adding member:", error)
    
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

// DELETE /api/usergroups/[id]/members - Remove member from user group
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
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    if (userGroup.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = removeMemberSchema.parse(body)

    // Cannot remove the leader
    if (validatedData.userId === userGroup.leaderId) {
      return NextResponse.json(
        { error: "Cannot remove the group leader" },
        { status: 409 }
      )
    }

    // Check if user is actually a member of this group
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.userGroupId !== id) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 409 }
      )
    }

    // Remove user from the group
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        userGroupId: null,
      },
    })

    return NextResponse.json({
      message: "Member removed successfully",
    })
  } catch (error) {
    console.error("Error removing member:", error)
    
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