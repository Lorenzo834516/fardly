'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  whatsapp_number: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  tiktok_handle: string | null;
  twitter_handle: string | null;
  website_url: string | null;
};

export default function PerfilNegocio() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessRow | null>(null);
  const [address, setAddress] = useState('');
  const [branchId, setBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
        .select('id, name, slug, logo_url, brand_color, whatsapp_number, instagram_handle, facebook_handle, tiktok_handle, twitter_handle, website_url')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }
      setBusiness(biz);

      const { data: branch } = await supabase
        .from('branches')
        .select('id, address')
        .eq('business_id', biz.id)
        .eq('is_main', true)
        .maybeSingle();

      if (branch) {
        setBranchId(branch.id);
        setAddress(branch.address ?? '');
      }

      setLoading(false);
    }
    load();
  }, [router]);

  function update<K extends keyof BusinessRow>(field: K, value: BusinessRow[K]) {
    setBusiness((b) => (b ? { ...b, [field]: value } : b));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    setUploadingLogo(true);
    const path = `logos/${business.id}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage('No se pudo subir el logo: ' + uploadError.message);
      setUploadingLogo(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('public-assets').getPublicUrl(path);
    update('logo_url', publicUrlData.publicUrl);
    setUploadingLogo(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    setMessage('');

    const { error: businessError } = await supabase
      .from('businesses')
      .update({
        logo_url: business.logo_url,
        brand_color: business.brand_color,
        whatsapp_number: business.whatsapp_number,
        instagram_handle: business.instagram_handle,
        facebook_handle: business.facebook_handle,
        tiktok_handle: business.tiktok_handle,
        twitter_handle: business.twitter_handle,
        website_url: business.website_url,
      })
      .eq('id', business.id);

    if (businessError) {
      setSaving(false);
      setMessage('Error al guardar: ' + businessError.message);
      return;
    }

    if (branchId) {
      const { error: branchError } = await supabase.from('branches').update({ address }).eq('id', branchId);
      if (branchError) {
        setSaving(false);
        setMessage('Se guardó el perfil, pero no se pudo guardar la dirección: ' + branchError.message);
        return;
      }
    } else {
      const { data: newBranch, error: branchError } = await supabase
        .from('branches')
        .insert({ business_id: business.id, name: 'Sucursal principal', address, is_main: true })
        .select('id')
        .single();
      if (branchError) {
        setSaving(false);
        setMessage('Se guardó el perfil, pero no se pudo guardar la dirección: ' + branchError.message);
        return;
      }
      if (newBranch) setBranchId(newBranch.id);
    }

    setSaving(false);
    setMessage('¡Guardado!');
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
        .upload-label {
          transition: opacity 0.15s ease;
        }
        .upload-label:hover {
          opacity: 0.75;
        }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">{business.name}</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 2rem' }}>Perfil del negocio</h1>

        <form onSubmit={handleSave}>
          {/* Sección: identidad visual */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 18,
              padding: '1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: '1.25rem',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '1.1rem' }}>
              IDENTIDAD VISUAL
            </p>

            <div className="field">
              <label>Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: business.logo_url ? 'transparent' : 'var(--paper)',
                    border: `2px solid ${business.brand_color || 'var(--ink)'}`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {business.logo_url ? (
                    <img src={business.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'var(--slate)', fontSize: '0.7rem' }}>Sin logo</span>
                  )}
                </div>
                <label
                  className="upload-label"
                  style={{
                    cursor: 'pointer',
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: 999,
                    padding: '0.5rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {uploadingLogo ? 'Subiendo...' : 'Cambiar logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="brandColor">Color de marca</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  id="brandColor"
                  type="color"
                  value={business.brand_color ?? '#2b2420'}
                  onChange={(e) => update('brand_color', e.target.value)}
                  style={{ width: 48, height: 40, padding: 0, border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)', fontSize: '0.9rem' }}>
                  {business.brand_color ?? '#2b2420'}
                </span>
              </div>
            </div>
          </div>

          {/* Sección: ubicación */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 18,
              padding: '1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: '1.25rem',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '1.1rem' }}>
              UBICACIÓN
            </p>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="address">Dirección del local</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Central, Ciudad de Panamá"
              />
            </div>
          </div>

          {/* Sección: redes sociales */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 18,
              padding: '1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: '1.75rem',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '1.1rem' }}>
              CONTACTO Y REDES
            </p>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                value={business.whatsapp_number ?? ''}
                onChange={(e) => update('whatsapp_number', e.target.value)}
                placeholder="+507 6000-0000"
              />
            </div>

            <div className="field">
              <label htmlFor="instagram">Instagram (usuario, sin @)</label>
              <input
                id="instagram"
                value={business.instagram_handle ?? ''}
                onChange={(e) => update('instagram_handle', e.target.value)}
                placeholder="minegocio"
              />
            </div>

            <div className="field">
              <label htmlFor="facebook">Facebook (usuario o página)</label>
              <input
                id="facebook"
                value={business.facebook_handle ?? ''}
                onChange={(e) => update('facebook_handle', e.target.value)}
                placeholder="minegocio"
              />
            </div>

            <div className="field">
              <label htmlFor="tiktok">TikTok (usuario, sin @)</label>
              <input
                id="tiktok"
                value={business.tiktok_handle ?? ''}
                onChange={(e) => update('tiktok_handle', e.target.value)}
                placeholder="minegocio"
              />
            </div>

            <div className="field">
              <label htmlFor="twitter">Twitter / X (usuario, sin @)</label>
              <input
                id="twitter"
                value={business.twitter_handle ?? ''}
                onChange={(e) => update('twitter_handle', e.target.value)}
                placeholder="minegocio"
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="website">Sitio web</label>
              <input
                id="website"
                value={business.website_url ?? ''}
                onChange={(e) => update('website_url', e.target.value)}
                placeholder="https://minegocio.com"
              />
            </div>
          </div>

          {message && (
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: message.startsWith('Error') ? 'var(--stamp-dark)' : 'var(--slate)' }}>
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
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}