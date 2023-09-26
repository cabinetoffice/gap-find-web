import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../../src/components/partials/Layout';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { decrypt } from '../../../src/utils/encryption';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../../src/types/newsletter';
import {
  deleteSaveSearch,
  getBySavedSearchId,
} from '../../../src/service/saved_search_service';

export async function getServerSideProps({ query: { jwt = '' } = {} } = {}) {
  try {
    const decodedJwt = decryptSignedApiKey(jwt);
    const { id, type } = decodedJwt;
    let emailAddress = decodedJwt.emailAddress;
    //SAVED_SEARCH is the only notification that doesn't have an encrypted email address
    if (type !== 'SAVED_SEARCH') {
      console.log({ type });
      emailAddress = await decrypt(emailAddress);
    }

    await handleUnsubscribe(type, id, emailAddress);
    return { props: { err: '' } };
  } catch (err: unknown) {
    //redirect?
    return { props: { err: JSON.stringify(err) } };
  }
}

const grantSubscriptionHandler = async (
  id: NotificationKey,
  emailAddress: string
) => {
  const subscriptionService = SubscriptionService.getInstance();

  return subscriptionService.deleteSubscriptionByEmailAndGrantId(
    emailAddress,
    id as string
  );
};

const newsletterHandler = async (id: NotificationKey, emailAddress: string) => {
  const newsletterSubscriptionService =
    NewsletterSubscriptionService.getInstance();

  return newsletterSubscriptionService.unsubscribeFromNewsletter(
    emailAddress,
    id as NewsletterType
  );
};

const savedSearchHandler = async (id: NotificationKey, emailAddress: string) =>
  deleteSaveSearch(id as number, emailAddress);

const UNSUBSCRIBE_HANDLER_MAP = {
  GRANT_SUBSCRIPTION: grantSubscriptionHandler,
  SAVED_SEARCH: savedSearchHandler,
  NEWSLETTER: newsletterHandler,
};

const handleUnsubscribe = async (
  type: keyof typeof UNSUBSCRIBE_HANDLER_MAP,
  id: NotificationKey,
  emailAddress: string
) => UNSUBSCRIBE_HANDLER_MAP[type](id, emailAddress);

type NotificationKey = string | NewsletterType | number;

const Unsubscribe = ({ err }) => {
  return (
    <>
      <Head>
        <title>Unsubscribe Confirmation</title>
      </Head>
      <Layout showBetaBlock={false} showNavigation={false}>
        {err && JSON.stringify(err)}
        <div className="govuk-grid-row govuk-body govuk-!-margin-top-8">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              data-cy="cyUnsubscribeGrantConfirmationPageTitle"
              id="main-content-focus"
              tabIndex={-1}
            >
              You have unsubscribed
            </h1>
          </div>
          <div className="govuk-grid-column-two-thirds">
            <p
              className="govuk-body"
              data-cy="cyUnsubscribeConfirmationGrantsDetail"
            >
              We will not send you any more emails about new grants.
            </p>
            <p
              className="govuk-body"
              data-cy="cyUnsubscribeConfirmationGrantsDetail"
            >
              If you want to unsubscribe from all emails, contact us at{' '}
              <Link
                href={{ pathname: 'mailto:findagrant@cabinetoffice.gov.uk' }}
                className="govuk-link govuk-body"
              >
                <a className={`govuk-link govuk-link--no-visited-state`}>
                  findagrant@cabinetoffice.gov.uk
                </a>
              </Link>
              .
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Unsubscribe;
