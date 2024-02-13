import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Head from 'next/head';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import RelatedContent from '../../src/components/related-content';
import SignupConfirmation from '../../src/components/sign-up/SignupConfirmation';
import {
  generateSignupErrorsRedirectParam,
  validateSignupForm,
} from '../../src/manager/signup_manager';
import { generateSignedApiKey } from '../../src/service/api-key-service';
import { sendEmail } from '../../src/service/gov_notify_service';
import {
  NewsletterSubscription,
  NewsletterType,
} from '../../src/types/newsletter';
import gloss from '../../src/utils/glossary.json';
import { getPreviousFormValues } from '../../src/utils/request';
import { logger } from '../../src/utils';
import { parseBody } from 'next/dist/server/api-utils/node';

const generateConfirmationUrl = (apiKey: string) => {
  return new URL(
    `api/newsletter-signup/${apiKey}`,
    process.env.HOST,
  ).toString();
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const req = context.req;

  const body = await parseBody(req, '1mb');
  const validationErrors = validateSignupForm(body);
  if (validationErrors.length > 0) {
    const errorParam = generateSignupErrorsRedirectParam(validationErrors);
    const previousFormValues = getPreviousFormValues(body);
    const redirectPath = `/newsletter/signup?${errorParam}&${previousFormValues}`;
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: redirectPath,
      },
    };
  }

  const signedUpEmail: string = body.user_email;

  const newsletterSubscription: NewsletterSubscription = {
    email: signedUpEmail,
    newsletterType: NewsletterType.NEW_GRANTS,
  };

  const apiKey = generateSignedApiKey(newsletterSubscription);
  const confirmationUrl = generateConfirmationUrl(apiKey);

  try {
    await sendEmail(
      signedUpEmail,
      {
        'Confirmation link for updates': confirmationUrl,
      },
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_NEWSLETTER_TEMPLATE,
    );
  } catch (e) {
    logger.error(
      'error sending newsletter signup confirmation email',
      logger.utils.addErrorInfo(e, req as NextApiRequest),
    );
  }
  return {
    props: {
      signedUpEmail,
    },
  };
};

type NewsletterConfirmationProps = {
  signedUpEmail: string;
};

const NewsletterConfirmation = ({
  signedUpEmail,
}: NewsletterConfirmationProps) => {
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>
      <Layout>
        <SignupConfirmation
          signedUpEmail={signedUpEmail}
          subscribedTo="new grants"
          displayBold={false}
          returnParams={{ href: '/', linkText: 'Back to home' }}
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

export default NewsletterConfirmation;
