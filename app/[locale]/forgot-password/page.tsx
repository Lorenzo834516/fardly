'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Define a dónde redirigir al usuario tras hacer clic en el correo
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setStatus('success');
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
      <button
        type="button"
        onClick={() => router.push('/login')}
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
        }}
      >
        ← Volver 
      </button>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <span className="eyebrow">Recuperación</span>
        <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1rem' }}>¿Olvidaste tu contraseña?</h1>
        <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        {status === 'success' ? (
          <div style={{ background: '#e6f4ea', padding: '1rem', borderRadius: '8px', color: '#137333' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>¡Correo enviado!</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', margin: 0 }}>
              Revisa tu bandeja de entrada o spam para continuar.
            </p>
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            {status === 'error' && (
              <p style={{ color: 'var(--stamp-dark)', fontSize: '0.88rem', marginTop: '0.5rem' }}>{errorMsg}</p>
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
                marginTop: '1rem',
              }}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </>
        )}
      </form>
    </main>
  );
}