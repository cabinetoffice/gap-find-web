import Head from 'next/head';
import Link from 'next/link';
import nookies from 'nookies';
import { BreadCrumbs } from '../../../src/components/breadcrumbs/BreadCrumbs';
import Layout from '../../../src/components/partials/Layout';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { cookieName, notificationRoutes } from '../../../src/utils/constants';
import { fetchByGrantId } from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { decrypt } from '../../../src/utils/encryption';
import gloss from '../../../src/utils/glossary.json';

//TODO GAP-560 / GAP-592
const breadcrumbsRoutes = [
  {
    label: 'Home',
    path: notificationRoutes['home'],
  },
  {
    label: 'Notifications',
    path: notificationRoutes['notificationsHome'],
  },
  {
    label: 'Unsubscribe',
    path: notificationRoutes['unsubscribe'],
  },
];

export async function getServerSideProps(ctx) {
  const {
    query: { slug = '' },
  } = ctx;

  if (
    !cookieExistsAndContainsValidJwt(ctx, cookieName['currentEmailAddress'])
  ) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    };
  }

  const { currentEmailAddress } = nookies.get(ctx);
  const decodedEmail = decryptSignedApiKey(currentEmailAddress);
  const decryptedEmailAddress = await decrypt(decodedEmail.email);

  const subscriptionService = SubscriptionService.getInstance();

  const subscription =
    await subscriptionService.getSubscriptionByEmailAndGrantId(
      decryptedEmailAddress,
      slug
    );
  const grantDetails = await fetchByGrantId(
    subscription.contentfulGrantSubscriptionId
  );
  return {
    props: {
      unsubscribeGrant: JSON.stringify(subscription),
      email: currentEmailAddress,
      grantDetails: grantDetails.fields,
    },
  };
}

function notifications({ unsubscribeGrant, email, grantDetails }) {
  unsubscribeGrant = JSON.parse(unsubscribeGrant);
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout description="Notifications">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <BreadCrumbs routes={breadcrumbsRoutes} />
        </div>
        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              data-cy="cyUnsubscribeGrantConfirmationPageTitle"
              id="main-content-focus"
              tabIndex={-1}
            >
              Are you sure you want to unsubscribe?
            </h1>
          </div>
          <div className="govuk-grid-column-two-thirds">
            <p
              className="govuk-body"
              data-cy="cyUnsubscribeConfirmationGrantsDetail"
            >
              You will not get any more updates about {grantDetails.grantName}
            </p>
            <br />

            <form method="post" action="/api/unsubscribe-subscription">
              <input
                type="hidden"
                name="grantId"
                value={unsubscribeGrant.contentfulGrantSubscriptionId}
              />
              <input type="hidden" name="email" value={email} />
              <button
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cyUnsubscribeConfirmationButton"
              >
                Yes, unsubscribe
              </button>
            </form>
            <br />
            <Link href={notificationRoutes['manageNotifications']}>
              <a className="govuk-link" data-cy="cyCancelUnsubscribe">
                Cancel
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default notifications;
