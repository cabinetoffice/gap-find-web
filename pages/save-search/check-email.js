import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import gloss from '../../src/utils/glossary.json';

export async function getServerSideProps({ query }) {
  return {
    props: {
      email: query.email,
      query,
    },
  };
}

const CheckEmail = (props) => {
  return (
    <>
      <Head>
        <title>Save your search - Find a grant</title>
      </Head>
      <Layout description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link href={{ pathname: '/grants' }}>
            <a className="govuk-back-link">{gloss.buttons.back}</a>
          </Link>
        </div>
        <form action="/grants" method="GET">
          <h1
            className="govuk-heading-l"
            data-cy="cyCheckEmailHeading"
            id="main-content-focus"
            tabIndex={-1}
          >
            Check your email
          </h1>
          <p className="govuk-body">
            We’ve sent an email to{' '}
            <span
              className="govuk-!-font-weight-bold"
              data-testid="save-search-email"
              data-cy="cyCheckEmailValue"
            >
              {props.email}
            </span>
            .
          </p>

          <p className="govuk-body govuk-!-font-weight-regular">
            Click the link in the email to confirm your email address.
          </p>

          <p className="govuk-body govuk-!-font-weight-regular">
            The link will stop working after 7 days.
          </p>

          <details className="govuk-details" data-module="govuk-details">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Not received an email?
              </span>
            </summary>
            <div className="govuk-details__text">
              <p>Emails sometimes take a few minutes to arrive.</p>
              <p>
                If you do not receive an email soon, check your spam or junk
                folder.
              </p>
              <p>If you do not get an email, contact</p>
              <a
                href="mailto:findagrant@cabinetoffice.gov.uk"
                className="govuk-link"
              >
                findagrant@cabinetoffice.gov.uk
              </a>
            </div>
          </details>
        </form>
      </Layout>
    </>
  );
};

export default CheckEmail;
