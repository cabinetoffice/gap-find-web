/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isIE } from 'react-device-detect';
import { skipToMainContent } from '../../utils/skipToMainContent';

const Header = () => {
  const router = useRouter();
  const navItems = [
    {
      pageId: 'home',
      link: '/',
      as: '/',
      title: 'Home',
    },
    {
      pageId: 'browseGrants',
      link: '/grants',
      as: '/[slug]',
      title: 'Browse grants',
    },
    {
      pageId: 'aboutGrants',
      link: '/info/about-us',
      as: '/info/about-us',
      title: 'About us',
    },
  ];

  // Build the links in the main navigation && set active states
  const links = navItems.map((btn, index) => {
    return (
      <li
        data-value="parent"
        key={index}
        className={`app-navigation__list-item ${
          router.pathname === btn.link
            ? 'app-navigation__list-item--current'
            : ''
        }`}
        id={`${btn.pageId}DesktopLink`}
        data-cy={`cy${btn.pageId}PageLink`}
      >
        <Link href={btn.as} as={btn.link}>
          <a
            className="govuk-link govuk-link--no-visited-state app-navigation__link"
            data-topnav={btn.title}
          >
            {btn.title}
          </a>
        </Link>
      </li>
    );
  });

  // mobileLinks
  const mobileLinks = navItems.map((btn, index) => {
    return (
      <li
        data-value="parent"
        key={index}
        className={`mobile_nav_link ${
          router.pathname === btn.link ? 'current' : ''
        }`}
        id={`${btn.pageId}MobileLink`}
        data-cy={`cy${btn.pageId}PageMobileLink`}
      >
        <Link href={btn.as} as={btn.link}>
          <a data-topnav={btn.title}>{btn.title}</a>
        </Link>
      </li>
    );
  });

  // line-break: %0D%0A
  // space: %20
  // const mailToFeebackContent = `mailto:govtgrantscommunity@cabinetoffice.gov.uk?subject=Feedback%20for%20Find%20a%20Grant&body=Is%20the%20feedback%20about%20the%20whole%20site%20or%20a%20specific%20page?%0D%0A%0D%0AWhat%20is%20the%20feedback?%20Please%20do%20not%20include%20personal%20or%20financial%20information`;
  const mailToFeebackContent = `https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link`;

  return (
    <>
      {/* SKIP LINK */}
      <Link href="#main-content">
        <a
          className="govuk-skip-link"
          data-module="govuk-skip-link"
          data-cy="cySkipLink"
          onClick={skipToMainContent}
        >
          Skip to main content
        </a>
      </Link>

      {/* HEADER BLOCK */}
      <header
        className="govuk-header "
        role="banner"
        data-module="govuk-header"
      >
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <Link href="https://www.gov.uk/">
              <a className="govuk-header__link govuk-header__link--homepage">
                <span className="govuk-header__logotype">
                  {isIE ? (
                    <>
                      <img
                        src="/assets/images/govuk-logotype-crown.png"
                        className="govuk-header__logotype-crown-fallback-image"
                        alt="uk government crown logo"
                        width="36"
                        height="32"
                      />
                    </>
                  ) : (
                    <>
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        className="govuk-header__logotype-crown"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 132 97"
                        height="30"
                        width="36"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
                        ></path>
                      </svg>
                    </>
                  )}
                  <span
                    className="govuk-header__logotype-text"
                    data-cy="cyGovLogoLink"
                  >
                    GOV.UK
                  </span>
                </span>
              </a>
            </Link>
          </div>

          <div className="govuk-header__content">
            <div className="govuk-heading-m gap-service-name">Find a grant</div>
            {/*
              <button type="button"  className="govuk-header__menu-button govuk-js-header-toggle" aria-controls="navigation" aria-label="Show or hide navigation menu" aria-expanded="false">Menu</button>
            */}
          </div>
          {/*
          <details className="menu-toggler-mobile">
            <summary>Details</summary>
            <p>Something small enough to escape casual notice.</p>
          </details>
          */}
        </div>
      </header>

      {/* MOBILE VIEW MENU */}
      <details className="menu-toggler-mobile govuk-body">
        <summary
          data-cy="cyMobileMenuBtn"
          role="button"
          aria-label="Show or hide menu"
        >
          Menu
        </summary>
        {/* MAIN NAV BLOCK */}
        <nav aria-label="menu">
          <ul> {mobileLinks} </ul>
        </nav>
      </details>

      {/* BETA BLOCK */}
      <div className="govuk-width-container ">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              BETA
            </strong>
            <span className="govuk-phase-banner__text">
              This is a new service ??? your{' '}
              <Link href={mailToFeebackContent}>
                <a
                  className="govuk-link"
                  target="_blank"
                  data-cy="cyBetaFeedbackLinkBanner"
                >
                  feedback
                </a>
              </Link>{' '}
              will help us to improve it.
            </span>
          </p>
        </div>
      </div>

      {/* MAIN NAV BLOCK */}
      <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container">
        <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
          {' '}
          {links}{' '}
        </ul>
      </nav>
    </>
  );
};

export default Header;
