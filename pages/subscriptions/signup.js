import Head from 'next/head';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import SignupForm from '../../src/components/sign-up/SignupForm';
import gloss from '../../src/utils/glossary.json';
import { URL_ACTIONS, notificationRoutes } from '../../src/utils/constants';
import { fetchGrantDetail } from '../../src/utils/grantDetails';
import { getVerifiedJwtFromCookies } from '../../src/service/user-service';
import { SubscriptionService } from '../../src/service/subscription-service';

export async function getServerSideProps(ctx) {
  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const verifiedJwt = await getVerifiedJwtFromCookies(ctx.req);
    if (!verifiedJwt) {
      return {
        redirect: {
          permanent: false,
          destination: process.env.APPLICANT_HOST,
        },
      };
    }

    // The user's details come only from the verified token
    await SubscriptionService.getInstance().addSubscription({
      emailAddress: verifiedJwt.jwtPayload.email,
      sub: verifiedJwt.jwtPayload.sub,
      grantId: ctx.query.grantId,
    });

    return {
      redirect: {
        permanent: false,
        destination: `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.SUBSCRIBE}&grantId=${ctx.query.grantId}`,
      },
    };
  }
  const response = await fetchGrantDetail(ctx.query);

  if ('redirect' in response) {
    return response;
  }

  return { props: { grantDetail: response } };
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
