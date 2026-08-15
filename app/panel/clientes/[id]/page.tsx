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

export default function FichaCliente() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [card, setCard] = useState<CardDetail | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
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

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/panel/clientes" style={{ color: 'var(--slate)', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Volver a clientes
        </Link>

        <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.3rem' }}>{customer.full_name ?? 'Sin nombre'}</h1>
        <p style={{ color: 'var(--slate)', marginBottom: '2rem' }}>
          {customer.phone && <span>{customer.phone}</span>}
          {customer.phone && customer.email && <span> · </span>}
          {customer.email && <span>{customer.email}</span>}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{card?.stamps_balance ?? 0}/8</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.25rem 0 0' }}>Sellos actuales</p>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{card?.total_redeemed ?? 0}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.25rem 0 0' }}>Premios canjeados</p>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{customer.visits_count ?? history.length}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.25rem 0 0' }}>Visitas totales</p>
          </div>
        </div>

        <p style={{ color: 'var(--slate)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Cliente desde {new Date(customer.created_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}
          {customer.last_visit_at && (
            <> · Última visita {new Date(customer.last_visit_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          )}
        </p>

        <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Historial de visitas</p>
        {history.length === 0 ? (
          <p style={{ color: 'var(--slate)' }}>Este cliente todavía no tiene visitas registradas.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {history.map((h, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: '0.9rem',
                }}
              >
                <span>{new Date(h.occurred_on).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ color: 'var(--slate)' }}>{h.reason ?? (h.type === 'earn' ? 'Sello agregado' : h.type)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

