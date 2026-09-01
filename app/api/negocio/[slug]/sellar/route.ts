import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken, CUSTOMER_COOKIE } from '@/lib/customerSession';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = verifySessionToken(req.cookies.get(CUSTOMER_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ error: 'No identificado. Regístrate primero.' }, { status: 401 });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!business || business.id !== session.businessId) {
    return NextResponse.json({ error: 'Sesión inválida para este negocio' }, { status: 403 });
  }

  // Busca o crea la tarjeta de fidelidad del cliente en este negocio
  let { data: card } = await supabaseAdmin
    .from('loyalty_cards')
    .select('id, stamps_balance')
    .eq('business_id', business.id)
    .eq('customer_id', session.customerId)
    .maybeSingle();

  if (!card) {
    const { data: createdCard, error: cardError } = await supabaseAdmin
      .from('loyalty_cards')
      .insert({
        business_id: business.id,
        customer_id: session.customerId,
        qr_code: randomUUID(),
      })
      .select('id, stamps_balance')
      .single();

    if (cardError || !createdCard) {
      return NextResponse.json({ error: 'No se pudo crear la tarjeta' }, { status: 500 });
    }
    card = createdCard;
  }

  const { error: stampError } = await supabaseAdmin.from('points_transactions').insert({
    business_id: business.id,
    card_id: card.id,
    type: 'earn',
    amount: 1,
    reason: 'Visita escaneando QR',
  });

  if (stampError) {
    // 23505 = violación de restricción única -> ya tenía sello hoy
    if (stampError.code === '23505') {
      return NextResponse.json({ alreadyStampedToday: true, stamps: card.stamps_balance });
    }
    return NextResponse.json({ error: 'No se pudo registrar el sello' }, { status: 500 });
  }

  const { data: updatedCard } = await supabaseAdmin
    .from('loyalty_cards')
    .select('stamps_balance')
    .eq('id', card.id)
    .single();

  const rewardJustEarned = (updatedCard?.stamps_balance ?? 0) === 0 && card.stamps_balance > 0;

  return NextResponse.json({
    alreadyStampedToday: false,
    stamps: updatedCard?.stamps_balance ?? 0,
    rewardJustEarned,
  });
}