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

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Calificación inválida' }, { status: 400 });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!business || business.id !== session.businessId) {
    return NextResponse.json({ error: 'Sesión inválida para este negocio' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('reviews').insert({
    business_id: business.id,
    customer_id: session.customerId,
    rating,
    comment: comment || null,
  });

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar la reseña' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}