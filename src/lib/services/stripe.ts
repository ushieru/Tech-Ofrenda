import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  eventId: string;
  donorName: string;
  donorEmail?: string;
  description?: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export class StripeService {
  static async createPaymentIntent({
    amount,
    currency = 'mxn',
    eventId,
    donorName,
    donorEmail,
    description
  }: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          eventId,
          donorName,
          donorEmail: donorEmail || '',
          type: 'monetary_contribution'
        },
        description: description || `Ofrenda Digital para evento ${eventId}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  static async handleWebhook(
    body: string,
    signature: string,
    webhookSecret: string
  ): Promise<Stripe.Event> {
    try {
      return stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }
}