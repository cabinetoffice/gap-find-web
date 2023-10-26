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
import { fetchGrantDetail } from '../../subscriptions/signup';
import {
  cookieName,
  notificationRoutes,
  tableHeadArr,
  URL_ACTIONS,
  URL_ACTION_MESSAGES,
} from '../../../src/utils/constants';
import {
  fetchByGrantId,
  fetchByGrantIds,
} from '../../../src/utils/contentFulPage';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';

import { formatDateTimeForSentence } from '../../../src/utils/dateFormatterGDS';
import { decrypt } from '../../../src/utils/encryption';
import gloss from '../../../src/utils/glossary.json';
import { axios, getJwtFromCookies } from '../../../src/utils';
import nookies from 'nookies';

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

export const getServerSideProps = async (ctx) => {
  const { jwtPayload, jwt } = getJwtFromCookies(ctx.req);
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

  let grantId = ctx.query.grantId;

  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const { grantLabel } = nookies.get(ctx);
    ctx.res.setHeader(
      'Set-Cookie',
      `${cookieName.grantLabel}=deleted; Path=/; Max-Age=0`,
    );

    const grantDetail = await fetchGrantDetail({ id: grantLabel });
    grantId = grantDetail['props']?.grantDetail.sys.id ?? ctx.query.grantId;

    if (ctx.query.action === URL_ACTIONS.SUBSCRIBE && grantLabel) {
      await axios({
        method: 'post',
        url: `${process.env.HOST}/api/subscription`,
        data: {
          contentfulGrantSubscriptionId: grantId,
          emailAddress: jwtPayload.email,
          sub: jwtPayload.sub,
        },
      });
    }
  }

  // Fetch individual grant details if required for things like success messages
  const grantDetails = grantId ? await fetchByGrantId(grantId) : null;

  // Fetch the user's grant subscriptions
  const subscriptionService = SubscriptionService.getInstance();
  const plainTextEmailAddress = await getEmail(ctx);

  let subscriptions = await subscriptionService.getSubscriptionsByEmail(
    plainTextEmailAddress,
    jwt,
  );
  if (subscriptions) {
    subscriptions = await mergeGrantNameIntoSubscriptions(subscriptions);
  }

  // Fetch the user's newsletter subscription
  const newsletterSubsService = NewsletterSubscriptionService.getInstance();
  const newsletterSubscription =
    await newsletterSubsService.getByEmailAndNewsletterType(
      plainTextEmailAddress,
      NewsletterType.NEW_GRANTS,
      jwt,
    );

  const newGrantsParams = generateWeeklyNewsletterParams();
  const savedSearches = await getAllSavedSearches(plainTextEmailAddress, jwt);

  return {
    props: {
      currentNotificationList: JSON.stringify(subscriptions),
      grantDetails,
      urlAction: ctx.query.action !== undefined ? ctx.query.action : null,
      deletedSavedSearchName:
        ctx.query.savedSearchName !== undefined
          ? ctx.query.savedSearchName
          : null,
      newsletterSubscription: newsletterSubscription ?? null,
      newGrantsParams,
      savedSearches,
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
  let message = URL_ACTION_MESSAGES.get(action);

  if (action === URL_ACTIONS.SUBSCRIBE || action === URL_ACTIONS.UNSUBSCRIBE) {
    message = addGrantDetailsToMessage(message, grantDetails);
  }

  if (action === URL_ACTIONS.DELETE_SAVED_SEARCH) {
    message = `${URL_ACTION_MESSAGES.get(action)} ${deletedSavedSearchName}`;
  }

  return message;
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
          {!!urlAction && (
            <ConfirmationMessage
              message={generateSuccessMessage(
                urlAction,
                grantDetails,
                deletedSavedSearchName,
              )}
            />
          )}
          <div className="govuk-grid-column-full ">
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

export default ManageNotifications;
