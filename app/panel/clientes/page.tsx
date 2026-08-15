'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type CustomerRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  last_visit_at: string | null;
  visits_count: number | null;
  created_at: string;
  loyalty_cards: { stamps_balance: number; total_redeemed: number }[] | null;
};

export default function PanelClientes() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }

      const { data: rows } = await supabase
        .from('customers')
        .select('id, full_name, phone, email, last_visit_at, visits_count, created_at, loyalty_cards(stamps_balance, total_redeemed)')
        .eq('business_id', biz.id)
        .order('last_visit_at', { ascending: false, nullsFirst: false });

      setCustomers((rows as CustomerRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.full_name ?? '').toLowerCase().includes(term) ||
      (c.phone ?? '').toLowerCase().includes(term) ||
      (c.email ?? '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 1.5rem' }}>Clientes</h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o correo..."
          style={{ width: '100%', marginBottom: '1.5rem' }}
        />

        {filtered.length === 0 && (
          <p style={{ color: 'var(--slate)' }}>
            {customers.length === 0
              ? 'Todavía no tienes clientes registrados. Aparecerán aquí en cuanto alguien escanee tu QR.'
              : 'No hay clientes que coincidan con la búsqueda.'}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map((c) => {
            const card = c.loyalty_cards?.[0];
            return (
              <Link
                key={c.id}
                href={`/panel/clientes/${c.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--card)',
                  borderRadius: 12,
                  padding: '1rem 1.25rem',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{c.full_name ?? 'Sin nombre'}</p>
                  <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                    {c.phone || c.email || 'Sin contacto'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{card?.stamps_balance ?? 0} / 8 sellos</p>
                  <p style={{ color: 'var(--slate)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
                    {c.last_visit_at
                      ? `Última visita: ${new Date(c.last_visit_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}`
                      : 'Sin visitas aún'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}


