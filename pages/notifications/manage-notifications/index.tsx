import Head from 'next/head';
import Link from 'next/link';
import { BreadCrumbs } from '../../../src/components/breadcrumbs/BreadCrumbs';
import { ConfirmationMessage } from '../../../src/components/confirmation-message/ConfirmationMessage';
import { ManageNewsletter } from '../../../src/components/manage-newsletter/ManageNewsletter';
import Layout from '../../../src/components/partials/Layout';
import { Table } from '../../../src/components/table';
import { generateWeeklyNewsletterParams } from '../../../src/manager/newsletter_manager';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { getAllSavedSearches } from '../../../src/service/saved_search_service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { NewsletterType } from '../../../src/types/newsletter';
import {
  cookieName,
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
  tableHeadArr,
  URL_ACTION_MESSAGES,
  URL_ACTION_SUBHEADINGS,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import {
  fetchByGrantId,
  fetchByGrantIds,
} from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';

import { formatDateTimeForSentence } from '../../../src/utils/dateFormatterGDS';
import { decrypt } from '../../../src/utils/encryption';
import gloss from '../../../src/utils/glossary.json';
import { client as axios, getJwtFromCookies, logger } from '../../../src/utils';
import nookies from 'nookies';
import { MigrationBanner } from '../../../src/components/notification-banner';
import { MigrationBannerProps } from '../../../src/types/subscription';
import { GetServerSidePropsContext } from 'next';

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
    label: 'Manage your Notifications',
    path: notificationRoutes['manageNotifications'],
  },
];

/**
 * A convenience function that merges Contentful grant data into a list of the user's subscriptions to simplify displaying
 * this information on the front end.
 *
 * @param {*} subscriptions
 * @returns a merged list of Grant titles with the user's subscriptions to those grants.
 */
const mergeGrantNameIntoSubscriptions = async (subscriptions) => {
  // Fetch grants that the user is subscribed to from Contentful
  const subscribedGrants = await fetchByGrantIds(
    subscriptions.map(
      (subscription) => subscription.contentfulGrantSubscriptionId,
    ),
  );

  return subscriptions.map((subscription) => {
    const foundGrant = subscribedGrants.find(
      (grant) => subscription.contentfulGrantSubscriptionId === grant.sys.id,
    );

    if (foundGrant) {
      subscription.grantName = foundGrant.fields.grantName;
    }

    return subscription;
  });
};

const getEmail = async (ctx) => {
  if (process.env.ONE_LOGIN_ENABLED != 'true') {
    return getEmailAddressFromCookies(ctx);
  }
  const { jwtPayload } = getJwtFromCookies(ctx.req);

  return jwtPayload.email as string;
};

