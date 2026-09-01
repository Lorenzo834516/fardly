import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';

// Nombre de la plantilla que debes crear y aprobar en Meta Business
// Manager antes de que esto funcione de verdad. Mientras no exista,
// el envío va a fallar con un error claro (no de forma silenciosa).
const BIRTHDAY_TEMPLATE_NAME = 'feliz_cumpleanos';

export async function GET(req: NextRequest) {
  // Protección: solo Vercel Cron (o quien tenga el secreto) puede llamar esto.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Negocios que ya conectaron su WhatsApp
  const { data: businesses } = await supabaseAdmin
    .from('businesses')
    .select('id, name, whatsapp_phone_number_id, whatsapp_access_token')
    .not('whatsapp_phone_number_id', 'is', null)
    .not('whatsapp_access_token', 'is', null);

  const results: { business: string; customer: string; status: string }[] = [];

  for (const business of businesses ?? []) {
    // Todos los clientes de este negocio con cumpleaños hoy
    const { data: customers } = await supabaseAdmin
      .from('customers')
      .select('id, full_name, phone, birthdate')
      .eq('business_id', business.id)
      .not('phone', 'is', null)
      .not('birthdate', 'is', null);

    const birthdayCustomers = (customers ?? []).filter((c) => {
      if (!c.birthdate) return false;
      const bd = new Date(c.birthdate + 'T00:00:00');
      return bd.getMonth() + 1 === month && bd.getDate() === day;
    });

    for (const customer of birthdayCustomers) {
      try {
        await sendWhatsAppTemplate({
          phoneNumberId: business.whatsapp_phone_number_id!,
          accessToken: business.whatsapp_access_token!,
          to: customer.phone!.replace(/\D/g, ''), // solo números
          templateName: BIRTHDAY_TEMPLATE_NAME,
          bodyParams: [customer.full_name ?? 'cliente', business.name],
        });
        results.push({ business: business.name, customer: customer.full_name ?? customer.id, status: 'enviado' });
      } catch (err) {
        results.push({
          business: business.name,
          customer: customer.full_name ?? customer.id,
          status: 'error: ' + (err instanceof Error ? err.message : 'desconocido'),
        });
      }
    }
  }

  return NextResponse.json({ checked: businesses?.length ?? 0, sent: results });
}