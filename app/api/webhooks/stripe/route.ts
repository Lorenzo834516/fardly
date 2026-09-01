import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Stripe necesita el cuerpo "crudo" (sin parsear) para verificar la firma.
export const runtime = 'nodejs';

async function upsertSubscription(subscription: Stripe.Subscription, businessId?: string) {
  let bizId = businessId;

  if (!bizId) {
    // Si no viene en metadata (ej: eventos posteriores al primero),
    // lo buscamos por el stripe_customer_id ya guardado.
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('business_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
    bizId = existing?.business_id;
  }

  if (!bizId) return;

  const statusMap: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
  };

  // En la nueva API de Stripe, current_period_end se consulta a través de los items de la suscripción:
  const firstItem = subscription.items.data[0];
  const periodEndTimestamp = firstItem?.current_period_end ?? (subscription as any).current_period_end;
  const currentPeriodEnd = periodEndTimestamp 
    ? new Date(periodEndTimestamp * 1000).toISOString() 
    : new Date().toISOString();

  await supabaseAdmin.from('subscriptions').upsert(
    {
      business_id: bizId,
      plan: 'mensual',
      status: statusMap[subscription.status] ?? subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd,
    },
    { onConflict: 'business_id' }
  );

  // Reflejamos el estado también en businesses, para que sea fácil
  // de consultar desde el panel de admin sin hacer un join.
  const isPlanActive = statusMap[subscription.status] === 'active' || statusMap[subscription.status] === 'trialing';

  await supabaseAdmin
    .from('businesses')
    .update({ plan: isPlanActive ? 'activo' : 'inactivo' })
    .eq('id', bizId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(subscription, session.metadata?.business_id);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}