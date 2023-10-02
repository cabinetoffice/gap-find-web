import { GetServerSideProps } from 'next';
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
import { getBody, getPreviousFormValues } from '../../src/utils/request';
import { addErrorInfo, logger } from '../../src/utils';

const generateConfirmationUrl = (apiKey: string) => {
  return new URL(
    `api/newsletter-signup/${apiKey}`,
    process.env.HOST,
  ).toString();
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const req: any = context.req;
  const res: any = context.res;

  await getBody(req, res);

  const validationErrors = validateSignupForm(req.body);
  if (validationErrors.length > 0) {
    const errorParam = generateSignupErrorsRedirectParam(validationErrors);
    const previousFormValues = getPreviousFormValues(req.body);
    const redirectPath = `/newsletter/signup?${errorParam}&${previousFormValues}`;
    return {
      props: {},
      redirect: {
        permanemt: false,
        destination: redirectPath,
      },
    };
  }

  const signedUpEmail: string = req.body.user_email;

  const newsletterSubscription: NewsletterSubscription = {
    email: signedUpEmail,
    newsletterType: NewsletterType.NEW_GRANTS,
  };

  const apiKey = generateSignedApiKey(newsletterSubscription);
  const confirmationUrl = generateConfirmationUrl(apiKey);

  try {
    console.log('hello');
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
      addErrorInfo(e, req),
    );
    console.log('world');
  }
  console.log('returning...');
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
