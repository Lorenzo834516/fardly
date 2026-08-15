'use client';

import Link from 'next/link';

export default function Home() {
  const stamps = Array.from({ length: 10 }, (_, i) => i < 7);

  return (
    <main
      className="split"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        minHeight: '100vh',
      }}
    >
      {/* Panel narrativo */}
      <section
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.5rem',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          FARDLY
        </span>
        <span className="eyebrow">Para negocios de barrio</span>
        <h1 style={{ fontSize: '3rem', lineHeight: 1.05, maxWidth: 520 }}>
          Convierte clientes en clientes frecuentes.
        </h1>
        <p style={{ color: 'rgba(255,248,240,0.75)', fontSize: '1.05rem', maxWidth: 460, lineHeight: 1.6 }}>
          Reemplaza la tarjetita de cartón por un sistema de puntos, cupones y
          recordatorios por WhatsApp — sin salir de tu caja registradora.
        </p>

        <div style={{ display: 'flex', gap: '0.9rem', marginTop: '0.5rem' }}>
          <Link href="/registro" className="btn btn-primary">
            Registrar mi negocio
          </Link>
          <a href="#como-funciona" className="btn btn-ghost">
            Ver cómo funciona
          </a>
        </div>

        <div className="stampcard" style={{ marginTop: '2rem' }}>
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
              <div
                key={i}
                className={`stamp-dot ${filled ? 'filled' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {filled ? '★' : i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Panel de valor */}
      <section
        id="como-funciona"
        style={{
          background: 'var(--paper)',
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        {[
          ['01', 'Tu cliente escanea un QR', 'En la caja, en la mesa o en tu vitrina — sin descargar ninguna app.'],
          ['02', 'Suma puntos o sellos', 'Cada compra suma. Tú decides las reglas desde tu panel.'],
          ['03', 'Vuelve por WhatsApp', 'Recordatorios y cupones automáticos cuando el cliente lleva tiempo sin volver.'],
        ].map(([n, title, desc]) => (
          <div key={n} style={{ display: 'flex', gap: '1.2rem', borderBottom: '1px solid var(--line)', paddingBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--stamp)', fontSize: '0.85rem' }}>{n}</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{title}</h3>
              <p style={{ color: 'var(--slate)', margin: 0, lineHeight: 1.55 }}>{desc}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}