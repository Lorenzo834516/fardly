'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  usage_limit_per_customer: number;
  used_count: number;
  active: boolean;
};

const TIPOS = [
  { value: 'percentage', label: 'Porcentaje de descuento' },
  { value: 'fixed', label: 'Monto fijo de descuento' },
  { value: 'free_item', label: 'Producto gratis' },
];

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function PanelCupones() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: randomCode(),
    type: 'percentage' as Coupon['type'],
    value: '',
    description: '',
    endsAt: '',
    usageLimit: '',
    usageLimitPerCustomer: '1',
  });

  async function loadAll() {
    setLoading(true);
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
    setBusinessId(biz.id);

    const { data: rows } = await supabase
      .from('coupons')
      .select('id, code, type, value, description, starts_at, ends_at, usage_limit, usage_limit_per_customer, used_count, active')
      .eq('business_id', biz.id)
      .order('created_at', { ascending: false });

    setCoupons(rows ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !form.code.trim()) return;

    setCreating(true);
    setMessage('');

    const { error } = await supabase.from('coupons').insert({
      business_id: businessId,
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.type === 'free_item' ? null : parseFloat(form.value || '0'),
      description: form.description || null,
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      usage_limit: form.usageLimit ? parseInt(form.usageLimit) : null,
      usage_limit_per_customer: parseInt(form.usageLimitPerCustomer || '1'),
      active: true,
    });

    setCreating(false);

    if (error) {
      setMessage('No se pudo crear el cupón: ' + error.message);
      return;
    }

    setForm({
      code: randomCode(),
      type: 'percentage',
      value: '',
      description: '',
      endsAt: '',
      usageLimit: '',
      usageLimitPerCustomer: '1',
    });
    await loadAll();
  }

  async function handleToggleActive(coupon: Coupon) {
    await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id);
    await loadAll();
  }

  async function handleDelete(couponId: string) {
    if (!confirm('¿Borrar este cupón? Ya no se podrá canjear.')) return;
    await supabase.from('coupons').delete().eq('id', couponId);
    await loadAll();
  }

  function describe(c: Coupon) {
    if (c.type === 'percentage') return `${c.value}% de descuento`;
    if (c.type === 'fixed') return `$${c.value} de descuento`;
    return 'Producto gratis';
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
        .cta-pill:active:not(:disabled) {
          transform: translateY(0);
        }
        .cta-pill:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .coupon-card {
          transition: box-shadow 0.18s ease;
        }
        .coupon-card:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
        .text-action {
          transition: opacity 0.15s ease;
        }
        .text-action:hover {
          opacity: 0.7;
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
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 2rem' }}>Cupones</h1>

        {message && <p style={{ color: 'var(--stamp-dark)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{message}</p>}

        {/* Formulario de nuevo cupón */}
        <form
          onSubmit={handleCreate}
          style={{
            background: 'var(--card)',
            borderRadius: 18,
            padding: '1.75rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: '2rem',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '1.1rem' }}>
            NUEVO CUPÓN
          </p>

          <div className="field">
            <label htmlFor="code">Código</label>
            <input
              id="code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="VERANO10"
              required
            />
            <span className="field-hint">El cliente ve este código; también sirve como referencia interna.</span>
          </div>

          <div className="field">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Coupon['type'] }))}
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {form.type !== 'free_item' && (
            <div className="field">
              <label htmlFor="value">{form.type === 'percentage' ? 'Porcentaje (ej: 15)' : 'Monto (ej: 5.00)'}</label>
              <input
                id="value"
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="description">Descripción (la ve el cliente)</label>
            <input
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="15% en tu próxima visita"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label htmlFor="endsAt">Vence (opcional)</label>
              <input
                id="endsAt"
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="usageLimitPerCustomer">Usos por cliente</label>
              <input
                id="usageLimitPerCustomer"
                type="number"
                min="1"
                value={form.usageLimitPerCustomer}
                onChange={(e) => setForm((f) => ({ ...f, usageLimitPerCustomer: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="usageLimit">Límite total de canjes (opcional, para todos los clientes juntos)</label>
            <input
              id="usageLimit"
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              placeholder="Sin límite si lo dejas vacío"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="cta-pill"
            style={{
              width: '100%',
              justifyContent: 'center',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 999,
              padding: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {creating ? 'Creando...' : 'Crear cupón'}
          </button>
        </form>

        {/* Lista de cupones */}
        {coupons.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>Todavía no tienes cupones. Crea el primero arriba.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {coupons.map((c) => (
              <div
                key={c.id}
                className="coupon-card"
                style={{
                  background: 'var(--card)',
                  borderRadius: 14,
                  padding: '1.1rem 1.3rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  opacity: c.active ? 1 : 0.55,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        background: 'var(--ink)',
                        color: 'var(--gold)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 6,
                        fontSize: '0.85rem',
                      }}
                    >
                      {c.code}
                    </span>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>{describe(c)}</p>
                    {c.description && <p style={{ margin: '0.2rem 0 0', color: 'var(--slate)', fontSize: '0.88rem' }}>{c.description}</p>}
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--slate)', fontSize: '0.8rem' }}>
                      {c.used_count} canje{c.used_count !== 1 ? 's' : ''}
                      {c.usage_limit ? ` de ${c.usage_limit}` : ''}
                      {c.ends_at && <> · Vence {new Date(c.ends_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggleActive(c)}
                      className="text-action"
                      style={{ background: 'none', border: 'none', color: 'var(--stamp)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {c.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-action"
                      style={{ background: 'none', border: 'none', color: 'var(--stamp-dark)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}