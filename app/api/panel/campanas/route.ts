'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type CustomerRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  last_visit_at: string | null;
  created_at: string;
};

type SentRow = { customer_id: string; created_at: string };

const UMBRALES = [
  { value: 15, label: '15 días sin visitar' },
  { value: 30, label: '30 días sin visitar' },
  { value: 60, label: '60 días sin visitar' },
  { value: 90, label: '90 días sin visitar' },
];

export default function PanelCampanas() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [lastSentByCustomer, setLastSentByCustomer] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [incentiveText, setIncentiveText] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

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

      const [{ data: rows }, { data: sentRows }] = await Promise.all([
        supabase
          .from('customers')
          .select('id, full_name, phone, last_visit_at, created_at')
          .eq('business_id', biz.id)
          .not('phone', 'is', null),
        supabase
          .from('campaign_messages')
          .select('customer_id, created_at')
          .eq('business_id', biz.id)
          .eq('campaign_type', 'inactive')
          .order('created_at', { ascending: false }),
      ]);

      setCustomers(rows ?? []);

      const lastSent: Record<string, string> = {};
      (sentRows ?? []).forEach((r: SentRow) => {
        if (!lastSent[r.customer_id]) lastSent[r.customer_id] = r.created_at;
      });
      setLastSentByCustomer(lastSent);

      setLoading(false);
    }
    load();
  }, [router]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const inactiveCustomers = customers.filter((c) => {
    const reference = c.last_visit_at ?? c.created_at;
    return new Date(reference) < cutoff;
  });

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === inactiveCustomers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(inactiveCustomers.map((c) => c.id)));
    }
  }

  async function handleSend() {
    if (selected.size === 0) return;

    setSending(true);
    setMessage('');

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch('/api/panel/campanas/inactivos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ customerIds: Array.from(selected), incentiveText }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setMessage(data.error ?? 'No se pudo enviar la campaña');
      return;
    }

    const sentCount = data.results.filter((r: { status: string }) => r.status === 'enviado').length;
    setMessage(`Enviado a ${sentCount} de ${selected.size} clientes.`);
    setSelected(new Set());
  }

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
        .cta-pill {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .cta-pill:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .cta-pill:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .customer-row {
          transition: background 0.15s ease;
        }
        .customer-row:hover {
          background: rgba(0,0,0,0.02);
        }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 0.5rem' }}>Clientes inactivos</h1>
        <p style={{ color: 'var(--slate)', marginBottom: '1.75rem' }}>
          Manda un mensaje de WhatsApp a quienes no han vuelto en un tiempo.
        </p>

        {/* Selector de umbral */}
        <div className="field" style={{ maxWidth: 280 }}>
          <label htmlFor="days">Mostrar clientes con:</label>
          <select id="days" value={days} onChange={(e) => { setDays(Number(e.target.value)); setSelected(new Set()); }}>
            {UMBRALES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

        {inactiveCustomers.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>
              No hay clientes que cumplan ese criterio — buena señal, tus clientes siguen viniendo.
            </p>
          </div>
        ) : (
          <>
            {/* Mensaje de incentivo */}
            <div
              style={{
                background: 'var(--card)',
                borderRadius: 16,
                padding: '1.5rem',
                marginTop: '1.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="incentive">Mensaje o incentivo (parte final del mensaje)</label>
                <input
                  id="incentive"
                  value={incentiveText}
                  onChange={(e) => setIncentiveText(e.target.value)}
                  placeholder="Te esperamos con un 15% en tu próxima visita"
                />
                <span className="field-hint">
                  El mensaje completo usa una plantilla aprobada de WhatsApp: "Hola [nombre], te extrañamos en [negocio]. [esto que escribas]".
                </span>
              </div>
            </div>

            {/* Lista con checkboxes */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: '0.5rem 0', marginBottom: '1.25rem' }}>
              <div
                className="customer-row"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                onClick={toggleSelectAll}
              >
                <input type="checkbox" checked={selected.size === inactiveCustomers.length} readOnly />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Seleccionar todos ({inactiveCustomers.length})
                </span>
              </div>

              {inactiveCustomers.map((c) => {
                const lastSent = lastSentByCustomer[c.id];
                return (
                  <div
                    key={c.id}
                    className="customer-row"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => toggleSelect(c.id)}
                  >
                    <input type="checkbox" checked={selected.has(c.id)} readOnly />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{c.full_name ?? 'Sin nombre'}</p>
                      <p style={{ margin: '0.15rem 0 0', color: 'var(--slate)', fontSize: '0.82rem' }}>
                        {c.last_visit_at
                          ? `Última visita: ${new Date(c.last_visit_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : 'Nunca ha vuelto desde que se registró'}
                        {lastSent && ` · Último mensaje: ${new Date(lastSent).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {message && (
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: message.startsWith('No se pudo') ? 'var(--stamp-dark)' : 'var(--slate)' }}>
                {message}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={selected.size === 0 || sending}
              className="cta-pill"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'var(--ink)',
                color: 'var(--paper)',
                border: 'none',
                borderRadius: 999,
                padding: '0.9rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: selected.size === 0 ? 'default' : 'pointer',
              }}
            >
              {sending ? 'Enviando...' : `Enviar a ${selected.size} cliente${selected.size !== 1 ? 's' : ''}`}
            </button>
          </>
        )}
      </div>
    </main>
  );
}