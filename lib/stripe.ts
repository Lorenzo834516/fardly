import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-08-26.dahlia',
});

// El Price ID del plan mensual que creaste en el dashboard de Stripe
// (Product catalog → tu producto → Pricing). Empieza con "price_".
export const MONTHLY_PLAN_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!;