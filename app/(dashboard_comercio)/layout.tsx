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
      {/* Navbar Superior Responsive sin librerías externas */}
      <header
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.85rem 1.5rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {/* Brand & NavLinks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link 
              href="/" 
              style={{ textDecoration: 'none', color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.05em' }}
            >
              FARDLY <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>| PANEL</span>
            </Link>

            <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
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

          {/* Action button */}
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
            }}
          >
            ← Volver a Inicio
          </Link>
        </div>
      </header>

      {/* Contenedor Principal Ajustable */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
}