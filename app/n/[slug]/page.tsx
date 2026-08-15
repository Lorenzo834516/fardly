'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const META_SELLOS = 10;

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

type MenuCategory = {
  id: string;
  name: string;
  products: Product[];
};

type BusinessInfo = {
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  address: string | null;
  phone: string | null;
  openingHours: Record<string, string> | null;
  menu?: MenuCategory[];
};

type CardInfo = {
  registered: boolean;
  name: string | null;
  stamps: number;
  totalRedeemed: number;
  history: { occurred_on: string; type: string; amount: number }[];
};

export default function TarjetaCliente() {
  const { slug } = useParams<{ slug: string }>();

  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [card, setCard] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', contact: '' });
  const [registering, setRegistering] = useState(false);
  const [stamping, setStamping] = useState(false);
  const [message, setMessage] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const brand = business?.brandColor || '#2b2420';

  async function handleAddToWallet() {
    setWalletLoading(true);
    const res = await fetch(`/api/negocio/${slug}/wallet`);
    const data = await res.json();
    setWalletLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? 'No se pudo generar el pase de Google Wallet');
      return;
    }

    window.location.href = data.link;
  }

  async function loadAll() {
    setLoading(true);
    const [bizRes, cardRes] = await Promise.all([
      fetch(`/api/negocio/${slug}`).then((r) => r.json()),
      fetch(`/api/negocio/${slug}/mi-tarjeta`).then((r) => r.json()),
    ]);
    setBusiness(bizRes);
    setCard(cardRes);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegistering(true);
    const res = await fetch(`/api/negocio/${slug}/identificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setRegistering(false);
    if (res.ok) {
      await loadAll();
    } else {
      const data = await res.json();
      setMessage(data.error ?? 'No se pudo registrar');
    }
  }

  async function handleStamp() {
    setStamping(true);
    setMessage('');
    const res = await fetch(`/api/negocio/${slug}/sellar`, { method: 'POST' });
    const data = await res.json();
    setStamping(false);

    if (!res.ok) {
      setMessage(data.error ?? 'No se pudo registrar la visita');
      return;
    }

    if (data.alreadyStampedToday) {
      setMessage('Ya tienes tu sello de hoy. ¡Vuelve mañana!');
    } else if (data.rewardJustEarned) {
      setMessage('¡Completaste tu tarjeta! Muestra esta pantalla para tu premio.');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2200);
    } else {
      setMessage('¡Sello agregado!');
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 700);
    }

    await loadAll();
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
        <p>Este negocio no existe o ya no está activo.</p>
      </main>
    );
  }

  const mapsUrl = business.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
    : null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '2.5rem 1.5rem' }}>
      <style>{`
        @keyframes stampPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stamp-just-added { animation: stampPop 0.6s ease; }
        .fade-in-section { animation: fadeIn 0.4s ease; }
        .celebrate-emoji {
          position: absolute;
          font-size: 1.4rem;
          animation: floatUp 1.8s ease-out forwards;
        }
      `}</style>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        {/* Encabezado del negocio */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '0.75rem',
                border: `3px solid ${brand}`,
              }}
            />
          )}
          <h1 style={{ fontSize: '1.7rem', margin: 0, color: brand }}>{business.name}</h1>
          {business.address && (
            <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{business.address}</p>
          )}
        </div>

        {/* Formulario de registro (solo si no está identificado) */}
        {!card?.registered && (
          <form
            onSubmit={handleRegister}
            className="field"
            style={{ background: 'var(--card)', padding: '1.5rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
          >
            <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Regístrate para empezar a sumar sellos</p>

            <div className="field">
              <label htmlFor="name">Tu nombre</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="María Pérez"
              />
            </div>

            <div className="field">
              <label htmlFor="contact">Teléfono o correo</label>
              <input
                id="contact"
                required
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="+507 6000-0000 o correo@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={registering}
              style={{
                width: '100%',
                justifyContent: 'center',
                background: brand,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {registering ? 'Registrando...' : 'Registrarme'}
            </button>

            {message && <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--slate)' }}>{message}</p>}
          </form>
        )}

        {/* Tarjeta de progreso */}
        {card?.registered && (
          <>
            <div
              style={{
                position: 'relative',
                background: 'var(--card)',
                padding: '1.75rem 1.5rem',
                borderRadius: 16,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              {showCelebration && (
                <>
                  {['🎉', '✨', '⭐', '🎊', '✨'].map((emoji, i) => (
                    <span
                      key={i}
                      className="celebrate-emoji"
                      style={{ left: `${15 + i * 18}%`, top: '10%', animationDelay: `${i * 0.1}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </>
              )}

              <p style={{ color: 'var(--slate)', marginBottom: '0.5rem' }}>Hola, {card.name}</p>

              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, margin: '1rem 0' }}>
                {Array.from({ length: META_SELLOS }).map((_, i) => {
                  const filled = i < card.stamps;
                  const isNewest = filled && i === card.stamps - 1;
                  return (
                    <span
                      key={i}
                      className={isNewest && justStamped ? 'stamp-just-added' : ''}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: filled ? brand : 'transparent',
                        color: filled ? '#fff' : brand,
                        border: `2px solid ${brand}`,
                        fontSize: '0.8rem',
                        transition: 'background 0.3s ease',
                      }}
                    >
                      {filled ? '★' : ''}
                    </span>
                  );
                })}
              </div>

              <p style={{ fontWeight: 600 }}>{card.stamps} / {META_SELLOS} sellos</p>
              {card.totalRedeemed > 0 && (
                <p style={{ color: 'var(--slate)', fontSize: '0.85rem' }}>Premios canjeados: {card.totalRedeemed}</p>
              )}

              <button
                onClick={handleStamp}
                disabled={stamping}
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  justifyContent: 'center',
                  background: brand,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {stamping ? 'Registrando...' : 'Marcar mi visita de hoy'}
              </button>

              <button
                onClick={handleAddToWallet}
                disabled={walletLoading}
                style={{
                  marginTop: '0.6rem',
                  width: '100%',
                  justifyContent: 'center',
                  background: 'transparent',
                  color: brand,
                  border: `2px solid ${brand}`,
                  borderRadius: 10,
                  padding: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {walletLoading ? 'Preparando...' : 'Agregar a Google Wallet'}
              </button>

              {message && <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>{message}</p>}
            </div>

            {/* Historial de visitas */}
            {card.history.length > 0 && (
              <div className="fade-in-section" style={{ marginTop: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Historial de visitas</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {card.history.map((h, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid var(--line)',
                        fontSize: '0.9rem',
                        color: 'var(--slate)',
                      }}
                    >
                      <span>{new Date(h.occurred_on).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{h.type === 'earn' ? '+1 sello' : h.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Menú del negocio */}
        {(business.menu ?? []).length > 0 && (
          <div className="fade-in-section" style={{ marginTop: '1.75rem' }}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'var(--card)',
                border: 'none',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: brand,
              }}
            >
              Ver menú
              <span style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </button>

            {showMenu && (
              <div className="fade-in-section" style={{ marginTop: '0.75rem' }}>
                {(business.menu ?? []).map((cat) => (
                  <div key={cat.id} style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontWeight: 600, color: brand, marginBottom: '0.5rem' }}>{cat.name}</p>
                    {cat.products.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          padding: '0.6rem 0',
                          borderBottom: '1px solid var(--line)',
                        }}
                      >
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                            {p.price != null && (
                              <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>${p.price}</span>
                            )}
                          </div>
                          {p.description && (
                            <p style={{ color: 'var(--slate)', fontSize: '0.85rem', margin: '0.15rem 0 0' }}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cómo llegar */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              marginTop: '1rem',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: 12,
              padding: '1rem',
              fontWeight: 600,
              color: brand,
              textDecoration: 'none',
            }}
          >
            📍 Cómo llegar
          </a>
        )}

        {/* Info del negocio */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate)' }}>
          {business.openingHours && (
            <p>
              {Object.entries(business.openingHours)
                .map(([day, hours]) => `${day}: ${hours}`)
                .join(' · ')}
            </p>
          )}
          <p style={{ marginTop: '0.4rem' }}>
            {business.whatsapp && (
              <a href={`https://wa.me/${business.whatsapp}`} style={{ marginRight: 12, color: brand }}>WhatsApp</a>
            )}
            {business.instagram && (
              <a href={`https://instagram.com/${business.instagram}`} style={{ marginRight: 12, color: brand }}>Instagram</a>
            )}
            {business.website && <a href={business.website} style={{ color: brand }}>Sitio web</a>}
          </p>
        </div>
      </div>
    </main>
  );
}