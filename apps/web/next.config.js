const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// `output: 'export'` is incompatible with middleware. We need middleware in dev
// so that `localePrefix: 'as-needed'` renders the default locale at `/` and
// redirects `/en` → `/`. The package.json `dev` script renames middleware.ts.disabled
// into place; `build` renames it away and re-enables static export.
const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isDev ? {} : { output: 'export' }),
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = withNextIntl(nextConfig);
