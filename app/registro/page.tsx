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

const TIPOS_NEGOCIO = ['Restaurante', 'Cafetería', 'Barbería / Salón', 'Tienda', 'Otro'];

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

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // 1. Crear la cuenta del dueño del negocio
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !authData.user) {
      setStatus('error');
      setErrorMsg(authError?.message ?? 'No se pudo crear la cuenta.');
      return;
    }

    // Si el proyecto de Supabase tiene "Confirm email" activado,
    // authData.session vendrá null hasta que el usuario confirme.
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

    // 2. Crear el registro del negocio, vinculado al dueño
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

    // 3. Directo al panel del dueño (ahí verá su QR y podrá configurar todo)
    router.push('/panel');
  }

  return (
    <main
      className="split"
      style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', minHeight: '100vh' }}
    >
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
        <span className="eyebrow">Paso 1 de 1</span>
        <h1 style={{ fontSize: '2.2rem', lineHeight: 1.1 }}>Cuéntanos de tu negocio</h1>
        <p style={{ color: 'rgba(255,248,240,0.7)', lineHeight: 1.6, maxWidth: 380 }}>
          Con esto creamos tu panel y tu primer código QR de fidelización.
          Toma menos de dos minutos.
        </p>
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
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
            <span className="field-hint">La usarás para entrar a tu panel.</span>
          </div>

          {status === 'error' && (
            <p style={{ color: 'var(--stamp-dark)', fontSize: '0.88rem', marginBottom: '1rem' }}>{errorMsg}</p>
          )}

          <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ width: '100%', justifyContent: 'center' }}>
            {status === 'loading' ? 'Creando tu panel...' : 'Crear mi cuenta'}
          </button>
        </form>
      </section>
    </main>
  );
}