const getSub = async (ctx) => {
  if (process.env.ONE_LOGIN_ENABLED != 'true') {
    return getEmailAddressFromCookies(ctx);
  }
  const { jwtPayload } = getJwtFromCookies(ctx.req);

  return jwtPayload.sub as string;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (
    process.env.ONE_LOGIN_ENABLED != 'true' &&
    !cookieExistsAndContainsValidJwt(ctx, cookieName['currentEmailAddress'])
  ) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    };
  }

  let action = ctx.query.action;

  const plainTextEmailAddress = await getEmail(ctx);
  const sub = await getSub(ctx);

  let grantId = ctx.query.grantId;
  let jwtValue: string,
    migrationBannerProps: MigrationBannerProps = {
      applyMigrationStatus: null,
      findMigrationStatus: null,
      migrationType: null,
    };

  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const { jwtPayload, jwt } = getJwtFromCookies(ctx.req);
    jwtValue = jwt;
    const { grantIdCookieValue } = nookies.get(ctx);
    ctx.res.setHeader(
      'Set-Cookie',
      `${cookieName.grantId}=deleted; Path=/; Max-Age=0`,
    );

    grantId = grantIdCookieValue ?? ctx.query.grantId;

    if (ctx.query.action === URL_ACTIONS.SUBSCRIBE && grantIdCookieValue) {
      await axios.post(
        new URL(`${process.env.HOST}/api/subscription`).toString(),
        {
          contentfulGrantSubscriptionId: grantId,
          emailAddress: jwtPayload.email,
          sub: jwtPayload.sub,
        },
      );
    }
    const {
      applyMigrationStatus = null,
      findMigrationStatus = null,
      migrationType = null,
    } = ctx.query as Record<string, string>;
    migrationBannerProps = {
      applyMigrationStatus,
      findMigrationStatus,
      migrationType,
    };
  }

  // Fetch individual grant details if required for things like success messages
  const grantDetails = grantId ? await fetchByGrantId(grantId) : null;

  // Fetch the user's grant subscriptions
  const subscriptionService = SubscriptionService.getInstance();

  let subscriptions = await subscriptionService.getSubscriptionsByEmail(
    plainTextEmailAddress,
    jwtValue,
  );
  if (subscriptions) {
    subscriptions = await mergeGrantNameIntoSubscriptions(subscriptions);
  }

  const newsletterSubsService = NewsletterSubscriptionService.getInstance();

  // Fetch the user's newsletter subscription
  let newsletterSubscription = sub
    ? await newsletterSubsService.getBySubAndNewsletterType(
        sub,
        NewsletterType.NEW_GRANTS,
        jwtValue,
      )
    : await newsletterSubsService.getByEmailAndNewsletterType(
        plainTextEmailAddress,
        NewsletterType.NEW_GRANTS,
        jwtValue,
      );
  // Creates new subscription if required
  if (ctx.query.action === URL_ACTIONS.NEWSLETTER_SUBSCRIBE) {
    if (!newsletterSubscription) {
      newsletterSubscription =
        await newsletterSubsService.subscribeToNewsletter(
          plainTextEmailAddress,
          NewsletterType.NEW_GRANTS,
          jwtValue,
          sub,
        );
    } else {
      action = null;
    }
  }

  const newGrantsParams = generateWeeklyNewsletterParams();
  const savedSearches = await getAllSavedSearches(
    plainTextEmailAddress,
    jwtValue,
  );

  return {
    props: {
      currentNotificationList: JSON.stringify(subscriptions),
      grantDetails,
      urlAction: action !== undefined ? action : null,
      deletedSavedSearchName:
        ctx.query.savedSearchName !== undefined
          ? ctx.query.savedSearchName
          : null,
      newsletterSubscription: newsletterSubscription ?? null,
      newGrantsParams,
      savedSearches,
      migrationBannerProps,
    },
  };
};

async function getEmailAddressFromCookies(ctx) {
  const decodedEmailCookie = decryptSignedApiKey(
    ctx.req.cookies['currentEmailAddress'],
  );
  return decrypt(decodedEmailCookie.email);
}

const addGrantDetailsToMessage = (message, grantDetails) =>
  `${message} "${grantDetails.fields.grantName}".`;

const generateSuccessMessage = (
  action,
  grantDetails,
  deletedSavedSearchName,
) => {
  const { NEWSLETTER_SUBSCRIBE, SUBSCRIBE, UNSUBSCRIBE, DELETE_SAVED_SEARCH } =
    URL_ACTIONS;
  let heading = URL_ACTION_MESSAGES.get(action);
  let subheading = null;

  if ([NEWSLETTER_SUBSCRIBE].includes(action)) {
    heading = URL_ACTION_MESSAGES.get(action);
    subheading = URL_ACTION_SUBHEADINGS.get(action);
  } else if ([SUBSCRIBE, UNSUBSCRIBE].includes(action)) {
    heading = addGrantDetailsToMessage(heading, grantDetails);
  } else if (action === DELETE_SAVED_SEARCH) {
    heading = `${URL_ACTION_MESSAGES.get(action)} ${deletedSavedSearchName}`;
  }

  return { heading, subheading };
};

const buildQueryString = (filters) =>
  filters.map((filter) => `${filter.name}=${filter.subFilterid}`).join('&');

