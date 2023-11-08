import { GetServerSideProps } from 'next';
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
import {
  SavedSearch,
  SavedSearchStatusType,
  getAllSavedSearches,
  save as saveSearch,
} from '../../../src/service/saved_search_service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import {
  NewsletterSubscription,
  NewsletterType,
} from '../../../src/types/newsletter';
import {
  cookieName,
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
  tableHeadArr,
  URL_ACTION_MESSAGES,
  URL_ACTION_SUBHEADINGS,
  URL_ACTIONS,
  getJwtFromCookies,
  logger,
} from '../../../src/utils';
import {
  buildSavedSearchFilters,
  getDateFromFilters,
  extractFiltersFields,
  addPublishedDateFilter,
} from '../../../src/utils/transform';
import {
  fetchByGrantId,
  fetchByGrantIds,
  fetchFilters,
} from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { formatDateTimeForSentence } from '../../../src/utils/dateFormatterGDS';
import { decrypt } from '../../../src/utils/encryption';
import gloss from '../../../src/utils/glossary.json';
import { MigrationBanner } from '../../../src/components/notification-banner';
import { MigrationBannerProps } from '../../../src/types/subscription';
import { Entry } from 'contentful';

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

const getEmail = async (ctx) => {
  if (process.env.ONE_LOGIN_ENABLED != 'true') {
    return getEmailAddressFromCookies(ctx);
  }
  const { jwtPayload } = getJwtFromCookies(ctx.req);

  return jwtPayload.email as string;
};

const getUserId = async (ctx) => {
  if (process.env.ONE_LOGIN_ENABLED != 'true') {
    return getEmailAddressFromCookies(ctx);
  }
  const { jwtPayload } = getJwtFromCookies(ctx.req);

  return jwtPayload.sub as string;
};

const fetchOrCreateNewsletterSubscription = async ({
  userId,
  jwtValue,
  action,
  plainTextEmailAddress,
}) => {
  const newsletterSubsService = NewsletterSubscriptionService.getInstance();

  // Fetch the user's newsletter subscription
  let newsletterSubscription =
    await newsletterSubsService.getBySubAndNewsletterType(
      userId,
      NewsletterType.NEW_GRANTS,
      jwtValue,
    );

  // Creates new subscription if required
  if (action === URL_ACTIONS.NEWSLETTER_SUBSCRIBE) {
    if (!newsletterSubscription) {
      newsletterSubscription =
        await newsletterSubsService.subscribeToNewsletter(
          plainTextEmailAddress,
          NewsletterType.NEW_GRANTS,
          jwtValue,
          userId,
        );
    } else {
      action = null;
    }
  }
  return { newsletterSubscription, derivedAction: action };
};

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

