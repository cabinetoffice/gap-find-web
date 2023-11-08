import React from 'react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Layout from '../../src/components/partials/Layout';
import {
  LOGIN_NOTICE_TYPES,
  URL_ACTIONS,
  notificationRoutes,
} from '../../src/utils';
import { buildQueryString } from '../save-search';

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

const {
  MANAGE_NOTIFICATIONS,
  SUBSCRIPTION_NOTIFICATIONS,
  SAVED_SEARCH,
  NEWSLETTER,
} = LOGIN_NOTICE_TYPES;

// can be replaced with tickets 1976 / 1975
const DEFAULT_CONTENT = {
  title: 'Manage your notifications',
  content: [
    'To manage your notifications, you need to sign in with GOV.UK One Login.',
    'If you do not have a GOV.UK One Login, you can create one.',
    'If you want to unsubscribe from notifications without creating a GOV.UK One Login, you can use the unsubscribe link in the emails we send to you.',
  ],
  redirectUrl: notificationRoutes.manageNotifications,
};

const getNotificationContent = (action: string) => [
  `To ${action}, you need to sign in with GOV.UK One Login.`,
  'If you do not have a GOV.UK One Login, you can create one.',
];

export const NOTICE_CONTENT = {
  [MANAGE_NOTIFICATIONS]: () => ({
    title: 'Manage your notifications',
    content: [
      ...getNotificationContent('manage your notifications'),
      'If you want to unsubscribe from notifications without creating a GOV.UK One Login, you can use the unsubscribe link in the emails we send to you.',
    ],
    redirectUrl: notificationRoutes.manageNotifications,
  }),
  [SUBSCRIPTION_NOTIFICATIONS]: () => ({
    title: 'Sign up for updates',
    content: getNotificationContent('sign up for updates'),
    redirectUrl: `${notificationRoutes.manageNotifications}?action=${URL_ACTIONS.SUBSCRIBE}`,
  }),
  [SAVED_SEARCH]: (ctx) => ({
    title: 'Save your search',
    content: getNotificationContent('save a search'),
    redirectUrl: `${notificationRoutes.saveSearch}?${buildQueryString(
      ctx.query,
    )}`,
  }),
  [NEWSLETTER]: () => DEFAULT_CONTENT,
} as const;

export const getServerSideProps = (ctx: GetServerSidePropsContext) => {
  const { title, content, redirectUrl } =
    NOTICE_CONTENT[ctx.params?.type as string](ctx);
  return {
    props: {
      title,
      content,
      redirectUrl,
      type: ctx.params?.type,
      userServiceHost: USER_SERVICE_HOST,
      host: HOST,
    },
  };
};

const getRedirectUrlQueryString = (type: string) =>
  `?migrationType=${type}${
    type === SUBSCRIPTION_NOTIFICATIONS
      ? `&action=${URL_ACTIONS.SUBSCRIBE}`
      : ''
  }`;

const LoginNotice = ({
  title,
  content,
  redirectUrl,
  type,
  host,
  userServiceHost,
}) => {
  const formattedRedirectUrl = encodeURIComponent(
    `${host}${redirectUrl}${getRedirectUrlQueryString(type)}`,
  );
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout isBasicHeader>
        <div className="govuk-grid-row govuk-!-margin-top-7">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{title}</h1>
            {content.map((paragraph: string, idx: number) => (
              <p key={idx} className="govuk-body">
                {paragraph}
              </p>
            ))}
            <div className="govuk-button-group">
              <a
                className="govuk-button"
                href={`${userServiceHost}/v2/login?redirectUrl=${formattedRedirectUrl}`}
              >
                Continue to One Login
              </a>
              <a
                className="govuk-link"
                data-cy="cyCancelNewsletterSignup"
                href={host}
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginNotice;
