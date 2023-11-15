import Head from 'next/head';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import SignupForm from '../../src/components/sign-up/SignupForm';
import gloss from '../../src/utils/glossary.json';
import { getJwtFromCookies } from '../../src/utils/jwt';
import { URL_ACTIONS, notificationRoutes } from '../../src/utils/constants';
import { fetchGrantDetail } from '../../src/utils/grantDetails';
import { client as axios } from '../../src/utils/axios';

export async function getServerSideProps(ctx) {
  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const { jwtPayload } = getJwtFromCookies(ctx.req);

    const response = await axios.post(
      new URL(`${process.env.HOST}/api/subscription`).toString(),
      {
        contentfulGrantSubscriptionId: ctx.query.grantId,
        emailAddress: jwtPayload.email,
        sub: jwtPayload.sub,
      },
    );

    if (response.errors) {
      return {
        redirect: {
          permanent: false,
          destination: '/static/page-not-found',
        },
      };
    }

    return {
      redirect: {
        permanent: false,
        destination: `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.SUBSCRIBE}&grantId=${ctx.query.grantId}`,
      },
    };
  }

  return await fetchGrantDetail(ctx.query);
}

const Signup = ({ grantDetail }) => {
  const grantLabel = grantDetail.fields.label;
  const grantName = grantDetail.fields.grantName;
  const errors = grantDetail.errors;
  const previousFormValues = grantDetail.previousFormValues;

  const formData = {
    fields: [
      <input
        type="hidden"
        name="grantId"
        id="grant-id"
        value={grantDetail.sys.id}
        key={0}
      />,
      <input
        type="hidden"
        name="grantTitle"
        id="grant-title"
        value={grantName}
        key={1}
      />,
      <input
        id="grantLabel"
        name="grantLabel"
        defaultValue={grantLabel}
        type="hidden"
        key={2}
      />,
    ],
    action: '/subscriptions/confirmation',
    resultingAction: `Enter your email address to get updates about ${grantName}.`,
  };

  const titleContent =
    errors.length > 0 ? `Error: ${gloss.title}` : gloss.title;

  return (
    <>
      <Head>
        <title>{titleContent}</title>
      </Head>
      <Layout description="Grants Application Programme">
        <div className="govuk-width-container">
          <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 govuk-!-padding-bottom-4">
            <a href={`../grants/${grantLabel}`} className="govuk-back-link">
              Back
            </a>
          </div>
        </div>

        <SignupForm
          formData={formData}
          errors={errors}
          previousFormValues={previousFormValues}
        />
      </Layout>
    </>
  );
};

export default Signup;
