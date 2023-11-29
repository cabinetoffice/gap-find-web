import Link from 'next/link';
import {
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
} from '../../../utils/constants';
import { useAppContext, useAuth } from '../../../../pages/_app';

const getManageNotificationsPath = (oneLoginEnabled, isUserLoggedIn) => {
  if (oneLoginEnabled) {
    if (isUserLoggedIn)
      return { pathname: notificationRoutes.manageNotifications };
    return {
      pathname: `${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`,
    };
  }
  return { pathname: notificationRoutes.checkEmail };
};

export function HomepageSidebar({ header }) {
  const { applicantUrl, oneLoginEnabled } = useAppContext();
  const { isUserLoggedIn } = useAuth();

  return (
    <div className="govuk-grid-column-one-third">
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour" />
      <h2 className="govuk-heading-m">{header}</h2>
      <p className="govuk-body">
        See all the grant updates you have signed up for. You can unsubscribe
        here too.
      </p>
      <p>
        <Link
          data-cy="cyManageNotificationsHomeLink"
          href={getManageNotificationsPath(oneLoginEnabled, isUserLoggedIn)}
        >
          <a className="govuk-link govuk-body">
            Manage notifications and saved searches
          </a>
        </Link>
      </p>
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour" />
      <h2 className="govuk-heading-m" data-cy="cySignInAndApply-header">
        Sign in and apply
      </h2>
      <p className="govuk-body" data-cy="cySignInAndApply-body">
        See your grant applications or start a new one.
      </p>
      <p>
        <a
          href={applicantUrl}
          className="govuk-link govuk-body"
          data-cy="cySignInAndApply-Link"
        >
          Sign in and apply
        </a>
      </p>
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour" />
      <p className="govuk-body">
        Tell us how you think our service can improve{' '}
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link">
          <a
            className="govuk-link"
            target="_blank"
            data-cy="cyBetaFeedbackLinkHomePage"
          >
            through our feedback form
          </a>
        </Link>
        .
      </p>
    </div>
  );
}
