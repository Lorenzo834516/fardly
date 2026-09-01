import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSessionToken, CUSTOMER_COOKIE } from '@/lib/customerSession';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { name, contact, birthdate } = await req.json();
  // contact puede ser un teléfono o un correo, lo distinguimos por el formato
  const isEmail = typeof contact === 'string' && contact.includes('@');

  if (!name || !contact) {
    return NextResponse.json({ error: 'Falta nombre o contacto' }, { status: 400 });
  }

  const { data: business, error: businessError } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
  }

  // Buscamos si ya existe ese cliente en ESTE negocio
  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id, full_name')
    .eq('business_id', business.id)
    .eq(isEmail ? 'email' : 'phone', contact)
    .maybeSingle();

  let customerId = existing?.id;

  if (!customerId) {
    const { data: created, error: createError } = await supabaseAdmin
      .from('customers')
      .insert({
        business_id: business.id,
        full_name: name,
        phone: isEmail ? null : contact,
        email: isEmail ? contact : null,
        birthdate: birthdate || null,
        source: 'qr',
      })
      .select('id')
      .single();

    if (createError || !created) {
      return NextResponse.json({ error: 'No se pudo registrar el cliente' }, { status: 500 });
    }
    customerId = created.id;
  }

  const token = createSessionToken({ customerId, businessId: business.id });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 año
    path: '/',
  });

  return res;
}