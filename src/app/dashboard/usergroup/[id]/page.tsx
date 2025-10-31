import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import { CommunityLeaderDashboard } from "@/components/usergroups/community-leader-dashboard"

async function getUserGroup(id: string) {
  return await prisma.userGroup.findUnique({
    where: { id },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
  })
}

interface UserGroupDashboardPageProps {
  params: Promise<{ id: string }>
}

export default async function UserGroupDashboardPage({ params }: UserGroupDashboardPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userGroup = await getUserGroup(id)

  if (!userGroup) {
    notFound()
  }

  // Check if user is the leader of this group
  if (userGroup.leaderId !== session.user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CommunityLeaderDashboard 
          userGroup={userGroup}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  )
}