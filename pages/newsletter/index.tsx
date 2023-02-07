import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../src/components/partials/Layout';
import gloss from '../../src/utils/glossary.json';

export async function getServerSideProps({ query }) {
  return { props: { returnParams: query } };
}

type NewsletterLandingPageProps = {
  returnParams: any;
};

const NewsletterLandingPage = ({
  returnParams,
}: NewsletterLandingPageProps) => {
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
            <ul className="govuk-list govuk-!-margin-top-5">
              <li>
                <Link href="/newsletter/signup">
                  <a
                    className="govuk-button"
                    data-module="govuk-button"
                    data-cy="cyContinueToNewsletterSignup"
                  >
                    Sign up for updates
                  </a>
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: returnParams.href, query: returnParams }}
                >
                  <a className="govuk-link" data-cy="cyCancelNewsletterSignup">
                    Cancel
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NewsletterLandingPage;
