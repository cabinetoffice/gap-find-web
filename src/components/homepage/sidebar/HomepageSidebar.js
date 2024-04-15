import Link from 'next/link';
import { notificationRoutes } from '../../../utils/constants';
import { useAppContext, useAuth } from '../../../../pages/_app';
import { getUserRolesRelatedRedirect } from '../../../service';

export function HomepageSidebar({ header, applicantUrl, oneLoginEnabled }) {
  const manageNotificationsLink =
    oneLoginEnabled === 'true'
      ? notificationRoutes.manageNotifications
      : notificationRoutes.checkEmail;

  const { roles: userRoles, isUserLoggedIn } = useAuth();
  const adminUrl = useAppContext().adminUrl;
  let redirectHref = applicantUrl;
  if (isUserLoggedIn)
    redirectHref = getUserRolesRelatedRedirect(
      applicantUrl,
      adminUrl,
      userRoles,
    );

  return (
    <div className="govuk-grid-column-one-third">
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour" />
      <h2 className="govuk-heading-m">{header}</h2>
      <p className="govuk-body">
        See all the grant updates you have signed up for. You can unsubscribe
        here too.
      </p>
      <p>
        <a
          className="govuk-link govuk-body"
          data-cy="cyManageNotificationsHomeLink"
          href={manageNotificationsLink}
        >
          Manage notifications and saved searches
        </a>
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
          href={redirectHref}
          className="govuk-link govuk-body"
          data-cy="cySignInAndApply-Link"
        >
          Sign in and apply
        </a>
      </p>
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour" />
      <p className="govuk-body">
        Tell us how you think our service can improve{' '}
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSe6H5atE1WQzf8Fzjti_OehNmTfY0Bv_poMSO-w8BPzkOqr-A/viewform?usp=sf_link"
          className="govuk-link"
          target="_blank"
          data-cy="cyBetaFeedbackLinkHomePage"
        >
          through our feedback form
        </Link>
        .
      </p>
    </div>
  );
}
