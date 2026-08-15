'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

    // Dirección: actualiza la sucursal principal, o la crea si no existe
    if (branchId) {
      await supabase.from('branches').update({ address }).eq('id', branchId);
    } else {
      const { data: newBranch } = await supabase
        .from('branches')
        .insert({ business_id: business.id, name: 'Sucursal principal', address, is_main: true })
        .select('id')
        .single();
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
      <form onSubmit={handleSave} style={{ maxWidth: 520, margin: '0 auto' }}>
        <span className="eyebrow">Panel de {business.name}</span>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 2rem' }}>Perfil del negocio</h1>

        {/* Logo */}
        <div className="field">
          <label>Logo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt="Logo"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
          </div>
          {uploadingLogo && <span className="field-hint">Subiendo...</span>}
        </div>

        {/* Color de marca */}
        <div className="field">
          <label htmlFor="brandColor">Color de marca</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              id="brandColor"
              type="color"
              value={business.brand_color ?? '#2b2420'}
              onChange={(e) => update('brand_color', e.target.value)}
              style={{ width: 48, height: 40, padding: 0, border: 'none', background: 'none' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
              {business.brand_color ?? '#2b2420'}
            </span>
          </div>
        </div>

        {/* Dirección */}
        <div className="field">
          <label htmlFor="address">Dirección del local</label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Av. Central, Ciudad de Panamá"
          />
        </div>

        {/* Redes sociales */}
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

        <div className="field">
          <label htmlFor="website">Sitio web</label>
          <input
            id="website"
            value={business.website_url ?? ''}
            onChange={(e) => update('website_url', e.target.value)}
            placeholder="https://minegocio.com"
          />
        </div>

        {message && (
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: message.startsWith('Error') ? 'var(--stamp-dark)' : 'var(--slate)' }}>
            {message}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  );
}