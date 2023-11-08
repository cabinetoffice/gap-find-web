import Script from 'next/script';
import nookies from 'nookies';
import React, { createContext, useContext, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import '../src/lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';
import { checkUserLoggedIn } from '../src/service';
import { getJwtFromCookies } from '../src/utils/jwt';
import App from 'next/app';

export const AuthContext = createContext({ isUserLoggedIn: false });

export const useAuth = () => useContext(AuthContext);

const MyApp = ({ Component, pageProps, isUserLoggedIn }) => {
  const cookies = nookies.get({});

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
      <AuthContext.Provider value={{ isUserLoggedIn }}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </>
  );
};

MyApp.getInitialProps = async (context) => {
  const ctx = await App.getInitialProps(context);
  try {
    const { jwt } = getJwtFromCookies(context.ctx.req);
    const isUserLoggedIn = await checkUserLoggedIn(jwt);
    return { ...ctx, isUserLoggedIn };
  } catch (err) {
    return { ...ctx, isUserLoggedIn: false };
  }
};

export default MyApp;
