'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

function downloadQR(slug: string) {
  const svg = document.getElementById('business-qr');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    canvas.width = 512;
    canvas.height = 512;
    ctx?.drawImage(img, 0, 0, 512, 512);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `qr-${slug}.png`;
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

const NAV_ITEMS = [
  {
    href: '/panel/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: '/panel/perfil',
    label: 'Perfil, marca y redes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    href: '/panel/menu',
    label: 'Menú',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    href: '/panel/clientes',
    label: 'Clientes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/panel/cupones',
    label: 'Cupones',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a2 2 0 0 0-2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-4z" />
        <path d="M9 6v12" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    href: '/panel/whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.77.46 3.45 1.28 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.05c-.24.68-1.2 1.25-1.97 1.41-.53.11-1.22.2-3.54-.76-2.97-1.23-4.88-4.24-5.03-4.44-.15-.2-1.2-1.59-1.2-3.04 0-1.44.75-2.15 1.02-2.44.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.068.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.29.15.48.22.55.34.07.13.07.71-.17 1.4z"/>
      </svg>
    ),
  },
];

export default function Panel() {
  const router = useRouter();
  const [business, setBusiness] = useState<{ name: string; slug: string } | null>(null);
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
        .select('name, slug')
        .eq('owner_id', user.id)
        .single();

      setBusiness(biz);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No encontramos un negocio asociado a tu cuenta.</p>
      </main>
    );
  }

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/n/${business.slug}` : '';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <style>{`
        .panel-nav-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .panel-nav-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.10);
          border-color: var(--ink);
        }
        .panel-nav-card:active {
          transform: translateY(-1px);
        }
      `}</style>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <span className="eyebrow">Panel</span>
            <h1 style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>{business.name}</h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '0.5rem 1.1rem',
              color: 'var(--slate)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Navegación: tarjetas con ícono, no solo texto */}
        <nav
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.85rem',
            marginBottom: '2.5rem',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="panel-nav-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderRadius: 14,
                padding: '1.1rem 1.2rem',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--ink)',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* QR del negocio — pieza central de la página */}
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '2.5rem 2rem', borderRadius: 20, textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>Tu código de fidelización</span>
          <p style={{ fontWeight: 600, margin: '0.5rem 0 1.5rem', fontSize: '1.1rem' }}>Los clientes escanean esto para sumar sellos</p>

          {qrUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--paper)', padding: '1rem', borderRadius: 16 }}>
                <QRCodeSVG id="business-qr" value={qrUrl} size={200} level="H" />
              </div>
            </div>
          )}

          <p style={{ color: 'rgba(255,248,240,0.7)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{qrUrl}</p>

          <button
            onClick={() => downloadQR(business.slug)}
            className="cta-pill"
            style={{
              background: 'var(--gold)',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: 999,
              padding: '0.8rem 2rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Descargar QR
          </button>
        </div>
      </div>
    </main>
  );
}