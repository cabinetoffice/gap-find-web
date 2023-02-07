import React from 'react';
import Link from 'next/link';
import Layout from '../src/components/partials/Layout';
import Head from 'next/head';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>Page not found - GOV.UK</title>
      </Head>
      <Layout description="Page not found - GOV.UK">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full govuk-!-margin-top-7">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
            >
              Page not found
            </h1>
            <p className="govuk-body">
              If you typed the web address, check it is correct.
            </p>
            <p className="govuk-body">
              If you pasted the web address, check you copied the entire
              address.
            </p>
            <p className="govuk-body">
              To see a list of available grants, visit the{' '}
              <Link href="/grants/">
                <a className="govuk-link">Browse grants</a>
              </Link>{' '}
              page.
            </p>
            {/* <p className="govuk-body">If the web address is correct or you selected a link or button, <a href="#" class="govuk-link">contact the Tax Credits Helpline</a> if you need to speak to someone about your tax credits.</p> */}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Custom404;
