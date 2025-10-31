export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'mxn',
  country: 'MX',
  locale: 'es-MX',
  predefinedAmounts: [50, 100, 250, 500, 1000, 2500],
  maxAmount: 100000, // $100,000 MXN
  minAmount: 1, // $1 MXN
} as const;

export const formatCurrency = (amount: number, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
};