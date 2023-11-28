const path = require('path');
require('dotenv-safe').config();

/** @type {import('next').NextConfig} */

module.exports = {
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
