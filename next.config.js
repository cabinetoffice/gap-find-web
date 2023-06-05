/** @type {import('next').NextConfig} */

const path = require('path');
const withSass = require('@zeit/next-sass');

module.exports = withSass({
  /* bydefault config  option Read For More Optios
  here https://github.com/vercel/next-plugins/tree/master/packages/next-sass
  */
  cssModules: true,
});
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
  output: 'standalone'
};