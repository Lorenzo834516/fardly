import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';

// Nombre de la plantilla que debes crear y aprobar en Meta Business
// Manager. Estructura sugerida: "Hola {{1}}, te extrañamos en {{2}}.
// {{3}}" (el tercer parámetro es el incentivo que escribe el dueño).
const WINBACK_TEMPLATE_NAME = 'te_extranamos';

export async function POST(req: NextRequest) {
  // Verifica que quien llama es el dueño autenticado (no un cliente).
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
    .select('id, name, whatsapp_phone_number_id, whatsapp_access_token')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'No encontramos tu negocio' }, { status: 404 });
  }

  if (!business.whatsapp_phone_number_id || !business.whatsapp_access_token) {
    return NextResponse.json({ error: 'Todavía no conectaste tu WhatsApp (Panel → WhatsApp)' }, { status: 400 });
  }

  const { customerIds, incentiveText } = await req.json();
  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return NextResponse.json({ error: 'No seleccionaste ningún cliente' }, { status: 400 });
  }

  const { data: customers } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, phone')
    .eq('business_id', business.id)
    .in('id', customerIds);

  const results: { customer: string; status: string }[] = [];

  for (const customer of customers ?? []) {
    if (!customer.phone) {
      results.push({ customer: customer.full_name ?? customer.id, status: 'sin teléfono, se omitió' });
      continue;
    }

    try {
      await sendWhatsAppTemplate({
        phoneNumberId: business.whatsapp_phone_number_id,
        accessToken: business.whatsapp_access_token,
        to: customer.phone.replace(/\D/g, ''),
        templateName: WINBACK_TEMPLATE_NAME,
        bodyParams: [customer.full_name ?? 'cliente', business.name, incentiveText || '¡Vuelve pronto!'],
      });

      await supabaseAdmin.from('campaign_messages').insert({
        business_id: business.id,
        customer_id: customer.id,
        campaign_type: 'inactive',
        message_preview: incentiveText || '¡Vuelve pronto!',
      });

      results.push({ customer: customer.full_name ?? customer.id, status: 'enviado' });
    } catch (err) {
      results.push({
        customer: customer.full_name ?? customer.id,
        status: 'error: ' + (err instanceof Error ? err.message : 'desconocido'),
      });
    }
  }

  return NextResponse.json({ results });
}