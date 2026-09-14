import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Aseguramos que si no hay idioma asignado se use 'es' como predeterminado
  const currentLocale = locale || 'es';

  return {
    locale: currentLocale,
    messages: (await import(`./messages/${currentLocale}.json`)).default
  };
});