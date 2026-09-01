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