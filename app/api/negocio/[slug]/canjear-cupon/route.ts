import { NextRequest, NextResponse } from 'next/server';
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

  const { couponId } = await req.json();
  if (!couponId) {
    return NextResponse.json({ error: 'Falta el cupón' }, { status: 400 });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!business || business.id !== session.businessId) {
    return NextResponse.json({ error: 'Sesión inválida para este negocio' }, { status: 403 });
  }

  const { data: coupon } = await supabaseAdmin
    .from('coupons')
    .select('id, active, ends_at, usage_limit, usage_limit_per_customer, used_count')
    .eq('id', couponId)
    .eq('business_id', business.id)
    .single();

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'Este cupón ya no está disponible' }, { status: 400 });
  }

  if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) {
    return NextResponse.json({ error: 'Este cupón ya venció' }, { status: 400 });
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ error: 'Este cupón ya alcanzó su límite de usos' }, { status: 400 });
  }

  const { count: customerUses } = await supabaseAdmin
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', coupon.id)
    .eq('customer_id', session.customerId);

  if ((customerUses ?? 0) >= coupon.usage_limit_per_customer) {
    return NextResponse.json({ error: 'Ya usaste este cupón el máximo de veces permitido' }, { status: 400 });
  }

  const { error: redemptionError } = await supabaseAdmin.from('coupon_redemptions').insert({
    business_id: business.id,
    coupon_id: coupon.id,
    customer_id: session.customerId,
  });

  if (redemptionError) {
    return NextResponse.json({ error: 'No se pudo canjear el cupón' }, { status: 500 });
  }

  await supabaseAdmin
    .from('coupons')
    .update({ used_count: coupon.used_count + 1 })
    .eq('id', coupon.id);

  return NextResponse.json({ ok: true });
}