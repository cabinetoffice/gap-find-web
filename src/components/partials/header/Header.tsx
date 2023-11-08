/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { skipToMainContent } from '../../../utils/skipToMainContent';
import { getAuthenticatedNavItems, navItems } from './links';
import { GovUKHeader } from './GovUKHeader';
import { useAppContext } from '../../../../pages/_app';

const FEEDBACK_FORM_HREF = `https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link`;

const MobileLink = ({ btn, index, pathname }) => (
  <li
    data-value="parent"
    key={index}
    className={`mobile_nav_link ${pathname === btn.link ? 'current' : ''}`}
    id={`${btn.pageId}MobileLink`}
    data-cy={`cy${btn.pageId}PageMobileLink`}
  >
    <Link href={btn.as} as={btn.link}>
      <a data-topnav={btn.title}>{btn.title}</a>
    </Link>
  </li>
);

const getNavItems = (isUserLoggedIn: boolean, applicantUrl: string) =>
  isUserLoggedIn ? getAuthenticatedNavItems(applicantUrl) : navItems;

const MobileViewMenu = ({ isUserLoggedIn }: { isUserLoggedIn: boolean }) => {
  const { applicantUrl } = useAppContext();

  const { pathname } = useRouter();

  return (
    <details className="menu-toggler-mobile govuk-body">
      <summary
        data-cy="cyMobileMenuBtn"
        role="button"
        aria-label="Show or hide menu"
      >
        Menu
      </summary>
      <nav aria-label="menu">
        <ul>
          {getNavItems(isUserLoggedIn, applicantUrl).map((btn, index) => (
            <MobileLink
              key={index}
              btn={btn}
              index={index}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>
    </details>
  );
};

const BetaBlock = ({ isUserLoggedIn }: { isUserLoggedIn: boolean }) => {
  const { oneLoginEnabled } = useAppContext();
  return (
    <div className="govuk-width-container ">
      <div className="govuk-phase-banner">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">
                BETA
              </strong>
              <span className="govuk-phase-banner__text">
                This is a new service – your{' '}
                <Link href={FEEDBACK_FORM_HREF}>
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
          {isUserLoggedIn && oneLoginEnabled === 'true' && <SignOut />}
        </div>
      </div>
    </div>
  );
};

const MainNavBlock = ({ isUserLoggedIn }: { isUserLoggedIn: boolean }) => {
  const router = useRouter();
  const { applicantUrl } = useAppContext();
  const links = getNavItems(isUserLoggedIn, applicantUrl).map((btn, index) => {
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
  return (
    <nav className="app-navigation govuk-clearfix g2_navigation govuk-width-container">
      <ul className="app-navigation__list app-width-container g2_navigation__menu gap_nav-wrapper">
        {links}
      </ul>
    </nav>
  );
};

const Header = ({ isBasic = false, isUserLoggedIn = false }) => (
  <>
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
    <GovUKHeader />
    <MobileViewMenu isUserLoggedIn={isUserLoggedIn} />
    {!isBasic && (
      <>
        <BetaBlock isUserLoggedIn={isUserLoggedIn} />
        <MainNavBlock isUserLoggedIn={isUserLoggedIn} />
      </>
    )}
  </>
);

const SignOut = () => (
  <div className="govuk-grid-column-one-quarter">
    <p className="govuk-!-text-align-right govuk-!-font-size-19 govuk-!-margin-0">
      <Link href="/api/logout">
        <a className="govuk-link">Sign out</a>
      </Link>
    </p>
  </div>
);

export default Header;
