'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Obtenemos el idioma actual de la URL (ej. /es/panel -> 'es')
  const currentLocale = pathname.split('/')[1] || 'es';

  const changeLanguage = (newLocale: 'es' | 'en') => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Dividimos la URL, reemplazamos el idioma y la volvemos a armar
      const segments = pathname.split('/');
      segments[1] = newLocale; 
      const newPathname = segments.join('/');

      router.replace(newPathname);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={() => changeLanguage('es')}
        disabled={isPending || currentLocale === 'es'}
        style={{
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid var(--line)',
          cursor: currentLocale === 'es' ? 'default' : 'pointer',
          background: currentLocale === 'es' ? 'var(--ink)' : 'transparent',
          color: currentLocale === 'es' ? 'var(--paper)' : 'var(--slate)',
        }}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending || currentLocale === 'en'}
        style={{
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid var(--line)',
          cursor: currentLocale === 'en' ? 'default' : 'pointer',
          background: currentLocale === 'en' ? 'var(--ink)' : 'transparent',
          color: currentLocale === 'en' ? 'var(--paper)' : 'var(--slate)',
        }}
      >
        EN
      </button>
    </div>
  );
}