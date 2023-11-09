import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { InferGetServerSidePropsType } from 'next';
import Layout from '../../src/components/partials/Layout';
import gloss from '../../src/utils/glossary.json';
import {
  LOGIN_NOTICE_TYPES,
  newsletterRoutes,
  notificationRoutes,
  URL_ACTIONS,
} from '../../src/utils';

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;
export async function getServerSideProps({ query }) {
  return {
    props: {
      returnParams: query,
      oneLoginEnabled: process.env.ONE_LOGIN_ENABLED === 'true',
      userServiceHost: USER_SERVICE_HOST,
      host: HOST,
    },
  };
}

const NewsletterLandingPage = ({
  returnParams,
  oneLoginEnabled,
  userServiceHost,
  host,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>{gloss.title}</title>
      </Head>

      <Layout>
        <div className="govuk-!-margin-top-3">
          <div className="govuk-grid-column-two-third">
            <h1
              className="govuk-heading-l govuk-!-margin-top-4 govuk-!-margin-bottom-4"
              id="main-content-focus"
              tabIndex={-1}
            >
              Get updates about new grants
            </h1>
          </div>
        </div>

        <div className="govuk-grid-row govuk-body">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              We will only ever email you once a week. We will not email you if
              no new grants have been added.
            </p>
            {oneLoginEnabled ? (
              <p className="govuk-body">
                To sign up you need a GOV.UK One Login. If you do not have a
                GOV.UK One Login you can create one.
              </p>
            ) : null}
            <div className="govuk-button-group">
              <a
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cyContinueToNewsletterSignup"
                href={
                  oneLoginEnabled
                    ? `${userServiceHost}/v2/login?redirectUrl=` +
                      encodeURIComponent(
                        `${host}${notificationRoutes.manageNotifications}?action=${URL_ACTIONS.NEWSLETTER_SUBSCRIBE}&migrationType=${LOGIN_NOTICE_TYPES.NEWSLETTER}`,
                      )
                    : newsletterRoutes.signup
                }
              >
                Sign up for updates
              </a>
              <Link href={{ pathname: returnParams.href, query: returnParams }}>
                <a className="govuk-link" data-cy="cyCancelNewsletterSignup">
                  Cancel
                </a>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NewsletterLandingPage;
