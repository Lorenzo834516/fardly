import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifySessionToken, CUSTOMER_COOKIE } from '@/lib/customerSession';
import { createSaveToWalletLink } from '@/lib/googleWallet';

const META_SELLOS = 8;

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = verifySessionToken(req.cookies.get(CUSTOMER_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ error: 'No identificado. Regístrate primero.' }, { status: 401 });
  }

  const { data: business } = await supabaseAdmin
    .from('businesses')
    .select('id, name, logo_url, brand_color')
    .eq('slug', params.slug)
    .single();

  if (!business || business.id !== session.businessId) {
    return NextResponse.json({ error: 'Sesión inválida para este negocio' }, { status: 403 });
  }

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('full_name')
    .eq('id', session.customerId)
    .single();

  const { data: card } = await supabaseAdmin
    .from('loyalty_cards')
    .select('stamps_balance')
    .eq('business_id', business.id)
    .eq('customer_id', session.customerId)
    .maybeSingle();

  try {
    const link = await createSaveToWalletLink(
      {
        id: business.id,
        name: business.name,
        logoUrl: business.logo_url,
        brandColor: business.brand_color,
      },
      {
        customerId: session.customerId,
        customerName: customer?.full_name ?? 'Cliente',
        stamps: card?.stamps_balance ?? 0,
        metaStamps: META_SELLOS,
      }
    );

    return NextResponse.json({ link });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'No se pudo generar el pase de Google Wallet' }, { status: 500 });
  }
}