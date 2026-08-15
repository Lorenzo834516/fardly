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
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
          <div>
            <span className="eyebrow">Panel</span>
            <h1 style={{ fontSize: '2rem', margin: '0.3rem 0 0' }}>{business.name}</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost">
            Cerrar sesión
          </button>
        </div>

        {/* Navegación a las demás secciones */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/panel/perfil" className="btn btn-primary">
            Editar perfil, marca y redes
          </Link>
          <Link href="/panel/menu" className="btn btn-primary">
            Administrar menú
          </Link>
          <Link href="/panel/clientes" className="btn btn-primary">
            Ver clientes
          </Link>
        </div>

        {/* QR del negocio */}
        <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Tu código QR de fidelización</p>

          {qrUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <QRCodeSVG id="business-qr" value={qrUrl} size={220} level="H" />
            </div>
          )}

          <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginBottom: '1rem' }}>{qrUrl}</p>

          <button onClick={() => downloadQR(business.slug)} className="btn btn-primary">
            Descargar QR
          </button>
        </div>
      </div>
    </main>
  );
}