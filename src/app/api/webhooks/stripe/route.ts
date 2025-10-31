import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeService } from '@/lib/services/stripe';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const event = await StripeService.handleWebhook(body, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { eventId, donorName, donorEmail } = paymentIntent.metadata;
    
    if (!eventId || !donorName) {
      console.error('Missing required metadata in payment intent');
      return;
    }

    // Find and update the contribution using payment intent ID
    const contribution = await prisma.contribution.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
        type: 'MONETARY',
        confirmed: false,
      },
    });

    if (contribution) {
      await prisma.contribution.update({
        where: { id: contribution.id },
        data: { 
          confirmed: true,
          amount: paymentIntent.amount / 100, // Convert from cents
        },
      });
      
      console.log(`Payment confirmed for contribution ${contribution.id}`);
    } else {
      console.error('Could not find matching contribution for payment intent');
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { eventId, donorName, donorEmail } = paymentIntent.metadata;
    
    console.log(`Payment failed for event ${eventId}, donor: ${donorName}`);
    
    // Optionally, you could delete the unconfirmed contribution or mark it as failed
    // For now, we'll just log it
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}