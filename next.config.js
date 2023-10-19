/** @type {import('next').NextConfig} */

const path = require('path');

module.exports = {
  serverRuntimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  reactStrictMode: true,
  // experimental: { optimizeCss: true },
  distDir: '.next',

  /* Add Your Scss File Folder Path Here */
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  output: 'standalone',
};
