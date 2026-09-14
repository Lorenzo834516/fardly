const createNextIntlPlugin = require('next-intl/plugin');

// Le pasamos el camino relativo de tu archivo de configuración i18n
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);