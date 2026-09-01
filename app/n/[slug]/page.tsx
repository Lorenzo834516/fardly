'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const META_SELLOS = 8;

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

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number | null;
  description: string | null;
  ends_at: string | null;
};

type BusinessInfo = {
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  twitter: string | null;
  website: string | null;
  address: string | null;
  phone: string | null;
  openingHours: Record<string, string> | null;
  menu?: MenuCategory[];
  coupons?: Coupon[];
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

  const [form, setForm] = useState({ name: '', contact: '', birthdate: '' });
  const [registering, setRegistering] = useState(false);
  const [stamping, setStamping] = useState(false);
  const [message, setMessage] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [redeemedCoupons, setRedeemedCoupons] = useState<Set<string>>(new Set());
  const [redeemingCoupon, setRedeemingCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<Record<string, string>>({});

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

  async function handleRedeemCoupon(couponId: string) {
    setRedeemingCoupon(couponId);
    const res = await fetch(`/api/negocio/${slug}/canjear-cupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId }),
    });
    const data = await res.json();
    setRedeemingCoupon(null);

    if (!res.ok) {
      setCouponMessage((m) => ({ ...m, [couponId]: data.error ?? 'No se pudo canjear' }));
      return;
    }

    setRedeemedCoupons((s) => new Set(s).add(couponId));
    setCouponMessage((m) => ({ ...m, [couponId]: '¡Cupón canjeado! Muestra esta pantalla en caja.' }));
  }

  function describeCoupon(c: Coupon) {
    if (c.type === 'percentage') return `${c.value}% de descuento`;
    if (c.type === 'fixed') return `$${c.value} de descuento`;
    return 'Producto gratis';
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
        .social-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .social-icon:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.2);
          opacity: 0.92;
        }
      `}</style>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--slate)',
            fontSize: '0.88rem',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '1rem',
          }}
        >
          ← Atrás
        </button>

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

            <div className="field">
              <label htmlFor="birthdate">Fecha de cumpleaños (opcional)</label>
              <input
                id="birthdate"
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
              />
              <span className="field-hint">Te mandamos algo especial ese día 🎉</span>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="cta-pill"
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
                className="cta-pill"
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
                className="cta-pill"
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

        {/* Cupones disponibles */}
        {card?.registered && (business.coupons ?? []).length > 0 && (
          <div className="fade-in-section" style={{ marginTop: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--stamp)', marginBottom: '0.75rem' }}>
              CUPONES DISPONIBLES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(business.coupons ?? []).map((c) => {
                const redeemed = redeemedCoupons.has(c.id);
                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--card)',
                      borderRadius: 14,
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      opacity: redeemed ? 0.7 : 1,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          background: brand,
                          color: '#fff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                        }}
                      >
                        {c.code}
                      </span>
                      <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>{describeCoupon(c)}</p>
                      {c.description && <p style={{ margin: '0.2rem 0 0', color: 'var(--slate)', fontSize: '0.85rem' }}>{c.description}</p>}
                      {couponMessage[c.id] && (
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: redeemed ? 'green' : 'var(--stamp-dark)' }}>
                          {couponMessage[c.id]}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeemCoupon(c.id)}
                      disabled={redeemed || redeemingCoupon === c.id}
                      className="cta-pill"
                      style={{
                        background: redeemed ? 'var(--paper)' : brand,
                        color: redeemed ? 'var(--slate)' : '#fff',
                        border: 'none',
                        borderRadius: 999,
                        padding: '0.6rem 1.2rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: redeemed ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {redeemed ? 'Canjeado' : redeemingCoupon === c.id ? 'Canjeando...' : 'Canjear'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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
          {(business.whatsapp || business.instagram || business.facebook || business.tiktok || business.twitter || business.website) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  className="social-icon"
                  aria-label="WhatsApp"
                  style={{ background: brand }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.77.46 3.45 1.28 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.05c-.24.68-1.2 1.25-1.97 1.41-.53.11-1.22.2-3.54-.76-2.97-1.23-4.88-4.24-5.03-4.44-.15-.2-1.2-1.59-1.2-3.04 0-1.44.75-2.15 1.02-2.44.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.068.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.29.15.48.22.55.34.07.13.07.71-.17 1.4z"/></svg>
                </a>
              )}
              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram}`}
                  className="social-icon"
                  aria-label="Instagram"
                  style={{ background: brand }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </a>
              )}
              {business.facebook && (
                <a
                  href={`https://facebook.com/${business.facebook}`}
                  className="social-icon"
                  aria-label="Facebook"
                  style={{ background: brand }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.19 4.32 15.15 4.23 13.94 4.23c-2.53 0-4.26 1.54-4.26 4.37V10.5h-2.5v3h2.5V21h3.32z"/></svg>
                </a>
              )}
              {business.tiktok && (
                <a
                  href={`https://tiktok.com/@${business.tiktok}`}
                  className="social-icon"
                  aria-label="TikTok"
                  style={{ background: brand }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3v13.5a2.5 2.5 0 1 1-2.5-2.5c.17 0 .34.02.5.05V9.9a5.5 5.5 0 1 0 5 5.47V8.8a7.4 7.4 0 0 0 4.5 1.52V7.3a4.4 4.4 0 0 1-4.5-4.3V2z"/></svg>
                </a>
              )}
              {business.twitter && (
                <a
                  href={`https://x.com/${business.twitter}`}
                  className="social-icon"
                  aria-label="Twitter / X"
                  style={{ background: brand }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.46L23.3 22h-6.8l-5.3-6.9L5 22H1.9l7.9-9.05L1 2h6.9l4.8 6.3L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z"/></svg>
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  className="social-icon"
                  aria-label="Sitio web"
                  style={{ background: brand }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}