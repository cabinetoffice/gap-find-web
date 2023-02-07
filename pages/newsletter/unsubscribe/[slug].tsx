import Head from 'next/head';
import Link from 'next/link';
import { BreadCrumbs } from '../../../src/components/breadcrumbs/BreadCrumbs';
import Layout from '../../../src/components/partials/Layout';
import {
  cookieName,
  newsletterRoutes,
  notificationRoutes,
} from '../../../src/utils/constants';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
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
    path: newsletterRoutes['unsubscribe'],
  },
];

export async function getServerSideProps(ctx) {
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

  return {
    props: {},
  };
}

function notifications() {
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout>
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <BreadCrumbs routes={breadcrumbsRoutes} />
        </div>
        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-two-thirds">
            <h1
              className="govuk-heading-l"
              data-cy="cyUnsubscribeGrantConfirmationPageTitle"
              id="main-content-focus"
              tabIndex={-1}
            >
              Are you sure you want to unsubscribe from updates about new
              grants?
            </h1>
          </div>
          <div className="govuk-grid-column-two-thirds">
            <form method="post" action="/api/newsletter/unsubscribe">
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
