'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Category = { id: string; name: string; sort_order: number };
type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  available: boolean;
};

export default function PanelMenu() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [productForms, setProductForms] = useState<Record<string, { name: string; description: string; price: string }>>({});
  const [uploadingProductImage, setUploadingProductImage] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: biz } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!biz) {
      setLoading(false);
      return;
    }
    setBusinessId(biz.id);

    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('id, name, sort_order').eq('business_id', biz.id).order('sort_order'),
      supabase.from('products').select('id, category_id, name, description, price, image_url, available').eq('business_id', biz.id),
    ]);

    setCategories(cats ?? []);
    setProducts(prods ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !newCategoryName.trim()) return;

    setAddingCategory(true);
    const { error } = await supabase.from('categories').insert({
      business_id: businessId,
      name: newCategoryName.trim(),
      sort_order: categories.length,
    });
    setAddingCategory(false);

    if (error) {
      setMessage('No se pudo crear la categoría: ' + error.message);
      return;
    }

    setNewCategoryName('');
    await loadAll();
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!confirm('¿Borrar esta categoría? También se borrarán sus productos.')) return;
    await supabase.from('products').delete().eq('category_id', categoryId);
    await supabase.from('categories').delete().eq('id', categoryId);
    await loadAll();
  }

  async function handleAddProduct(categoryId: string) {
    if (!businessId) return;
    const form = productForms[categoryId];
    if (!form?.name?.trim()) return;

    setSavingProduct(categoryId);
    const { error } = await supabase.from('products').insert({
      business_id: businessId,
      category_id: categoryId,
      name: form.name.trim(),
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      available: true,
    });
    setSavingProduct(null);

    if (error) {
      setMessage('No se pudo crear el producto: ' + error.message);
      return;
    }

    setProductForms((f) => ({ ...f, [categoryId]: { name: '', description: '', price: '' } }));
    await loadAll();
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('¿Borrar este producto?')) return;
    await supabase.from('products').delete().eq('id', productId);
    await loadAll();
  }

  async function handleToggleAvailable(product: Product) {
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id);
    await loadAll();
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>, product: Product) {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    setUploadingProductImage(product.id);
    const path = `products/${businessId}-${product.id}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage('No se pudo subir la imagen: ' + uploadError.message);
      setUploadingProductImage(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('public-assets').getPublicUrl(path);
    await supabase.from('products').update({ image_url: publicUrlData.publicUrl }).eq('id', product.id);
    setUploadingProductImage(null);
    await loadAll();
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
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
        .category-card {
          transition: box-shadow 0.18s ease;
        }
        .category-card:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
        .text-action {
          transition: opacity 0.15s ease;
        }
        .text-action:hover {
          opacity: 0.7;
        }
        .upload-label {
          transition: opacity 0.15s ease;
        }
        .upload-label:hover {
          opacity: 0.75;
        }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 2rem' }}>Menú del negocio</h1>

        {message && (
          <p style={{ color: 'var(--stamp-dark)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{message}</p>
        )}

        {/* Nueva categoría */}
        <form
          onSubmit={handleAddCategory}
          style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}
        >
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nueva categoría (ej: Bebidas)"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={addingCategory}
            className="cta-pill"
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 999,
              padding: '0 1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {addingCategory ? 'Creando...' : 'Agregar'}
          </button>
        </form>

        {categories.length === 0 && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate)', margin: 0 }}>Todavía no tienes categorías. Crea la primera arriba.</p>
          </div>
        )}

        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          const form = productForms[cat.id] ?? { name: '', description: '', price: '' };

          return (
            <div
              key={cat.id}
              className="category-card"
              style={{
                background: 'var(--card)',
                borderRadius: 18,
                padding: '1.5rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--ink)' }}>{cat.name}</h2>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-action"
                  style={{ background: 'none', border: 'none', color: 'var(--stamp-dark)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                >
                  Borrar categoría
                </button>
              </div>

              {catProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid var(--line)',
                    alignItems: 'center',
                  }}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--paper)', flexShrink: 0 }} />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, opacity: p.available ? 1 : 0.5 }}>{p.name}</span>
                      {p.price != null && <span style={{ fontWeight: 700, color: 'var(--stamp)' }}>${p.price}</span>}
                    </div>
                    {p.description && (
                      <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.15rem 0 0' }}>{p.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.9rem', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                      <label className="text-action" style={{ cursor: 'pointer', color: 'var(--stamp)', fontWeight: 600 }}>
                        {uploadingProductImage === p.id ? 'Subiendo...' : 'Cambiar foto'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProductImageUpload(e, p)}
                          style={{ display: 'none' }}
                          disabled={uploadingProductImage === p.id}
                        />
                      </label>
                      <button
                        onClick={() => handleToggleAvailable(p)}
                        className="text-action"
                        style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        {p.available ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-action"
                        style={{ background: 'none', border: 'none', color: 'var(--stamp-dark)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Agregar producto nuevo */}
              <div
                style={{
                  marginTop: '1.1rem',
                  padding: '1rem',
                  background: 'var(--paper)',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <input
                  value={form.name}
                  onChange={(e) =>
                    setProductForms((f) => ({ ...f, [cat.id]: { ...form, name: e.target.value } }))
                  }
                  placeholder="Nombre del producto"
                />
                <input
                  value={form.description}
                  onChange={(e) =>
                    setProductForms((f) => ({ ...f, [cat.id]: { ...form, description: e.target.value } }))
                  }
                  placeholder="Descripción (opcional)"
                />
                <input
                  value={form.price}
                  onChange={(e) =>
                    setProductForms((f) => ({ ...f, [cat.id]: { ...form, price: e.target.value } }))
                  }
                  placeholder="Precio (ej: 3.50)"
                  type="number"
                  step="0.01"
                />
                <button
                  onClick={() => handleAddProduct(cat.id)}
                  disabled={savingProduct === cat.id}
                  className="cta-pill"
                  style={{
                    alignSelf: 'flex-start',
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    border: 'none',
                    borderRadius: 999,
                    padding: '0.6rem 1.4rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                  }}
                >
                  {savingProduct === cat.id ? 'Agregando...' : `Agregar a ${cat.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}