import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localeDetection: true
});

export const config = {
  // Ignora rutas de API, archivos estáticos y Next.js interno
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};