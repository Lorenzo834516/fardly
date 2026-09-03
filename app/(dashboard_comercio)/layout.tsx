'use client';

import './dashboard.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Retención IA', href: '/dashboard/retencion' },
    { name: 'Reputación', href: '/dashboard/reputacion' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar Superior Profesional con Contraste Fijo */}
      <header
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.85rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link 
            href="/" 
            style={{ textDecoration: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.05em' }}
          >
            FARDLY <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>| PANEL</span>
          </Link>

          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? '#1E293B' : 'transparent',
                    border: isActive ? '1px solid #334155' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: '#94A3B8',
            fontSize: '0.85rem',
            border: '1px solid #334155',
            backgroundColor: '#1E293B',
            padding: '0.45rem 0.9rem',
            borderRadius: '6px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        >
          ← Volver a Inicio
        </Link>
      </header>

      {/* Contenedor Principal de Vistas */}
      <main style={{ maxWidth: 1120, margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}