'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
      }}
    >
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
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Tu contraseña"
          />
        </div>

        {status === 'error' && (
          <p style={{ color: 'var(--stamp-dark)', fontSize: '0.88rem', marginBottom: '1rem' }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'loading'}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {status === 'loading' ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}