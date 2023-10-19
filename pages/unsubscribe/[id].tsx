import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/partials/Layout';
import { SubscriptionService } from '../../src/service/subscription-service';
import { decrypt } from '../../src/utils/encryption';
import { NewsletterSubscriptionService } from '../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../src/types/newsletter';
import { deleteSaveSearch } from '../../src/service/saved_search_service';
import ServiceErrorPage from '../service-error/index.page';
import { getUnsubscribeReferenceFromId } from '../../src/service/unsubscribe.service';

export async function getServerSideProps({ query: { id = '' } = {} }) {
  let emailAddress: string, notificationId: NotificationKey;
  try {
    const {
      user: { encryptedEmailAddress },
      subscriptionId,
      newsletterId,
      savedSearchId,
      type,
    } = await getUnsubscribeReferenceFromId(id as string);

    emailAddress = await decrypt(encryptedEmailAddress);
    notificationId = subscriptionId ?? newsletterId ?? savedSearchId;
    await handleUnsubscribe(type, notificationId, emailAddress);

    return { props: { error: false } };
  } catch (error: unknown) {
    return handleServerSideError(error, {
      id,
      emailAddress,
      notificationId,
    });
  }
}

const handleServerSideError = (
  error: unknown,
  { id, notificationId, emailAddress }: HandleServerSideErrorProps,
) => {
  if (!notificationId || !emailAddress) {
    console.error(
      `Failed to get user from unsubscribe reference id: ${id}. Error: ${JSON.stringify(
        error,
      )}`,
    );
  } else {
    console.error(
      `Failed to unsubscribe from notification id: ${notificationId}, with email: ${emailAddress}. Error: ${JSON.stringify(
        error,
      )}`,
    );
  }

  return { props: { error: true } };
};

const grantSubscriptionHandler = async (
  id: NotificationKey,
  emailAddress: string,
) => {
  const subscriptionService = SubscriptionService.getInstance();

  return subscriptionService.deleteSubscriptionByEmailAndGrantId(
    emailAddress,
    id as string,
  );
};

const newsletterHandler = async (id: NotificationKey, emailAddress: string) => {
  const newsletterSubscriptionService =
    NewsletterSubscriptionService.getInstance();

  return newsletterSubscriptionService.unsubscribeFromNewsletter(
    emailAddress,
    id as NewsletterType,
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
  emailAddress: string,
) => UNSUBSCRIBE_HANDLER_MAP[type](id, emailAddress);

type NotificationKey = string | NewsletterType | number;

type HandleServerSideErrorProps = {
  id: string;
  notificationId: NotificationKey;
  emailAddress: string;
};

const Unsubscribe = (props: undefined | { error: boolean }) => {
  if (props.error) {
    return <ServiceErrorPage />;
  }
  return (
    <>
      <Head>
        <title>Unsubscribe Confirmation</title>
      </Head>
      <Layout showBetaBlock={false} showNavigation={false}>
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
