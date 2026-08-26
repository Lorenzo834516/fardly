'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PanelWhatsApp() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [alreadyConnected, setAlreadyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        .select('id, whatsapp_phone_number_id, whatsapp_access_token')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }

      setBusinessId(biz.id);
      setAlreadyConnected(Boolean(biz.whatsapp_phone_number_id && biz.whatsapp_access_token));
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('businesses')
      .update({
        whatsapp_phone_number_id: phoneNumberId.trim() || null,
        whatsapp_access_token: accessToken.trim() || null,
      })
      .eq('id', businessId);

    setSaving(false);

    if (error) {
      setMessage('No se pudo guardar: ' + error.message);
      return;
    }

    setAlreadyConnected(Boolean(phoneNumberId.trim() && accessToken.trim()));
    setAccessToken(''); // no lo dejamos visible después de guardar
    setMessage('¡Guardado!');
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
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 1rem' }}>WhatsApp</h1>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: alreadyConnected ? '#e6f4ea' : 'var(--card)',
            color: alreadyConnected ? '#1e7e34' : 'var(--slate)',
            borderRadius: 999,
            padding: '0.4rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: alreadyConnected ? '#1e7e34' : 'var(--slate)' }} />
          {alreadyConnected ? 'Conectado' : 'No conectado todavía'}
        </div>

        <div
          style={{
            background: 'var(--card)',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.75rem',
            fontSize: '0.88rem',
            color: 'var(--slate)',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--ink)' }}>¿Dónde consigo estos datos?</p>
          Entra a <strong>developers.facebook.com</strong>, crea (o abre) tu app de tipo Negocio, agrégale
          el producto <strong>WhatsApp</strong>, y en la sección de configuración de la API vas a ver tu
          <strong> Phone Number ID</strong> y tu <strong>Access Token</strong> (usa un token permanente para producción,
          no el temporal de 24 horas).
        </div>

        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="phoneNumberId">Phone Number ID</label>
            <input
              id="phoneNumberId"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="123456789012345"
            />
          </div>

          <div className="field">
            <label htmlFor="accessToken">Access Token</label>
            <input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={alreadyConnected ? '•••••••• (ya guardado, pega uno nuevo para reemplazarlo)' : 'EAAxxxxxxxxxxxxx'}
            />
            <span className="field-hint">Por seguridad, no se vuelve a mostrar después de guardarlo.</span>
          </div>

          {message && (
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: message.startsWith('No se pudo') ? 'var(--stamp-dark)' : 'var(--slate)' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
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
              cursor: 'pointer',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar conexión'}
          </button>
        </form>
      </div>
    </main>
  );
}