const ManageNotifications = (props) => {
  const sortedSubscribedGrantUpdateList = JSON.parse(
    props.currentNotificationList,
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const { grantDetails, urlAction, savedSearches, deletedSavedSearchName } =
    props;
  const sortedSavedSearchList = savedSearches
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((savedSearch) => savedSearch.status === 'CONFIRMED');

  const notificationAndSavedSearchList = [
    ...sortedSubscribedGrantUpdateList,
    ...sortedSavedSearchList,
  ];

  const notificationAndSavedSearchTableContent =
    notificationAndSavedSearchList.map((item) => {
      const isGrant = Object.hasOwn(item, 'contentfulGrantSubscriptionId');

      const cells = [
        {
          children: isGrant ? (
            <span data-cy={`cy${item.grantName}UnsubscriptionTableName`}>
              {item.grantName}
            </span>
          ) : (
            <Link
              href={`/grants?${
                item.search_term ? `searchTerm=${item.search_term}&` : ''
              }${buildQueryString(item.filters)}`}
            >
              <a
                className="govuk-link"
                data-cy={`cy${item.name}SavedSearchTableName`}
              >
                {item.name}
              </a>
            </Link>
          ),
        },
        {
          children: `You ${
            isGrant ? 'signed up for updates' : 'saved this search'
          } on ${formatDateTimeForSentence(item.createdAt)}`,
        },
        {
          children: (
            <Link
              href={
                isGrant
                  ? `${notificationRoutes['unsubscribe']}/${item.contentfulGrantSubscriptionId}`
                  : `${notificationRoutes['deleteSaveSearch']}/${item.id}`
              }
            >
              <a
                className="govuk-link"
                data-cy={
                  isGrant
                    ? `cy${item.grantName}UnsubscribeLink`
                    : `cy${item.name}DeleteLink`
                }
              >
                {isGrant ? 'Unsubscribe' : 'Delete'}
              </a>
            </Link>
          ),
        },
      ];
      return { cells };
    });

  const hasMigrationStatus =
    props.migrationBannerProps.applyMigrationStatus ??
    props.migrationBannerProps.findMigrationStatus;

  const shouldRenderMigrationBanner =
    props.migrationBannerProps.migrationType && hasMigrationStatus;

  const hideConfirmationMessage = checkShouldHideConfirmationMessage(
    props.migrationBannerProps,
    shouldRenderMigrationBanner,
  );

  if (!shouldRenderMigrationBanner && hasMigrationStatus) {
    logger.error(
      'Migration banner props found but no migration type was passed from user-service.',
    );
  }

  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout isUserLoggedIn={props.isUserLoggedIn}>
        <div className="govuk-grid-row govuk-body padding-bottom40 govuk-!-margin-top-9">
          {!!urlAction && !hideConfirmationMessage && (
            <ConfirmationMessage
              {...generateSuccessMessage(
                urlAction,
                grantDetails,
                deletedSavedSearchName,
              )}
            />
          )}
          <div className="govuk-grid-column-full ">
            {shouldRenderMigrationBanner && (
              <MigrationBanner
                nameOfGrantUpdated={
                  grantDetails?.fields?.grantName &&
                  `"${grantDetails.fields.grantName}"`
                }
                {...props.migrationBannerProps}
              />
            )}
            <h1
              className="govuk-heading-l"
              data-cy="cyManageYourNotificationsHeading"
              id="main-content-focus"
              tabIndex={-1}
            >
              Manage your notifications and saved searches
            </h1>
            {!!props.newsletterSubscription && (
              <ManageNewsletter
                signupDate={props.newsletterSubscription.createdAt}
                subscriptionId={props.newsletterSubscription.id}
                newGrantsDateParams={props.newGrantsParams}
              />
            )}
            {notificationAndSavedSearchList.length > 0 ? (
              <Table
                caption="Saved searches and grants you are following:"
                captionClassName="govuk-heading-m"
                head={tableHeadArr}
                rows={notificationAndSavedSearchTableContent}
              />
            ) : (
              <div>
                <p data-cy="cyManageYourNotificationsNoData">
                  {
                    "You are not signed up for any notifications, and you don't have any saved searches."
                  }
                </p>
                <Link href={'/grants'}>
                  <a className="govuk-link" data-cy="cySearchForGrantsLink">
                    Search for grants
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

const checkShouldHideConfirmationMessage = (
  migrationBannerProps: {
    migrationType: string;
    applyMigrationStatus: string;
    findMigrationStatus: string;
  },
  shouldRenderMigrationBanner: boolean,
) => {
  const isSubscriptionNotificationMigration =
    migrationBannerProps.migrationType ===
    LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS;

  if (!shouldRenderMigrationBanner && isSubscriptionNotificationMigration)
    return false;

  const migrationPassed =
    migrationBannerProps.applyMigrationStatus === 'SUCCEEDED' ||
    migrationBannerProps.findMigrationStatus === 'SUCCEEDED';
  const noFailedMigrations =
    migrationBannerProps.applyMigrationStatus !== 'FAILED' &&
    migrationBannerProps.findMigrationStatus !== 'FAILED';

  return migrationPassed && noFailedMigrations;
};

export default ManageNotifications;
