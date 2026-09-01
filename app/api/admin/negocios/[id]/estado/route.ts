import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyPlatformAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const adminId = await verifyPlatformAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { data: businesses } = await supabaseAdmin
    .from('businesses')
    .select('id, name, slug, business_type, plan, status, created_at')
    .order('created_at', { ascending: false });

  const businessIds = (businesses ?? []).map((b) => b.id);

  // Conteo de clientes por negocio, en una sola consulta
  const { data: customerCounts } = await supabaseAdmin
    .from('customers')
    .select('business_id')
    .in('business_id', businessIds.length ? businessIds : ['00000000-0000-0000-0000-000000000000']);

  const countByBusiness: Record<string, number> = {};
  (customerCounts ?? []).forEach((c) => {
    countByBusiness[c.business_id] = (countByBusiness[c.business_id] ?? 0) + 1;
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const businessesWithStats = (businesses ?? []).map((b) => ({
    ...b,
    customerCount: countByBusiness[b.id] ?? 0,
  }));

  const totalBusinesses = businesses?.length ?? 0;
  const activeBusinesses = (businesses ?? []).filter((b) => b.status === 'active').length;
  const newBusinessesThisWeek = (businesses ?? []).filter((b) => new Date(b.created_at) >= sevenDaysAgo).length;
  const totalCustomers = (customerCounts ?? []).length;

  return NextResponse.json({
    totals: {
      totalBusinesses,
      activeBusinesses,
      newBusinessesThisWeek,
      totalCustomers,
    },
    businesses: businessesWithStats,
  });
}

// Añade esta función al final de tu archivo route.ts

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verificar autenticación de administrador
  const adminId = await verifyPlatformAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    // 2. Obtener el nuevo estado desde el cuerpo de la petición
    const { status } = await req.json();

    // 3. Actualizar el registro en Supabase usando el id de la URL
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, business: data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}