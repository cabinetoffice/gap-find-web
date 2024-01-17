import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import nookies from 'nookies';

const CookieBanner = () => {
  const router = useRouter();

  let cookies = nookies.get({});

  const [cookiesStatement, setcookiesStatement] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    if (cookies.design_system_cookies_policy) {
      setcookiesStatement(true);
      setShowCookies(true);
    }
  }, [cookies]);

  const rejectCookies = () => {
    for (let i = 0; i < Object.keys(cookies).length; i++) {
      nookies.destroy({}, Object.keys(cookies)[i], { path: '/' });
    }

    nookies.set({}, 'design_system_cookies_policy', false, {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    setcookiesStatement(true);
    setShowReject(true);
  };

  const acceptCookies = () => {
    nookies.set({}, 'design_system_cookies_policy', true, {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    setcookiesStatement(true);
    setShowAccept(true);
  };

  const hideWholeBanner = () => {
    setShowReject(false);
    setShowAccept(false);
    setShowCookies(true);
    router.reload(window.location.pathname);
  };

  return (
    <div
      className="govuk-cookie-banner "
      data-nosnippet
      role="region"
      aria-label="Cookies on Find a grant"
      {...(showCookies && { hidden: true })}
      aria-hidden={showCookies}
    >
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        {...(cookiesStatement && { hidden: true })}
        aria-hidden={cookiesStatement}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-cookie-banner__heading govuk-heading-m">
              Cookies on Find a grant
            </h2>

            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                We use some essential cookies to make this service work.
              </p>
              <p className="govuk-body">
                We’d also like to use analytics cookies so we can understand how
                you use the service and make improvements.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            type="button"
            className="govuk-button"
            onClick={() => acceptCookies()}
            data-module="govuk-button"
          >
            Accept analytics cookies
          </button>
          <button
            type="button"
            className="govuk-button"
            onClick={() => rejectCookies()}
            data-module="govuk-button"
          >
            Reject analytics cookies
          </button>
          <Link href="/info/cookies">
            <a className="govuk-link">View cookies</a>
          </Link>
        </div>
      </div>

      <div
        className="govuk-cookie-banner__message govuk-width-container"
        role="alert"
        {...(!showAccept && { hidden: true })}
        aria-hidden={!showAccept}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve accepted analytics cookies. You can{' '}
                <Link href="/info/cookies">
                  <a className="govuk-link">change your cookie settings</a>
                </Link>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideWholeBanner()}
          >
            Hide this message
          </button>
        </div>
      </div>

      <div
        className="govuk-cookie-banner__message govuk-width-container"
        role="alert"
        {...(!showReject && { hidden: true })}
        aria-hidden={!showReject}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve rejected analytics cookies. You can{' '}
                <Link href="/info/cookies">
                  <a className="govuk-link">change your cookie settings</a>
                </Link>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideWholeBanner()}
          >
            Hide this message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
