import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

// GET /api/usergroups/[id]/stats - Get user group statistics
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

    // Check if user has access to this group (leader or member)
    const userGroup = await prisma.userGroup.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true },
        },
      },
    })

    if (!userGroup) {
      return NextResponse.json({ error: "User group not found" }, { status: 404 })
    }

    const isLeader = userGroup.leaderId === session.user.id
    const isMember = userGroup.members.some(member => member.id === session.user.id)

    if (!isLeader && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get comprehensive statistics
    const [
      totalMembers,
      totalEvents,
      publishedEvents,
      upcomingEvents,
      completedEvents,
      totalAttendees,
      totalContributions,
      totalFunding,
      recentEvents,
      topContributors,
    ] = await Promise.all([
      // Total members count
      prisma.user.count({
        where: { userGroupId: id },
      }),

      // Total events count
      prisma.event.count({
        where: { userGroupId: id },
      }),

      // Published events count
      prisma.event.count({
        where: {
          userGroupId: id,
          status: "PUBLISHED",
        },
      }),

      // Upcoming events count
      prisma.event.count({
        where: {
          userGroupId: id,
          status: "PUBLISHED",
          date: { gte: new Date() },
        },
      }),

      // Completed events count
      prisma.event.count({
        where: {
          userGroupId: id,
          status: "COMPLETED",
        },
      }),

      // Total attendees across all events
      prisma.attendee.count({
        where: {
          event: {
            userGroupId: id,
          },
        },
      }),

      // Total contributions count
      prisma.contribution.count({
        where: {
          event: {
            userGroupId: id,
          },
        },
      }),

      // Total funding amount
      prisma.contribution.aggregate({
        where: {
          event: {
            userGroupId: id,
          },
          type: "MONETARY",
        },
        _sum: {
          amount: true,
        },
      }),

      // Recent events with details
      prisma.event.findMany({
        where: { userGroupId: id },
        include: {
          _count: {
            select: {
              attendees: true,
              speakers: true,
              contributions: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 5,
      }),

      // Top contributors
      prisma.contribution.groupBy({
        by: ["donorName"],
        where: {
          event: {
            userGroupId: id,
          },
          type: "MONETARY",
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 10,
      }),
    ])

    // Calculate monthly statistics for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await prisma.event.groupBy({
      by: ["date"],
      where: {
        userGroupId: id,
        date: { gte: sixMonthsAgo },
      },
      _count: {
        id: true,
      },
    })

    // Process monthly stats into a more usable format
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const eventsInMonth = monthlyStats.filter(stat => {
        const statDate = new Date(stat.date)
        const statMonthKey = `${statDate.getFullYear()}-${String(statDate.getMonth() + 1).padStart(2, '0')}`
        return statMonthKey === monthKey
      }).length

      return {
        month: monthKey,
        events: eventsInMonth,
      }
    })

    const stats = {
      overview: {
        totalMembers,
        totalEvents,
        publishedEvents,
        upcomingEvents,
        completedEvents,
        totalAttendees,
        totalContributions,
        totalFunding: totalFunding._sum.amount || 0,
      },
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        status: event.status,
        category: event.category,
        attendeesCount: event._count.attendees,
        speakersCount: event._count.speakers,
        contributionsCount: event._count.contributions,
      })),
      topContributors: topContributors.map(contributor => ({
        name: contributor.donorName,
        totalAmount: contributor._sum.amount || 0,
        contributionsCount: contributor._count.id,
      })),
      monthlyData,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching user group stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}