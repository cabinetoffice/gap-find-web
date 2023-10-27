import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/partials/Layout';
import { SubscriptionService } from '../../src/service/subscription-service';
import { decrypt } from '../../src/utils/encryption';
import { NewsletterSubscriptionService } from '../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../src/types/newsletter';
import { deleteSaveSearch } from '../../src/service/saved_search_service';
import ServiceErrorPage from '../service-error/index.page';
import {
  getTypeFromNotificationIds,
  getUnsubscribeReferenceFromId,
} from '../../src/service/unsubscribe.service';

export async function getServerSideProps({ query: { id = '' } = {} }) {
  let emailAddress: string,
    notificationId: NotificationKey,
    notificationType: keyof typeof UNSUBSCRIBE_HANDLER_MAP;
  try {
    const {
      user: { encryptedEmailAddress },
      subscriptionId,
      newsletterId,
      savedSearchId,
    } = await getUnsubscribeReferenceFromId(id as string);

    notificationType = getTypeFromNotificationIds({
      subscriptionId,
      newsletterId,
      savedSearchId,
    });
    emailAddress = await decrypt(encryptedEmailAddress);
    notificationId = subscriptionId ?? newsletterId ?? savedSearchId;

    await handleUnsubscribe(notificationType, notificationId, emailAddress, id);

    return { props: { error: false } };
  } catch (error: unknown) {
    return handleServerSideError(error, {
      id,
      emailAddress,
      notificationId,
      notificationType,
    });
  }
}

const handleServerSideError = (
  error: unknown,
  {
    id,
    notificationId,
    emailAddress,
    notificationType,
  }: HandleServerSideErrorProps,
) => {
  if (!notificationId || !emailAddress) {
    console.error(
      `Failed to get user from notification with type: ${notificationType}, id: ${id}. Error: ${JSON.stringify(
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
  unsubscribeReferenceId: string,
) => {
  const subscriptionService = SubscriptionService.getInstance();
  return subscriptionService.deleteSubscriptionByEmailAndGrantId(
    emailAddress,
    id as string,
    unsubscribeReferenceId,
  );
};

const newsletterHandler = async (
  id: NotificationKey,
  emailAddress: string,
  unsubscribeReferenceId: string,
) => {
  const newsletterSubscriptionService =
    NewsletterSubscriptionService.getInstance();
  console.log('handler', id, emailAddress, unsubscribeReferenceId);
  return newsletterSubscriptionService.unsubscribeFromNewsletter(
    emailAddress,
    id as NewsletterType,
    unsubscribeReferenceId,
  );
};

const savedSearchHandler = async (
  id: NotificationKey,
  emailAddress: string,
  unsubscribeReferenceId: string,
) => deleteSaveSearch(id as number, emailAddress, unsubscribeReferenceId);

const UNSUBSCRIBE_HANDLER_MAP = {
  GRANT_SUBSCRIPTION: grantSubscriptionHandler,
  SAVED_SEARCH: savedSearchHandler,
  NEWSLETTER: newsletterHandler,
};

const handleUnsubscribe = async (
  type: keyof typeof UNSUBSCRIBE_HANDLER_MAP,
  notificationKey: NotificationKey,
  emailAddress: string,
  unsubscribeReferenceId: string,
) => {
  return UNSUBSCRIBE_HANDLER_MAP[type](
    notificationKey,
    emailAddress,
    unsubscribeReferenceId,
  );
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
      <Layout isBasicHeader>
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

type NotificationKey = string | NewsletterType | number;

type HandleServerSideErrorProps = {
  id: string;
  notificationId: NotificationKey;
  notificationType: keyof typeof UNSUBSCRIBE_HANDLER_MAP;
  emailAddress: string;
};

export default Unsubscribe;
