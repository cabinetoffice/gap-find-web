import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Layout from '../../src/components/partials/Layout';
import {
  LOGIN_NOTICE_TYPES,
  URL_ACTIONS,
  notificationRoutes,
} from '../../src/utils';

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

const { MANAGE_NOTIFICATIONS, SUBSCRIPTION_NOTIFICATIONS } = LOGIN_NOTICE_TYPES;

export const NOTICE_CONTENT = {
  [MANAGE_NOTIFICATIONS]: {
    title: 'Manage your notifications',
    content: [
      'To manage your notifications, you need to sign in with GOV.UK One Login.',
      'If you do not have a GOV.UK One Login, you can create one.',
      'If you want to unsubscribe from notifications without creating a GOV.UK One Login, you can use the unsubscribe link in the emails we send to you.',
    ],
    redirectUrl: notificationRoutes.manageNotifications,
  },
  [SUBSCRIPTION_NOTIFICATIONS]: {
    title: 'Sign up for updates',
    content: [
      'To sign up for updates, you need to sign in with GOV.UK One Login.',
      'If you do not have a GOV.UK One Login, you can create one.',
    ],
    redirectUrl: `${notificationRoutes.manageNotifications}?action=${URL_ACTIONS.SUBSCRIBE}`,
  },
} as const;

export const getServerSideProps = (ctx: GetServerSidePropsContext) => ({
  props: {
    type: ctx.params.type,
    userServiceHost: USER_SERVICE_HOST,
    host: HOST,
  },
});

const LoginNotice = ({ type, host, userServiceHost }) => {
  const { title, content, redirectUrl } = NOTICE_CONTENT[type];
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout isBasicHeader>
        <div className="govuk-grid-row govuk-!-margin-top-7">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{title}</h1>
            {content.map((paragraph) => (
              <p key={paragraph} className="govuk-body">
                {paragraph}
              </p>
            ))}
            <a
              className="govuk-button"
              href={`${userServiceHost}/v2/login?redirectUrl=${host}${redirectUrl}`}
            >
              Continue to One Login
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginNotice;
