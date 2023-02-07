import Script from 'next/script';
import nookies from 'nookies';
import React, { useEffect } from 'react';
import TagManager from 'react-gtm-module';
import '../src/lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';

const MyApp = ({ Component, pageProps }) => {
  let cookies = nookies.get({});

  useEffect(() => {
    if (cookies.design_system_cookies_policy === 'true') {
      if (typeof window !== 'undefined' || typeof document !== 'undefined') {
        TagManager.initialize({ gtmId: 'GTM-52T2C9G' });
      } else {
        for (var i = 0; i < Object.keys(cookies).length; i++) {
          nookies.destroy({}, Object.keys(cookies)[i], { path: '/' });
        }

        nookies.set({}, 'design_system_cookies_policy', false, {
          maxAge: 365 * 24 * 60 * 60,
          path: '/',
        });
      }
    }
  }, [cookies]);

  return (
    <>
      <Script src="/javascript/govuk.js" strategy="beforeInteractive" />

      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
