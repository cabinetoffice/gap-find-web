import Script from 'next/script';
import nookies from 'nookies';
import React, { createContext, useContext, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import '../src/lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';
import { checkUserLoggedIn } from '../src/service';
import { getJwtFromCookies } from '../src/utils/jwt';
import App from 'next/app';

export const AuthContext = createContext({
  isUserLoggedIn: false,
});
export const AppContext = createContext({
  applicantUrl: null,
  oneLoginEnabled: null,
});

export const useAuth = () => useContext(AuthContext);
export const useAppContext = () => useContext(AppContext);

const MyApp = ({
  Component,
  pageProps,
  props: { isUserLoggedIn, applicantUrl, oneLoginEnabled },
}) => {
  const cookies = nookies.get({});

  useEffect(() => {
    if (cookies.design_system_cookies_policy === 'true') {
      if (typeof window !== 'undefined' || typeof document !== 'undefined') {
        TagManager.initialize({ gtmId: 'GTM-52T2C9G' });
      } else {
        for (let i = 0; i < Object.keys(cookies).length; i++) {
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
      <AppContext.Provider value={{ applicantUrl, oneLoginEnabled }}>
        <AuthContext.Provider value={{ isUserLoggedIn }}>
          <Component {...pageProps} />
        </AuthContext.Provider>
      </AppContext.Provider>
    </>
  );
};

MyApp.getInitialProps = async (context) => {
  const ctx = await App.getInitialProps(context);
  let oneLoginEnabled = null;
  let applicantUrl = null;

  if (process?.env) {
    oneLoginEnabled = process.env.ONE_LOGIN_ENABLED;
    applicantUrl = process.env.APPLY_FOR_A_GRANT_APPLICANT_URL;
  }
  try {
    const { jwt } = getJwtFromCookies(context.ctx.req);
    const isUserLoggedIn = await checkUserLoggedIn(jwt);

    return { ...ctx, props: { isUserLoggedIn, applicantUrl, oneLoginEnabled } };
  } catch (err) {
    return {
      ...ctx,
      props: { isUserLoggedIn: false, applicantUrl, oneLoginEnabled },
    };
  }
};

export default MyApp;
