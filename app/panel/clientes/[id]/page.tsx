'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type CustomerDetail = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  last_visit_at: string | null;
  visits_count: number | null;
  tags: string[] | null;
};

type CardDetail = {
  id: string;
  stamps_balance: number;
  total_redeemed: number;
};

type HistoryRow = {
  occurred_on: string;
  type: string;
  amount: number;
  reason: string | null;
};

type CouponRedemptionRow = {
  created_at: string;
  coupons: {
    code: string;
    description: string | null;
    type: 'percentage' | 'fixed' | 'free_item';
    value: number | null;
  } | null;
};

export default function FichaCliente() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [card, setCard] = useState<CardDetail | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: customerRow } = await supabase
        .from('customers')
        .select('id, full_name, phone, email, created_at, last_visit_at, visits_count, tags')
        .eq('id', id)
        .single();

      setCustomer(customerRow);

      const { data: cardRow } = await supabase
        .from('loyalty_cards')
        .select('id, stamps_balance, total_redeemed')
        .eq('customer_id', id)
        .maybeSingle();

      setCard(cardRow);

      if (cardRow) {
        const { data: historyRows } = await supabase
          .from('points_transactions')
          .select('occurred_on, type, amount, reason')
          .eq('card_id', cardRow.id)
          .order('occurred_on', { ascending: false });

        setHistory(historyRows ?? []);
      }

      const { data: redemptionRows } = await supabase
        .from('coupon_redemptions')
        .select('created_at, coupons(code, description, type, value)')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

      setCouponRedemptions((redemptionRows as unknown as CouponRedemptionRow[]) ?? []);

      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No encontramos este cliente.</p>
      </main>
    );
  }

  const stamps = card?.stamps_balance ?? 0;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link
          href="/panel/clientes"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1.5rem' }}
        >
          ← Volver a clientes
        </Link>

        {/* Encabezado con avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--ink)',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.3rem',
              flexShrink: 0,
            }}
          >
            {(customer.full_name ?? '?').trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{customer.full_name ?? 'Sin nombre'}</h1>
            <p style={{ color: 'var(--slate)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
              {customer.phone && <span>{customer.phone}</span>}
              {customer.phone && customer.email && <span> · </span>}
              {customer.email && <span>{customer.email}</span>}
            </p>
          </div>
        </div>

        {/* Tarjeta de progreso, mismo estilo que el QR del panel */}
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 18, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: '1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: i < stamps ? 'var(--gold)' : 'transparent',
                  border: '2px solid var(--gold)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{stamps}/8</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,248,240,0.7)', margin: '0.2rem 0 0' }}>Sellos actuales</p>
            </div>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{card?.total_redeemed ?? 0}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,248,240,0.7)', margin: '0.2rem 0 0' }}>Premios</p>
            </div>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{customer.visits_count ?? history.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,248,240,0.7)', margin: '0.2rem 0 0' }}>Visitas</p>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--slate)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
          Cliente desde {new Date(customer.created_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}
          {customer.last_visit_at && (
            <> · Última visita {new Date(customer.last_visit_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          )}
        </p>

        {/* Historial */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '0.9rem' }}>
          HISTORIAL DE VISITAS
        </p>
        {history.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>Este cliente todavía no tiene visitas registradas.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '0.5rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: i < history.length - 1 ? '1px solid var(--line)' : 'none',
                  fontSize: '0.9rem',
                }}
              >
                <span>{new Date(h.occurred_on).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ color: 'var(--slate)' }}>{h.reason ?? (h.type === 'earn' ? 'Sello agregado' : h.type)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cupones canjeados */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', margin: '1.75rem 0 0.9rem' }}>
          CUPONES CANJEADOS
        </p>
        {couponRedemptions.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>Este cliente todavía no ha canjeado ningún cupón.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 14, padding: '0.5rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {couponRedemptions.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: i < couponRedemptions.length - 1 ? '1px solid var(--line)' : 'none',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: 'var(--ink)',
                      color: 'var(--gold)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      marginRight: '0.6rem',
                    }}
                  >
                    {r.coupons?.code ?? '—'}
                  </span>
                  <span style={{ color: 'var(--slate)' }}>
                    {r.coupons?.type === 'percentage' && `${r.coupons.value}% de descuento`}
                    {r.coupons?.type === 'fixed' && `$${r.coupons.value} de descuento`}
                    {r.coupons?.type === 'free_item' && 'Producto gratis'}
                  </span>
                </div>
                <span style={{ color: 'var(--slate)', fontSize: '0.82rem' }}>
                  {new Date(r.created_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}