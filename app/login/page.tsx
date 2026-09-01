'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setStatus('error');
      setErrorMsg('Correo o contraseña incorrectos.');
      return;
    }

    router.push('/panel');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper)',
        padding: '2rem',
        position: 'relative',
      }}
    >
      {/* Botón para volver al inicio */}
      <button
        type="button"
        onClick={() => router.push('/')}
        aria-label="Volver al inicio"
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--ink)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '0.5rem',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Inicio
      </button>

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
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <span className="eyebrow">Panel del negocio</span>
        <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1.5rem' }}>Inicia sesión</h1>

        <div className="field">
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Tu contraseña"
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
          {status === 'loading' ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}