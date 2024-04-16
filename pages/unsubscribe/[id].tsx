import Head from 'next/head';
import Layout from '../../src/components/partials/Layout';
import { SubscriptionService } from '../../src/service/subscription-service';
import { decrypt } from '../../src/utils/encryption';
import { NewsletterSubscriptionService } from '../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../src/types/newsletter';
import { deleteSaveSearch } from '../../src/service/saved_search_service';
import ServiceErrorPage from '../service-error/index.page';
import { UnsubscribeSubscriptionRequest } from '../../src/types/subscription';
import {
  getTypeFromNotificationIds,
  getUnsubscribeReferenceFromId,
} from '../../src/service/unsubscribe.service';
import { GetServerSidePropsContext } from 'next';
import { logger } from '../../src/utils';

export async function getServerSideProps({ query: { id = '' } = {}, req }) {
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
    return handleServerSideError(error, req, {
      id,
      emailAddress,
      notificationId,
      notificationType,
    });
  }
}

const handleServerSideError = (
  error: unknown,
  req: GetServerSidePropsContext['req'],
  {
    id,
    notificationId,
    emailAddress,
    notificationType,
  }: HandleServerSideErrorProps,
) => {
  if (!notificationId || !emailAddress) {
    logger.error(
      `Failed to get user from notification with type: ${notificationType}, id: ${id}`,
      logger.utils.addErrorInfo(error, req),
    );
  } else {
    logger.error(
      `Failed to unsubscribe from notification id: ${notificationId}, with email: ${emailAddress}`,
      logger.utils.addErrorInfo(error, req),
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

  return subscriptionService.deleteSubscriptionByEmailOrSubAndGrantId({
    emailAddress,
    grantId: id,
    unsubscribeReferenceId,
  } as UnsubscribeSubscriptionRequest);
};

const newsletterHandler = async (
  id: NotificationKey,
  emailAddress: string,
  unsubscribeReferenceId: string,
) => {
  const newsletterSubscriptionService =
    NewsletterSubscriptionService.getInstance();
  return newsletterSubscriptionService.unsubscribeFromNewsletter({
    plaintextEmail: emailAddress,
    type: id as NewsletterType,
    unsubscribeReferenceId,
  });
};

const savedSearchHandler = async (
  id: NotificationKey,
  emailAddress: string,
  unsubscribeReferenceId: string,
  // @TODO: use sub when ONE_LOGIN_ENABLED = 'true'
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
