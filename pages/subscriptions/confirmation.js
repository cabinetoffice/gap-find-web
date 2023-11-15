import Head from 'next/head';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import RelatedContent from '../../src/components/related-content';
import SignupConfirmation from '../../src/components/sign-up/SignupConfirmation.tsx';
import {
  generateSignupErrorsRedirectParam,
  validateSignupForm,
} from '../../src/manager/signup_manager';
import { generateSignedApiKey } from '../../src/service/api-key-service';
import { sendEmail } from '../../src/service/gov_notify_service';
import { notificationRoutes } from '../../src/utils/constants';
import { encrypt } from '../../src/utils/encryption';
import gloss from '../../src/utils/glossary.json';
import { getPreviousFormValues } from '../../src/utils/request';
import { addErrorInfo, logger } from '../../src/utils';
import { parseBody } from 'next/dist/server/api-utils/node';

const generateConfirmationUrl = (apiKey) => {
  return new URL(
    `${notificationRoutes['addSubscription']}${apiKey}`,
    process.env.HOST,
  ).toString();
};

export async function getServerSideProps({ req }) {
  const body = await parseBody(req, '1mb');

  const validationErrors = validateSignupForm(body);
  if (validationErrors.length > 0) {
    const errorParam = generateSignupErrorsRedirectParam(validationErrors);
    const previousFormValues = getPreviousFormValues(body);
    const redirectPath = `/subscriptions/signup?grantId=${body.grantLabel}${errorParam}&${previousFormValues}`;
    return {
      redirect: {
        permanemt: false,
        destination: redirectPath,
      },
    };
  }

  const grantLabel = body.grantLabel;
  const email = body.user_email;
  const grantId = body.grantId;
  const grantTitle = body.grantTitle;

  const apiKey = generateSignedApiKey({
    encrypted_email_address: await encrypt(email),
    contentful_grant_subscription_id: grantId,
  });
  const confirmationUrl = generateConfirmationUrl(apiKey);

  try {
    await sendEmail(
      email,
      {
        'name of grant': grantTitle,
        'Confirmation link for updates': confirmationUrl,
      },
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_TEMPLATE,
    );
  } catch (e) {
    logger.error(
      'error sending subscription confirmation email',
      addErrorInfo(e, req),
    );
  }

  return {
    props: {
      email,
      grantLabel,
      grantTitle,
    },
  };
}

const GrantSignupConfirmation = (props) => {
  const email = props.email;
  const label = props.grantLabel;
  const grantName = props.grantTitle;
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout description="Grants Application Programme">
        <div className="govuk-width-container">
          <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 govuk-!-padding-bottom-4">
            <a href={`../grants/${label}`} className="govuk-back-link">
              Back
            </a>
          </div>
        </div>

        <SignupConfirmation
          signedUpEmail={email}
          subscribedTo={grantName}
          displayBold={true}
          returnParams={{
            href: `/grants/${label}`,
            linkText: 'Back to grant details',
          }}
        >
          <RelatedContent
            title="Related link"
            links={[{ title: 'Browse all grants', href: '/grants' }]}
          />
        </SignupConfirmation>
      </Layout>
    </>
  );
};

export default GrantSignupConfirmation;
