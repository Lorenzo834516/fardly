import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken, CUSTOMER_COOKIE } from '@/lib/customerSession';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = verifySessionToken(req.cookies.get(CUSTOMER_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ registered: false });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!business || business.id !== session.businessId) {
    return NextResponse.json({ registered: false });
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('full_name')
    .eq('id', session.customerId)
    .single();

  const { data: card } = await supabaseAdmin
    .from('loyalty_cards')
    .select('id, stamps_balance, total_redeemed')
    .eq('business_id', business.id)
    .eq('customer_id', session.customerId)
    .maybeSingle();

  if (!card) {
    return NextResponse.json({
      registered: true,
      name: customer?.full_name ?? null,
      stamps: 0,
      totalRedeemed: 0,
      history: [],
    });
  }

  const { data: history } = await supabaseAdmin
    .from('points_transactions')
    .select('occurred_on, type, amount')
    .eq('card_id', card.id)
    .order('occurred_on', { ascending: false })
    .limit(30);

  return NextResponse.json({
    registered: true,
    name: customer?.full_name ?? null,
    stamps: card.stamps_balance,
    totalRedeemed: card.total_redeemed,
    history: history ?? [],
  });
}