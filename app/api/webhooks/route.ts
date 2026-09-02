import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getStripe, MONTHLY_PLAN_PRICE_ID } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'No encontramos tu negocio' }, { status: 404 });
  }

  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', business.id)
    .maybeSingle();

  const { origin } = new URL(req.url);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existingSub?.stripe_customer_id ?? undefined,
    customer_email: existingSub?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: MONTHLY_PLAN_PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${origin}/panel/suscripcion?checkout=success`,
    cancel_url: `${origin}/panel/suscripcion?checkout=cancelled`,
    metadata: { business_id: business.id },
  });

  return NextResponse.json({ url: session.url });
}