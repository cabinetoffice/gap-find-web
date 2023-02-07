import Head from 'next/head';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import ErrorBanner from '../../src/components/displayErrors/errorBanner/ErrorBanner';
import SpecificErrorMessage from '../../src/components/displayErrors/specificMessageError/SpecificErrorMessage';
import { GetServerSideProps } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import { buildQueryString } from '.';
import gloss from '../../src/utils/glossary.json';
import Link from 'next/link';

const validate = (saveSearchConsent) => {
  const errors = [];

  if (!saveSearchConsent) {
    errors.push({
      field: 'consent-radio',
      error: "Select 'Yes' or 'No'",
    });
  }
  return errors;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  let validationErrors = [];

  if (req.method === 'POST') {
    const body = await parseBody(req, '1mb');
    validationErrors = validate(body.consent_radio);
    delete query.notifications_consent;
    const queryString = buildQueryString(query);
    if (validationErrors.length === 0) {
      return {
        redirect: {
          statusCode: 302,
          destination: `email?${queryString}&notifications_consent=${body.consent_radio}`,
        },
      };
    }
  }

  return {
    props: {
      validationErrors,
      query,
    },
  };
};

const SignupSavedSearch = ({ validationErrors, query }) => {
  const description =
    "Select 'Yes' if you want to be updated when grants that match your saved search are added.";
  return (
    <>
      <Head>
        <title>
          {validationErrors.length > 0
            ? `Error: Sign Up For Save Search - Find a grant`
            : 'Sign Up For Save Search - Find a grant'}
        </title>
      </Head>
      <Layout>
        <div className="govuk-width-container">
          <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
            <Link href={{ pathname: '/save-search', query: query }}>
              <a className="govuk-back-link" data-testid="govuk-back">
                {gloss.buttons.back}
              </a>
            </Link>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorBanner errors={validationErrors} />

            <form
              action=""
              method="POST"
              noValidate
              data-testid="saved-search-signup-form"
            >
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1
                      className="govuk-fieldset__heading govuk-heading-l"
                      id="main-content-focus"
                      tabIndex={-1}
                      data-cy="cy-save-search-consent-header"
                    >
                      Sign up for email updates
                    </h1>
                  </legend>

                  <p
                    className="govuk-body"
                    data-cy="cy-save-search-notifications-description"
                  >
                    {description}
                  </p>
                  <div
                    data-testid="red-banner"
                    className={`govuk-form-group ${
                      validationErrors.length > 0
                        ? 'govuk-form-group--error'
                        : ''
                    }`}
                    data-cy="cy-error-wrapper"
                  >
                    <SpecificErrorMessage
                      errors={validationErrors}
                      errorType={'consent-radio'}
                    />

                    <div className="govuk-radios" data-module="govuk-radios">
                      <div className="govuk-radios__item" id="consent-radio">
                        <input
                          className="govuk-radios__input"
                          id="consent-radio-yes"
                          name="consent_radio"
                          type="radio"
                          value="true"
                          data-cy="cy-radio-yes"
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor="consent-radio-yes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="consent-radio-no"
                          name="consent_radio"
                          type="radio"
                          value="false"
                          data-cy="cy-radio-no"
                        />
                        <label
                          className="govuk-label govuk-radios__label"
                          htmlFor="consent-radio-no"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
              <button
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cySubmitNotificationsChoice"
                type="submit"
                aria-label="Submit notifications choice"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SignupSavedSearch;
