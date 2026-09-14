'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Business = {
  id: string;
  name: string;
  slug: string;
  business_type: string | null;
  plan: string;
  status: string;
  created_at: string;
  customerCount: number;
};

type OverviewData = {
  totals: {
    totalBusinesses: number;
    activeBusinesses: number;
    newBusinessesThisWeek: number;
    totalCustomers: number;
  };
  businesses: Business[];
};

export default function AdminPanel() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleStatus(business: Business) {
    setTogglingId(business.id);
    const newStatus = business.status === 'active' ? 'suspended' : 'active';

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    await fetch(`/api/admin/negocios/${business.id}/estado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    setTogglingId(null);
    await load();
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontWeight: 600 }}>No tienes acceso a esta sección.</p>
        <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Esta pantalla es solo para administradores de la plataforma.</p>
      </main>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Negocios totales', value: data.totals.totalBusinesses },
    { label: 'Negocios activos', value: data.totals.activeBusinesses },
    { label: 'Negocios nuevos (7 días)', value: data.totals.newBusinessesThisWeek },
    { label: 'Clientes en toda la plataforma', value: data.totals.totalCustomers },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <style>{`
        .status-toggle {
          transition: opacity 0.15s ease;
        }
        .status-toggle:hover:not(:disabled) {
          opacity: 0.75;
        }
        .business-row {
          transition: background 0.15s ease;
        }
        .business-row:hover {
          background: rgba(0,0,0,0.02);
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <span className="eyebrow" style={{ color: 'var(--stamp)' }}>Administración</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 2rem' }}>Panel de FARDLY</h1>

        {/* Métricas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.85rem',
            marginBottom: '2.5rem',
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

        {/* Lista de negocios */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '0.9rem' }}>
          TODOS LOS NEGOCIOS
        </p>

        <div style={{ background: 'var(--card)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {data.businesses.length === 0 && (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)', margin: 0 }}>Todavía no hay negocios registrados.</p>
          )}

          {data.businesses.map((b, i) => (
            <div
              key={b.id}
              className="business-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < data.businesses.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {b.name}
                  <span
                    style={{
                      marginLeft: '0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 999,
                      background: b.status === 'active' ? '#e6f4ea' : '#fde8e8',
                      color: b.status === 'active' ? '#1e7e34' : '#c0392b',
                    }}
                  >
                    {b.status === 'active' ? 'Activo' : 'Suspendido'}
                  </span>
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--slate)', fontSize: '0.82rem' }}>
                  /{b.slug} · {b.business_type ?? 'Sin tipo'} · {b.customerCount} cliente{b.customerCount !== 1 ? 's' : ''} · plan {b.plan}
                </p>
              </div>
              <button
                onClick={() => handleToggleStatus(b)}
                disabled={togglingId === b.id}
                className="status-toggle"
                style={{
                  background: 'none',
                  border: `1px solid ${b.status === 'active' ? 'var(--stamp-dark)' : 'var(--line)'}`,
                  borderRadius: 999,
                  padding: '0.4rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: b.status === 'active' ? 'var(--stamp-dark)' : 'var(--ink)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {togglingId === b.id ? '...' : b.status === 'active' ? 'Suspender' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}