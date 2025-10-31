import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params
    const { confirmed } = await request.json();
    
    if (typeof confirmed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid confirmed value' },
        { status: 400 }
      );
    }

    // Get the contribution with event and user group info
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            userGroup: {
              select: {
                leaderId: true,
              },
            },
          },
        },
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    // Check if user is the community leader of the event's user group
    if (contribution.event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only community leaders can confirm contributions' },
        { status: 403 }
      );
    }

    // Update contribution confirmation status
    const updatedContribution = await prisma.contribution.update({
      where: { id },
      data: { confirmed },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ contribution: updatedContribution });
  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params

    // Get the contribution with event and user group info
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            userGroup: {
              select: {
                leaderId: true,
              },
            },
          },
        },
      },
    });

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    // Check if user is the community leader of the event's user group
    if (contribution.event.userGroup.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only community leaders can delete contributions' },
        { status: 403 }
      );
    }

    await prisma.contribution.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}