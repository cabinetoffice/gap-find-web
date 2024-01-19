import Link from 'next/link';
import { useAuth } from '../../../../pages/_app';
import {
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
} from '../../../utils/constants';

const getSubscriptionPath = ({ isUserLoggedIn, grantId, grantLabel }) => ({
  pathname: isUserLoggedIn
    ? notificationRoutes.subscriptionSignUp
    : `${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS}`,
  query: { grantId, grantLabel },
});

export function GrantDetailsSidebar({ grantLabel, grantId }) {
  const { isUserLoggedIn } = useAuth();
  return (
    <div className="govuk-grid-column-one-quarter">
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour"></hr>
      <h2 className="govuk-heading-m">Get updates about this grant</h2>
      <Link href={getSubscriptionPath({ isUserLoggedIn, grantId, grantLabel })}>
        <a className="govuk-link" data-cy="cySignupUpdatesLink">
          Sign up for updates
        </a>
      </Link>
    </div>
  );
}
