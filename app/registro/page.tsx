'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const TIPOS_NEGOCIO = ['Restaurante', 'Cafetería', 'Barbería / Salón', 'Tienda', 'Discoteca', 'Clínica', 'Gimnasio', 'otros',];

export default function Registro() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    businessType: TIPOS_NEGOCIO[0],
    whatsapp: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setStatus('error');
      setErrorMsg(authError?.message ?? 'No se pudo crear la cuenta.');
      return;
    }

    if (!authData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setStatus('error');
        setErrorMsg(
          'Tu cuenta se creó pero requiere confirmación por correo. Desactiva "Confirm email" en Supabase (Authentication > Providers > Email) para saltarte este paso.'
        );
        return;
      }
    }

    const slug = `${slugify(form.businessName)}-${Math.floor(Math.random() * 900 + 100)}`;

    const { error: businessError } = await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      name: form.businessName,
      slug,
      business_type: form.businessType,
      whatsapp_number: form.whatsapp,
    });

    if (businessError) {
      setStatus('error');
      setErrorMsg(businessError.message);
      return;
    }

    router.push('/panel');
  }

  return (
    <main
      className="split"
      style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', minHeight: '100vh' }}
    >
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
      <section
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <span className="eyebrow">Empezar</span>
        <h1 style={{ fontSize: '2.2rem', lineHeight: 1.1, margin: 0 }}>Cuéntanos de tu negocio</h1>
        <p style={{ color: 'rgba(255,248,240,0.7)', lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
          Con esto creamos tu panel y tu primer código QR de fidelización.
          Toma menos de dos minutos.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Sin tarjeta de crédito', '7 días gratis', 'Cancela cuando quieras'].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,248,240,0.85)', fontSize: '0.92rem' }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(255,248,240,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ background: 'var(--paper)', padding: '4rem 3.5rem', display: 'flex', alignItems: 'center' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
          <div className="field">
            <label htmlFor="businessName">Nombre del negocio</label>
            <input
              id="businessName"
              required
              value={form.businessName}
              onChange={(e) => update('businessName', e.target.value)}
              placeholder="Café La Esquina"
            />
          </div>

          <div className="field">
            <label htmlFor="businessType">Tipo de negocio</label>
            <select
              id="businessType"
              value={form.businessType}
              onChange={(e) => update('businessType', e.target.value)}
            >
              {TIPOS_NEGOCIO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="whatsapp">WhatsApp del negocio</label>
            <input
              id="whatsapp"
              required
              value={form.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="+507 6000-0000"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Tu correo</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="field-hint">La usarás para entrar a tu panel.</span>
          </div>

          {status === 'error' && (
            <p style={{ color: 'var(--stamp-dark)', fontSize: '0.88rem', marginBottom: '1rem' }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
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
            {status === 'loading' ? 'Creando tu panel...' : 'Crear mi cuenta'}
          </button>
        </form>
      </section>
    </main>
  );
}