/** @type {import('next').NextConfig} */

const path = require('path');

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
  publicRuntimeConfig: {
    APPLY_FOR_A_GRANT_APPLICANT_URL:
      process.env.APPLY_FOR_A_GRANT_APPLICANT_URL,
  },
};
