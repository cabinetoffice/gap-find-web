import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import React, { useEffect, useState } from 'react';
import Layout from '../../src/components/partials/Layout';
import RelatedContent from '../../src/components/related-content';
import { maxAgeForConsentCookie } from '../../src/utils/constants';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../src/utils/related-content-links';

const Cookies = () => {
  const router = useRouter();

  let cookies = nookies.get({});

  const [cookiesAccept, setCookiesAccept] = useState();
  const [successMessage, setsuccessMessage] = useState(false);

  useEffect(() => {
    if (cookies.design_system_cookies_policy === 'true') {
      setCookiesAccept(true);
    } else {
      for (const element of Object.keys(cookies)) {
        nookies.destroy({}, element, { path: '/' });
      }

      nookies.set({}, 'design_system_cookies_policy', false, {
        maxAge: maxAgeForConsentCookie,
        path: '/',
      });

      setCookiesAccept(false);
    }
  }, [cookies]);

  const cookiesFormSubmit = (event) => {
    event.preventDefault();

    let cookieConsentValue = false;

    if (event.target.cookie_consent.value === 'accept') {
      cookieConsentValue = true;
    } else {
      for (const element of Object.keys(cookies)) {
        nookies.destroy({}, element, { path: '/' });
      }
    }

    nookies.set({}, 'design_system_cookies_policy', cookieConsentValue, {
      maxAge: maxAgeForConsentCookie,
      path: '/',
    });

    setsuccessMessage(true);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Head>
        <title>Cookies - Find a grant</title>
      </Head>
      <Layout description="Cookies for Find a grant">
        <div className="govuk-grid-row govuk-cookies-js-disabled">
          <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
            <h1 className="govuk-heading-xl" data-cy="cyCookiePageTitle">
              Change your cookie settings
            </h1>
            <p className="govuk-body">
              We cannot change your cookie settings at the moment because
              JavaScript is not running in your browser. To fix this, try:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>turning on JavaScript in your browser settings</li>
              <li>reloading this page</li>
            </ul>
          </div>
        </div>
        <div
          className="govuk-grid-row govuk-cookies-js-enabled"
          key={Math.random()}
        >
          <div
            className="govuk-grid-column-two-thirds govuk-!-margin-top-7"
            {...(!successMessage && { hidden: true })}
            aria-hidden={!successMessage}
          >
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="govuk-notification-banner-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__header">
                <h2
                  className="govuk-notification-banner__title"
                  id="govuk-notification-banner-title"
                >
                  Success
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                  You’ve set your cookie preferences.{' '}
                  <a
                    className="govuk-notification-banner__link"
                    onClick={() => router.back()}
                    href="#"
                  >
                    Go back to the page you were looking at
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
            <h1
              className="govuk-heading-xl govuk-!-margin-bottom-4"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cyCookiesTitle"
            >
              Cookies
            </h1>
          </div>
        </div>
        <div className="govuk-grid-row ">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              This site puts small files (known as ‘cookies’) on your computer.
            </p>
            <p className="govuk-body">
              These cookies are used across the Find a grant website.
            </p>
            <p className="govuk-body">
              We only set cookies when JavaScript is running in your browser and
              you’ve accepted them. If you choose not to run Javascript, the
              information on this page will not apply to you.
            </p>
            <p className="govuk-body">
              Find out{' '}
              <Link href="https://ico.org.uk/for-the-public/online/cookies">
                <a className="govuk-link" target="_blank">
                  how to manage cookies
                </a>
              </Link>{' '}
              from the Information Commissioner&apos;s Office.
            </p>
            <h2 className="govuk-heading-m govuk-!-font-size-27 govuk-!-margin-top-8 govuk-!-margin-bottom-4">
              Essential cookies
            </h2>
            <p className="govuk-body">We use 3 essential cookies:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                one remembers when you accept or reject cookies on our website
              </li>
              <li>
                one remembers who you are for 2 hours. This is so you do not
                need to verify who you are by email each time you access ‘Manage
                your notifications’
              </li>
              <li>
                one remembers who you are for 6 hours. This is so you do not
                need to verify who you are by email each time you access ‘Manage
                your applications’ and application form
              </li>
            </ul>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Essential cookies
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Purpose
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header  gap-overflow-wrap"
                  >
                    design_system_cookies_policy
                  </th>
                  <td className="govuk-table__cell">
                    Saves your cookie consent settings
                  </td>
                  <td className="govuk-table__cell">1 year</td>
                </tr>
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header  gap-overflow-wrap"
                  >
                    currentEmailAddress
                  </th>
                  <td className="govuk-table__cell">
                    verifies who you are when you access ‘Manage your
                    notifications’
                  </td>
                  <td className="govuk-table__cell">2 hours</td>
                </tr>
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header  gap-overflow-wrap"
                    npm
                  >
                    login_session
                  </th>
                  <td className="govuk-table__cell">
                    verifies who you are when you access ‘Manage your
                    applications’ and application form
                  </td>
                  <td className="govuk-table__cell">6 hours</td>
                </tr>
              </tbody>
            </table>
            <h2 className="govuk-heading-m govuk-!-font-size-27 govuk-!-margin-top-8 govuk-!-margin-bottom-4">
              Optional cookies
            </h2>
            <p className="govuk-body">
              We use Google Analytics software to understand how people use the
              GOV.UK Design System. We do this to help make sure the site is
              meeting the needs of its users and to help us make improvements.
            </p>
            <p className="govuk-body">
              We do not collect or store your personal information (for example
              your name or address) so this information cannot be used to
              identify who you are.
            </p>
            <p className="govuk-body">
              We do not allow Google to use or share our analytics data.
            </p>
            <p className="govuk-body">
              Google Analytics stores information about:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the pages you visit</li>
              <li>how long you spend on each page</li>
              <li>how you arrived at the site</li>
              <li>what you click on while you visit the site</li>
              <li>the device and browser you use</li>
            </ul>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Optional cookies
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Purpose
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    _ga
                  </th>
                  <td className="govuk-table__cell">
                    Helps us count how many people visit the Find a grant
                    website by telling us if you’ve visited before.
                  </td>
                  <td className="govuk-table__cell">2 years</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    _gid
                  </th>
                  <td className="govuk-table__cell">
                    Helps us count how many people visit the Find a grant
                    website by telling us if you’ve visited before.
                  </td>
                  <td className="govuk-table__cell">24 hours</td>
                </tr>
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header  gap-overflow-wrap"
                  >
                    _gat_UA-[random number]
                  </th>
                  <td className="govuk-table__cell">
                    It is used to cap the volume of requests made between Find a
                    grant service and Google Analytics - limiting the collection
                    of data on high traffic sites.
                  </td>
                  <td className="govuk-table__cell">1 minute</td>
                </tr>
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header  gap-overflow-wrap"
                  >
                    _gat_[random number]
                  </th>
                  <td className="govuk-table__cell">
                    It is used to cap the volume of requests made between Find a
                    grant service and Google Analytics - limiting the collection
                    of data on high traffic sites.
                  </td>
                  <td className="govuk-table__cell">1 minute</td>
                </tr>
              </tbody>
            </table>

            <form onSubmit={cookiesFormSubmit}>
              <div className="govuk-form-group govuk-!-margin-top-8">
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby="cookies-consent-message"
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s govuk-!-margin-bottom-3">
                    <h3
                      className="govuk-heading-m"
                      id="cookies-consent-message"
                    >
                      Do you want to accept analytics cookies?
                    </h3>
                  </legend>
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="contact"
                        name="cookie_consent"
                        type="radio"
                        value="accept"
                        defaultChecked={cookiesAccept}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="contact"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="contact-2"
                        name="cookie_consent"
                        type="radio"
                        value="reject"
                        defaultChecked={!cookiesAccept}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="contact-2"
                      >
                        No
                      </label>
                    </div>
                    <input
                      type="hidden"
                      aria-hidden="true"
                      name="refererSpok"
                      value="/info/terms-and-conditions"
                    />
                  </div>
                </fieldset>
                <button
                  type="submit"
                  className="govuk-button gap_flex govuk-!-margin-top-8"
                  data-module="govuk-button"
                >
                  Save cookie settings
                </button>
              </div>
            </form>
          </div>
          <RelatedContent
            links={[
              RelatedContentLinks.get(RelatedLinksNames.ABOUT_US),
              RelatedContentLinks.get(RelatedLinksNames.PRIVACY_NOTICE),
            ]}
          />
        </div>
      </Layout>
    </>
  );
};

export default Cookies;
