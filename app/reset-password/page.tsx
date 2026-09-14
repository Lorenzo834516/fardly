'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setStatus('success');
    setTimeout(() => {
      router.push('/login');
    }, 2000);
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
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <span className="eyebrow">Nueva contraseña</span>
        <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1.5rem' }}>Crea tu nueva clave</h1>

        {status === 'success' ? (
          <div style={{ background: '#e6f4ea', padding: '1rem', borderRadius: '8px', color: '#137333' }}>
            Contraseña actualizada con éxito. Redirigiendo al login...
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="field" style={{ marginTop: '1rem' }}>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
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
                marginTop: '1.5rem',
              }}
            >
              {status === 'loading' ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </>
        )}
      </form>
    </main>
  );
}