'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl'; // <-- 1. Importamos el traductor
import LanguageSwitcher from '../components/LanguageSwitcher'; // <-- 2. Importación de tus botones

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

export default function Panel() {
  const router = useRouter();
  const t = useTranslations('Panel'); // <-- 3. Inicializamos el traductor apuntando a "Panel"
  const [business, setBusiness] = useState<{ name: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // 4. Movimos NAV_ITEMS aquí adentro para que lea las traducciones
  const NAV_ITEMS = [
    {
      href: '/panel/dashboard',
      label: t('dashboard'), // <-- Traducido
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
      label: t('profile'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      ),
    },
    {
      href: '/panel/menu',
      label: t('menu'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      ),
    },
    {
      href: '/panel/clientes',
      label: t('clients'), // <-- Traducido
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
      label: t('coupons'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a2 2 0 0 0-2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-4z" />
          <path d="M9 6v12" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      href: '/panel/campanas',
      label: t('inactiveClients'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      href: '/panel/suscripcion',
      label: t('subscription'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      href: '/panel/resenas',
      label: t('reputation'), // <-- Traducido
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

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
        <p style={{ color: 'var(--slate)' }}>{t('loading')}</p> {/* <-- Traducido */}
      </main>
    );
  }

  if (!business) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{t('noBusiness')}</p> {/* <-- Traducido */}
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
            <span className="eyebrow">{t('title')}</span> {/* <-- Traducido */}
            <h1 style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>{business.name}</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSwitcher />
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
              {t('logout')} {/* <-- Traducido */}
            </button>
          </div>
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
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>{t('qrTitle')}</span> {/* <-- Traducido */}
          <p style={{ fontWeight: 600, margin: '0.5rem 0 1.5rem', fontSize: '1.1rem' }}>{t('qrSubtitle')}</p> {/* <-- Traducido */}

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
            {t('downloadQr')} {/* <-- Traducido */}
          </button>
        </div>
      </div>
    </main>
  );
}