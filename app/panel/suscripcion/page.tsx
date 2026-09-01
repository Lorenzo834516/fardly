'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Subscription = {
  status: string;
  current_period_end: string | null;
};

export default function PanelSuscripcion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const checkoutResult = searchParams.get('checkout');

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

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('business_id', biz.id)
        .maybeSingle();

      setSubscription(sub);
      setLoading(false);
    }
    load();
  }, [router, checkoutResult]);

  async function authFetch(path: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }

  async function handleSubscribe() {
    setRedirecting(true);
    const data = await authFetch('/api/panel/suscripcion/checkout');
    if (data.url) window.location.href = data.url;
    else setRedirecting(false);
  }

  async function handleManage() {
    setRedirecting(true);
    const data = await authFetch('/api/panel/suscripcion/portal');
    if (data.url) window.location.href = data.url;
    else setRedirecting(false);
  }

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    trialing: { label: 'En periodo de prueba', color: '#1e7e34', bg: '#e6f4ea' },
    active: { label: 'Activa', color: '#1e7e34', bg: '#e6f4ea' },
    past_due: { label: 'Pago pendiente', color: '#b8860b', bg: '#fdf3d8' },
    cancelled: { label: 'Cancelada', color: '#c0392b', bg: '#fde8e8' },
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  const currentStatus = subscription ? statusLabels[subscription.status] : null;

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
          opacity: 0.7;
          cursor: default;
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 1.75rem' }}>Suscripción</h1>

        {checkoutResult === 'success' && (
          <div style={{ background: '#e6f4ea', color: '#1e7e34', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ¡Listo! Tu suscripción se está procesando.
          </div>
        )}

        {!subscription ? (
          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 20,
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Plan mensual</span>
            <p style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.5rem 0' }}>$15<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7 }}>/mes</span></p>
            <p style={{ color: 'rgba(255,248,240,0.75)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              7 días gratis, sin tarjeta hasta que termine. Cancela cuando quieras.
            </p>
            <button
              onClick={handleSubscribe}
              disabled={redirecting}
              className="cta-pill"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'var(--gold)',
                color: 'var(--ink)',
                border: 'none',
                borderRadius: 999,
                padding: '0.9rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {redirecting ? 'Redirigiendo...' : 'Suscribirme'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '2rem' }}>
            {currentStatus && (
              <span
                style={{
                  display: 'inline-block',
                  background: currentStatus.bg,
                  color: currentStatus.color,
                  borderRadius: 999,
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                {currentStatus.label}
              </span>
            )}
            <p style={{ fontWeight: 600, margin: '0 0 0.3rem' }}>Plan mensual — $15/mes</p>
            {subscription.current_period_end && (
              <p style={{ color: 'var(--slate)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                {subscription.status === 'cancelled' ? 'Terminó el' : 'Próximo cobro:'}{' '}
                {new Date(subscription.current_period_end).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <button
              onClick={handleManage}
              disabled={redirecting}
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
              }}
            >
              {redirecting ? 'Redirigiendo...' : 'Gestionar pago / cancelar'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}