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

  function handleExportCsv() {
    const headers = ['Nombre', 'Teléfono', 'Correo', 'Sellos actuales', 'Premios canjeados', 'Última visita', 'Cliente desde'];

    const rows = filtered.map((c) => {
      const card = c.loyalty_cards?.[0];
      return [
        c.full_name ?? '',
        c.phone ?? '',
        c.email ?? '',
        String(card?.stamps_balance ?? 0),
        String(card?.total_redeemed ?? 0),
        c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('es-PA') : '',
        new Date(c.created_at).toLocaleDateString('es-PA'),
      ];
    });

    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');

    // \uFEFF al inicio para que Excel detecte acentos (UTF-8 BOM)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
      <style>{`
        .client-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .client-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.10);
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 1.75rem' }}>Clientes</h1>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate)',
                pointerEvents: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o correo..."
              style={{ width: '100%', paddingLeft: '2.75rem' }}
            />
          </div>
          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="cta-pill"
            style={{
              background: 'var(--card)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '0 1.3rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: filtered.length === 0 ? 'default' : 'pointer',
              opacity: filtered.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
        </div>

        {filtered.length === 0 && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>
              {customers.length === 0
                ? 'Todavía no tienes clientes registrados. Aparecerán aquí en cuanto alguien escanee tu QR.'
                : 'No hay clientes que coincidan con la búsqueda.'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filtered.map((c) => {
            const card = c.loyalty_cards?.[0];
            const stamps = card?.stamps_balance ?? 0;
            return (
              <Link
                key={c.id}
                href={`/panel/clientes/${c.id}`}
                className="client-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'var(--card)',
                  borderRadius: 14,
                  padding: '1.1rem 1.3rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--ink)',
                      color: 'var(--gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}
                  >
                    {(c.full_name ?? '?').trim().charAt(0).toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{c.full_name ?? 'Sin nombre'}</p>
                    <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.15rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.phone || c.email || 'Sin contacto'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 999,
                    }}
                  >
                    {stamps} / 8
                  </span>
                  <p style={{ color: 'var(--slate)', fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
                    {c.last_visit_at
                      ? new Date(c.last_visit_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })
                      : 'Sin visitas'}
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