const sortGrantSubscriptions = (a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const fetchSubscriptions = async ({ userId, jwtValue }) => {
  const subscriptions =
    await SubscriptionService.getInstance().getSubscriptionsByEmail(
      userId,
      jwtValue,
    );
  if (!subscriptions) return [];
  const mergedSubscriptions =
    await mergeGrantNameIntoSubscriptions(subscriptions);
  return mergedSubscriptions.sort(sortGrantSubscriptions);
};

const fetchSavedSearches = async ({ userId, jwtValue }) => {
  const savedSearches = await getAllSavedSearches(userId, jwtValue);
  return savedSearches
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((savedSearch) => savedSearch.status === 'CONFIRMED');
};

const getFilterObjectFromQuery = (query, filters) => {
  const filterObjFromQuery = extractFiltersFields(query, filters);
  addPublishedDateFilter(query, filterObjFromQuery);
  return filterObjFromQuery;
};

const hasSaveSearchParams = (query) => query.search_name;

const buildSavedSearch = async (query, jwtPayload) => {
  const filterObjFromQuery = getFilterObjectFromQuery(
    query,
    await fetchFilters(),
  );
  return {
    name: query.search_name,
    search_term: query.searchTerm,
    filters: buildSavedSearchFilters(filterObjFromQuery),
    fromDate: getDateFromFilters(filterObjFromQuery, 'gte'),
    toDate: getDateFromFilters(filterObjFromQuery, 'lte'),
    status: SavedSearchStatusType.CONFIRMED,
    notifications: query.notifications_consent === 'true' ? true : false,
    email: jwtPayload.email,
    sub: jwtPayload.sub,
  };
};

const saveNotificationIfPresent = async ({
  action,
  grantId,
  jwtPayload,
  ctx,
}) => {
  if (action === URL_ACTIONS.SUBSCRIBE && grantId) {
    await SubscriptionService.getInstance().addSubscription({
      emailAddress: jwtPayload.email,
      sub: jwtPayload.sub,
      grantId,
    });
  } else if (
    action === URL_ACTIONS.SAVED_SEARCH_SUBSCRIBE &&
    hasSaveSearchParams(ctx.query)
  ) {
    await saveSearch(await buildSavedSearch(ctx.query, jwtPayload));
    return {
      redirect: {
        permanent: false,
        destination: `${notificationRoutes.manageNotifications}?action=${action}`,
      },
    };
  }
};

type ManageNotificationsProps = {
  currentNotificationList: object[];
  grantDetails: Entry<unknown> | null;
  urlAction: string | null;
  deletedSavedSearchName: string | null;
  newsletterSubscription: NewsletterSubscription;
  newGrantsParams: ReturnType<typeof generateWeeklyNewsletterParams>;
  savedSearches: SavedSearch[];
  migrationBannerProps: MigrationBannerProps;
};

export const getServerSideProps: GetServerSideProps<
  ManageNotificationsProps
> = async (ctx) => {
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

  const action = ctx.query.action;

  const plainTextEmailAddress = await getEmail(ctx);
  const userId = await getUserId(ctx);

  const grantId = ctx.query.grantId;
  let jwtValue: string,
    migrationBannerProps: MigrationBannerProps = {
      applyMigrationStatus: null,
      findMigrationStatus: null,
      migrationType: null,
    };

  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const { jwtPayload, jwt } = getJwtFromCookies(ctx.req);
    jwtValue = jwt;

    const redirect = await saveNotificationIfPresent({
      action,
      grantId,
      jwtPayload,
      ctx,
    });

    if (redirect) return redirect;

    migrationBannerProps = {
      applyMigrationStatus: (ctx.query.applyMigrationStatus as string) || null,
      findMigrationStatus: (ctx.query.findMigrationStatus as string) || null,
      migrationType: (ctx.query.migrationType as string) || null,
    };
  }

  const { newsletterSubscription, derivedAction } =
    await fetchOrCreateNewsletterSubscription({
      userId,
      jwtValue,
      action,
      plainTextEmailAddress,
    });

  return {
    props: {
      currentNotificationList: await fetchSubscriptions({
        userId,
        jwtValue,
      }),
      // Fetch individual grant details if required for things like success messages
      grantDetails: grantId ? await fetchByGrantId(grantId) : null,
      urlAction: derivedAction || null,
      deletedSavedSearchName: (ctx.query.savedSearchName as string) || null,
      newsletterSubscription: newsletterSubscription || null,
      newGrantsParams: generateWeeklyNewsletterParams(),
      savedSearches: await fetchSavedSearches({
        userId,
        jwtValue,
      }),
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
  const {
    NEWSLETTER_SUBSCRIBE,
    SUBSCRIBE,
    UNSUBSCRIBE,
    SAVED_SEARCH_SUBSCRIBE,
    DELETE_SAVED_SEARCH,
  } = URL_ACTIONS;
  let heading = URL_ACTION_MESSAGES.get(action);
  let subheading = null;

  if ([NEWSLETTER_SUBSCRIBE].includes(action)) {
    heading = URL_ACTION_MESSAGES.get(action);
    subheading = URL_ACTION_SUBHEADINGS.get(action);
  } else if ([SUBSCRIBE, UNSUBSCRIBE].includes(action)) {
    heading = addGrantDetailsToMessage(heading, grantDetails);
  } else if (action === SAVED_SEARCH_SUBSCRIBE) {
    heading = URL_ACTION_MESSAGES.get(action);
    subheading = URL_ACTION_SUBHEADINGS.get(action);
  } else if (action === DELETE_SAVED_SEARCH) {
    heading = `${URL_ACTION_MESSAGES.get(action)} ${deletedSavedSearchName}`;
  }

  return { heading, subheading };
};

const buildQueryString = (filters) =>
  filters.map((filter) => `${filter.name}=${filter.subFilterid}`).join('&');

const ManageNotifications = ({
  currentNotificationList,
  grantDetails,
  urlAction,
  deletedSavedSearchName,
  newsletterSubscription,
  newGrantsParams,
  savedSearches,
  migrationBannerProps,
}) => {
  const notificationAndSavedSearchList = [
    ...currentNotificationList,
    ...savedSearches,
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
    migrationBannerProps.applyMigrationStatus ??
    migrationBannerProps.findMigrationStatus;

  const shouldRenderMigrationBanner =
    migrationBannerProps.migrationType && hasMigrationStatus;

  const hideConfirmationMessage = checkShouldHideConfirmationMessage(
    migrationBannerProps,
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
      <Layout>
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <BreadCrumbs routes={breadcrumbsRoutes} />
        </div>

        <div className="govuk-grid-row govuk-body">
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
                {...migrationBannerProps}
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
            {!!newsletterSubscription && (
              <ManageNewsletter
                signupDate={newsletterSubscription.createdAt}
                subscriptionId={newsletterSubscription.id}
                newGrantsDateParams={newGrantsParams}
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
