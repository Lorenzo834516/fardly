'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const stamps = Array.from({ length: 10 }, (_, i) => i < 7);
  const [showMore, setShowMore] = useState(false);
  const sectionRefs = useRef<HTMLElement[]>([]);

  // Anima cada sección justo cuando entra en pantalla, no todas al cargar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function registerSection(el: HTMLElement | null) {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <style>{`
        .scroll-section {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .scroll-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .cta-pill {
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .cta-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .cta-pill:active {
          transform: translateY(0);
        }

        .nav-item {
          color: rgba(255, 248, 240, 0.85);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .nav-item:hover {
          color: var(--paper);
        }

        .dropdown-item {
          color: var(--ink);
          text-decoration: none;
          font-size: 0.88rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: background 0.15s ease;
        }
        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .footer-link {
          color: rgba(255,248,240,0.75);
          text-decoration: underline;
          text-underline-offset: 3px;
          font-size: 0.92rem;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: var(--paper);
        }

        /* Que el hero no se rompa en pantallas angostas */
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .main-nav {
            display: none !important;
          }
        }
      `}</style>

      {/* Header fijo */}
      <header
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '1.2rem 3.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 248, 240, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          FARDLY
        </span>

        <nav className="main-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#como-funciona" className="nav-item">Cómo funciona</a>
          <a href="#precios" className="nav-item">Precios</a>
          <a href="#casos" className="nav-item">Casos</a>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="nav-item"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'inherit',
              }}
            >
              Más <span style={{ fontSize: '0.75rem' }}>▾</span>
            </button>

            {showMore && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  background: 'var(--paper)',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  width: 190,
                  zIndex: 101,
                  border: '1px solid var(--line)',
                }}
              >
                <Link href="/registro" className="dropdown-item">Crear cuenta gratis</Link>
                <Link href="/login" className="dropdown-item">Iniciar sesión</Link>
              </div>
            )}
          </div>
        </nav>

        <Link
          href="/login"
          style={{ color: 'rgba(255,248,240,0.9)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
        >
          Iniciar sesión →
        </Link>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column' }}>

        {/* SECCIÓN 1: HERO */}
        <section
          ref={registerSection}
          className="scroll-section"
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '6rem 3.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div className="hero-grid" style={{ maxWidth: 1100, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span className="eyebrow">Para negocios de barrio</span>
              <h1 style={{ fontSize: '3.2rem', lineHeight: 1.05, margin: 0 }}>
                Convierte clientes en clientes frecuentes.
              </h1>
              <p style={{ color: 'rgba(255,248,240,0.75)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
                Se crea en 30 segundos y tus clientes la guardan en su celular, sin apps.
                Reemplaza la tarjetita de cartón por sellos digitales, cupones y recordatorios por WhatsApp.
              </p>
              <div>
                <Link
                  href="/registro"
                  className="cta-pill"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'var(--gold)',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    padding: '0.9rem 2rem',
                    borderRadius: 999,
                    textDecoration: 'none',
                    fontSize: '1.05rem',
                  }}
                >
                  Registrar mi negocio
                </Link>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Se activa al instante, sin instalar nada', '7 días gratis, sin tarjeta', 'Cancela cuando quieras'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,248,240,0.85)', fontSize: '0.95rem' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,248,240,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="stampcard">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,248,240,0.6)' }}>
                  TARJETA DIGITAL
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold)' }}>
                  7 / 10
                </span>
              </div>
              <div className="stampcard-grid">
                {stamps.map((filled, i) => (
                  <div key={i} className={`stamp-dot ${filled ? 'filled' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
                    {filled ? '★' : i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: CÓMO FUNCIONA */}
        <section
          id="como-funciona"
          ref={registerSection}
          className="scroll-section"
          style={{
            background: 'var(--paper)',
            padding: '6rem 3.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <span className="eyebrow" style={{ color: 'var(--stamp)' }}>Cómo funciona</span>

            {[
              ['01', 'Tu cliente escanea un QR', 'En la caja, en la mesa o en tu vitrina — sin descargar ninguna app.'],
              ['02', 'Suma puntos o sellos', 'Cada compra suma. Tú decides las reglas desde tu panel.'],
              ['03', 'Vuelve por WhatsApp', 'Recordatorios y cupones automáticos cuando el cliente lleva tiempo sin volver.'],
            ].map(([n, title, desc]) => (
              <div key={n} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--stamp)', fontSize: '1rem', fontWeight: 'bold' }}>{n}</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', marginTop: 0 }}>{title}</h3>
                  <p style={{ color: 'var(--slate)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 3: PRECIOS */}
        <section
          id="precios"
          ref={registerSection}
          className="scroll-section"
          style={{
            background: 'var(--card)',
            padding: '6rem 3.5rem',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--stamp)' }}>Planes flexibles</span>
            <h2 style={{ fontSize: '2.2rem', margin: '0.5rem 0 2rem' }}>Precios transparentes para tu negocio</h2>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--paper)',
                border: '1px dashed var(--line)',
                borderRadius: 999,
                padding: '0.7rem 1.5rem',
                color: 'var(--slate)',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
              Estamos afinando los planes — mientras tanto, regístrate gratis
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: CASOS DE ÉXITO */}
        <section
          id="casos"
          ref={registerSection}
          className="scroll-section"
          style={{
            background: 'var(--paper)',
            padding: '6rem 3.5rem',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--stamp)' }}>Casos de uso</span>
            <h2 style={{ fontSize: '2.2rem', margin: '0.5rem 0 2rem' }}>Así lo usan negocios como el tuyo</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {['Cafeterías', 'Reposterías', 'Barberías', 'Restaurantes'].map((rubro) => (
                <div
                  key={rubro}
                  style={{
                    background: 'var(--card)',
                    borderRadius: 14,
                    padding: '1.5rem 1rem',
                    color: 'var(--slate)',
                    fontWeight: 600,
                  }}
                >
                  {rubro}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--slate)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Próximamente, ejemplos reales de negocios usando FARDLY.
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          ref={registerSection}
          className="scroll-section"
          style={{ background: 'var(--paper)', padding: '4rem 3.5rem', display: 'flex', justifyContent: 'center' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
              background: 'var(--card)',
              borderRadius: 16,
              padding: '2rem 2.5rem',
              maxWidth: 800,
              width: '100%',
              border: '1px solid var(--line)',
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Lista para lanzar en 30 segundos</p>
              <p style={{ color: 'var(--slate)', fontSize: '0.95rem', margin: '0.3rem 0 0' }}>Sin tarjeta de crédito.</p>
            </div>
            <Link
              href="/registro"
              className="cta-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontWeight: 700,
                padding: '0.9rem 2rem',
                borderRadius: 999,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Crea la tuya ya
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '3.5rem 3.5rem 2rem' }}>
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2.5rem',
              paddingBottom: '2.5rem',
              borderBottom: '1px solid rgba(255,248,240,0.12)',
            }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                FARDLY
              </span>
              <p style={{ color: 'rgba(255,248,240,0.6)', fontSize: '0.88rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                El sello de fidelidad de tu negocio, ahora en el celular de tus clientes.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                PRODUCTO
              </span>
              <a href="#como-funciona" className="footer-link">Cómo funciona</a>
              <a href="#precios" className="footer-link">Precios</a>
              <a href="#casos" className="footer-link">Casos de uso</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                EMPEZAR
              </span>
              <Link href="/registro" className="footer-link">Crear cuenta gratis</Link>
              <Link href="/login" className="footer-link">Iniciar sesión</Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,248,240,0.5)', fontSize: '0.82rem', marginTop: '1.75rem' }}>
            © {new Date().getFullYear()} FARDLY. Todos los derechos reservados.
          </p>
        </footer>

      </main>
    </div>
  );
}