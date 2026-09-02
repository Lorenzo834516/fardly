import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// Se crea solo la primera vez que realmente se usa (no al cargar
// la app), para que el build no falle si todavía no configuraste
// las variables de Stripe en este entorno.
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Falta configurar STRIPE_SECRET_KEY');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
    });
  }
  return stripeInstance;
}

// Exportamos también 'stripe' usando getter para mantener la creación diferida
export const stripe = new Proxy({} as Stripe, {
  get(_, prop: keyof Stripe) {
    return getStripe()[prop];
  },
});

// El Price ID del plan mensual que creaste en el dashboard de Stripe
export const MONTHLY_PLAN_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!;