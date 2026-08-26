'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type DashboardData = {
  totalCustomers: number;
  newCustomersThisWeek: number;
  stampsThisWeek: number;
  rewardsRedeemed: number;
  couponsRedeemed: number;
  visitsByDay: { date: string; count: number }[];
};

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function PanelDashboard() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }
      setBusinessName(biz.name);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoIso = sevenDaysAgo.toISOString();
      const sevenDaysAgoDate = sevenDaysAgo.toISOString().slice(0, 10);

      const [
        { count: totalCustomers },
        { count: newCustomersThisWeek },
        { data: earnRows },
        { data: cardsRows },
        { count: couponsRedeemed },
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', sevenDaysAgoIso),
        supabase.from('points_transactions').select('occurred_on').eq('business_id', biz.id).eq('type', 'earn').gte('occurred_on', sevenDaysAgoDate),
        supabase.from('loyalty_cards').select('total_redeemed').eq('business_id', biz.id),
        supabase.from('coupon_redemptions').select('id', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', sevenDaysAgoIso),
      ]);

      const days = lastNDays(7);
      const visitsByDay = days.map((date) => ({
        date,
        count: (earnRows ?? []).filter((r) => r.occurred_on === date).length,
      }));

      const rewardsRedeemed = (cardsRows ?? []).reduce((sum, c) => sum + (c.total_redeemed ?? 0), 0);

      setData({
        totalCustomers: totalCustomers ?? 0,
        newCustomersThisWeek: newCustomersThisWeek ?? 0,
        stampsThisWeek: (earnRows ?? []).length,
        rewardsRedeemed,
        couponsRedeemed: couponsRedeemed ?? 0,
        visitsByDay,
      });

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No encontramos un negocio asociado a tu cuenta.</p>
      </main>
    );
  }

  const maxVisits = Math.max(...data.visitsByDay.map((d) => d.count), 1);

  const stats = [
    { label: 'Clientes totales', value: data.totalCustomers },
    { label: 'Clientes nuevos (7 días)', value: data.newCustomersThisWeek },
    { label: 'Sellos esta semana', value: data.stampsThisWeek },
    { label: 'Premios canjeados', value: data.rewardsRedeemed },
    { label: 'Cupones canjeados (7 días)', value: data.couponsRedeemed },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">{businessName}</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 2rem' }}>Dashboard</h1>

        {/* Tarjetas de métricas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.85rem',
            marginBottom: '2rem',
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--card)',
                borderRadius: 14,
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{s.value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.3rem 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Gráfica de visitas últimos 7 días */}
        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 18,
            padding: '1.75rem',
          }}
        >
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Últimos 7 días</span>
          <p style={{ fontWeight: 600, margin: '0.4rem 0 1.5rem' }}>Visitas por día (sellos otorgados)</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 140 }}>
            {data.visitsByDay.map((d) => {
              const heightPct = (d.count / maxVisits) * 100;
              const dayLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('es-PA', { weekday: 'short' });
              return (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(heightPct, d.count > 0 ? 8 : 2)}%`,
                        background: 'var(--gold)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                      title={`${d.count} visitas`}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,248,240,0.6)', textTransform: 'capitalize' }}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}