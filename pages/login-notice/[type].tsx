import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Layout from '../../src/components/partials/Layout';
import { LOGIN_NOTICE_TYPES, notificationRoutes } from '../../src/utils';

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

const { MANAGE_NOTIFICATIONS } = LOGIN_NOTICE_TYPES;

const NOTICE_CONTENT = {
  [MANAGE_NOTIFICATIONS]: {
    title: 'Manage your notifications',
    content: [
      'To manage your notifications, you need to sign in with GOV.UK One Login.',
      'If you do not have a GOV.UK One Login, you can create one.',
      'If you want to unsubscribe from notifications without creating a GOV.UK One Login, you can use the unsubscribe link in the emails we send to you.',
    ],
    redirectUrl: `${HOST}${notificationRoutes.manageNotifications}`,
  },
};

export const getServerSideProps = (ctx: GetServerSidePropsContext) => ({
  props: {
    type: ctx.params.type,
    userServiceHost: USER_SERVICE_HOST,
  },
});

const LoginNotice = ({ type, userServiceHost }) => {
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
              href={`${userServiceHost}/v2/login?redirectUrl=${redirectUrl}`}
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
