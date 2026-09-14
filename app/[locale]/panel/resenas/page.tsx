'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customers: { full_name: string | null } | null;
};

export default function PanelResenas() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
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
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }

      const { data: rows } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, customers(full_name)')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      setReviews((rows as unknown as Review[]) ?? []);
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

  const promedio = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 1.75rem' }}>Reputación</h1>

        {promedio && (
          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 18,
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>★ {promedio}</span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,248,240,0.75)' }}>
              Promedio de {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>Todavía no tienes reseñas. Aparecerán aquí cuando tus clientes las dejen desde su tarjeta digital.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  background: 'var(--card)',
                  borderRadius: 14,
                  padding: '1.1rem 1.3rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.1rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < r.rating ? 'var(--gold)' : 'var(--line)', fontSize: '1.1rem' }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate)' }}>
                    {new Date(r.created_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate)', margin: '0.4rem 0 0' }}>
                  {r.customers?.full_name ?? 'Cliente'}
                </p>
                {r.comment && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink)', margin: '0.5rem 0 0' }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}