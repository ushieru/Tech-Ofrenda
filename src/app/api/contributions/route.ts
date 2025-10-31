import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { monetaryContributionSchema, inKindContributionSchema, contributionFilterSchema } from '@/lib/validations/contribution';
import { StripeService } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'MONETARY') {
      const validatedData = monetaryContributionSchema.parse(data);
      
      // Create Stripe payment intent
      const { clientSecret, paymentIntentId } = await StripeService.createPaymentIntent({
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        eventId: validatedData.eventId,
        donorName: validatedData.donorName,
        donorEmail: validatedData.donorEmail,
        description: validatedData.message,
      });

      // Create contribution record (unconfirmed until payment succeeds)
      const contribution = await prisma.contribution.create({
        data: {
          eventId: validatedData.eventId,
          type: 'MONETARY',
          amount: validatedData.amount,
          description: validatedData.message,
          donorName: validatedData.donorName,
          donorEmail: validatedData.donorEmail,
          stripePaymentIntentId: paymentIntentId,
          confirmed: false,
        },
      });

      return NextResponse.json({
        contribution,
        clientSecret,
        paymentIntentId,
      });

    } else if (type === 'IN_KIND') {
      const validatedData = inKindContributionSchema.parse(data);
      
      const contribution = await prisma.contribution.create({
        data: {
          eventId: validatedData.eventId,
          type: 'IN_KIND',
          amount: validatedData.estimatedValue,
          description: validatedData.description,
          donorName: validatedData.donorName,
          donorEmail: validatedData.donorEmail,
          confirmed: false, // Requires manual confirmation by community leader
        },
      });

      return NextResponse.json({ contribution });
    } else {
      return NextResponse.json(
        { error: 'Invalid contribution type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating contribution:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = contributionFilterSchema.parse({
      eventId: searchParams.get('eventId') || undefined,
      userGroupId: searchParams.get('userGroupId') || undefined,
      type: searchParams.get('type') || undefined,
      confirmed: searchParams.get('confirmed') ? searchParams.get('confirmed') === 'true' : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    const where: any = {};
    
    if (filters.eventId) {
      where.eventId = filters.eventId;
    }
    
    if (filters.userGroupId) {
      where.event = {
        userGroupId: filters.userGroupId,
      };
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.confirmed !== undefined) {
      where.confirmed = filters.confirmed;
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const contributions = await prisma.contribution.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            userGroup: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}