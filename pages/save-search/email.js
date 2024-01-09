import { parseBody } from 'next/dist/server/api-utils/node';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { buildQueryString } from '.';
import ErrorBanner from '../../src/components/displayErrors/errorBanner/ErrorBanner';
import SpecificErrorMessage from '../../src/components/displayErrors/specificMessageError/SpecificErrorMessage';
import Layout from '../../src/components/partials/Layout';
import PrivacyNotice from '../../src/components/sign-up/PrivacyNotice';
import { generateSignedApiKey } from '../../src/service/api-key-service';
import { sendEmail } from '../../src/service/gov_notify_service';
import {
  save,
  SavedSearchStatusType,
} from '../../src/service/saved_search_service';
import {
  EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
  EMAIL_ADDRESS_REGEX,
} from '../../src/utils/constants';
import gloss from '../../src/utils/glossary.json';
import {
  buildSavedSearchFilters,
  getDateFromFilters,
  extractFiltersFields,
  addPublishedDateFilter,
} from '../../src/utils/transform';
import { addErrorInfo, logger } from '../../src/utils';
import { fetchFilters } from '../../src/utils/contentFulPage';

//TODO confirm if we need to show only one error at a time or not
const validate = (requestBody) => {
  const errors = [];

  if (!requestBody.notification_privacy) {
    errors.push({
      field: 'notification_privacy',
      error:
        'You must confirm that you have read and understood the privacy notice.',
    });
  }

  if (!requestBody.user_email) {
    errors.push({
      field: 'user_email',
      error: 'Enter your email address.',
    });
  } else if (!EMAIL_ADDRESS_REGEX.test(requestBody.user_email)) {
    errors.push({
      field: 'user_email',
      error: EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
    });
  }

  return errors;
};

const returnPostErrors = (errors, query, body, queryString) => {
  return {
    props: {
      query,
      errors: errors,
      privacy: body.notification_privacy ?? null,
      user_email: body.user_email ?? null,
      queryString,
    },
  };
};

const redirect = (uri) => {
  return {
    redirect: {
      statusCode: 302,
      destination: uri,
    },
  };
};

const generateConfirmationUrl = (apiKey) => {
  return new URL(
    `api/save-search/confirm/${apiKey}`,
    process.env.HOST,
  ).toString();
};

const sendConfirmationEmail = async (savedSearch, email) => {
  const encryptedSearchId = generateSignedApiKey({ id: savedSearch.id });
  const confirmationUrl = generateConfirmationUrl(encryptedSearchId);

  await sendEmail(
    email,
    {
      'Confirmation link for saved search': confirmationUrl,
      'name of saved search': savedSearch.name,
    },
    process.env.GOV_NOTIFY_SAVED_SEARCH_CONFIRMATION_TEMPLATE,
  );
};

const getFilterObjectFromQuery = (query, filters) => {
  const filterObjFromQuery = extractFiltersFields(query, filters);
  addPublishedDateFilter(query, filterObjFromQuery);
  return filterObjFromQuery;
};

const buildSavedSearch = async (query, body) => {
  const filterObjFromQuery = getFilterObjectFromQuery(
    query,
    await fetchFilters(),
  );

  return {
    name: query.search_name,
    search_term: query.searchTerm,
    filters: buildSavedSearchFilters(filterObjFromQuery),
    fromDate: getDateFromFilters(filterObjFromQuery, 'gte'),
    toDate: getDateFromFilters(filterObjFromQuery, 'lte'),
    status: SavedSearchStatusType.DRAFT,
    notifications: query.notifications_consent === 'true',
    email: body.user_email,
  };
};

export async function getServerSideProps({ query, req }) {
  const queryString = buildQueryString(query);

  if (req.method === 'POST') {
    const body = await parseBody(req, '1mb');
    const validationErrors = validate(body);

    if (validationErrors.length > 0) {
      return returnPostErrors(validationErrors, query, body, queryString);
    }

    const searchToSave = await buildSavedSearch(query, body);
    const savedSearch = await save(searchToSave);

    try {
      await sendConfirmationEmail(savedSearch, body.user_email);
    } catch (e) {
      logger.error(
        'error sending saved search confirmation email',
        addErrorInfo(e, req),
      );
    }

    return redirect(`check-email?email=${body.user_email}`);
  }

  return {
    props: {
      query,
      errors: [],
      queryString,
    },
  };
}

const Email = ({ query, errors, privacy, user_email, queryString }) => {
  return (
    <>
      <Head>
        <title>{errors.length > 0 ? 'Error: ' : ''} Save your search</title>
      </Head>
      <Layout description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link href={{ pathname: '/save-search/notifications', query: query }}>
            <a
              className="govuk-back-link"
              data-testid="govuk-back"
              data-cy="cy-back-link"
            >
              {gloss.buttons.back}
            </a>
          </Link>
        </div>
        <ErrorBanner errors={errors} />
        <form
          id="saved-search-email-form"
          action={`/save-search/email?${queryString}`}
          method="POST"
        >
          <div
            id="red-banner"
            data-testid="red-banner"
            className={`govuk-form-group ${
              errors.length > 0 ? 'govuk-form-group--error' : ''
            }`}
          >
            <h1
              className="govuk-heading-l govuk-!-margin-top-4 govuk-!-margin-bottom-2"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cyEmailAddressHeader"
            >
              Enter your email address
            </h1>
            <label
              className="govuk-label govuk-!-margin-bottom-4"
              data-cy="cyEmailAddressLabel"
            >
              To save your search, enter your email address below.
            </label>

            <PrivacyNotice errors={errors} checked={privacy ? true : false} />
            <SpecificErrorMessage errors={errors} errorType={'user_email'} />

            <input
              className={`govuk-input govuk-!-width-one-third ${
                errors.some((error) => error.field === 'user_email')
                  ? 'govuk-input--error'
                  : ''
              }`}
              id="user_email"
              data-testid="user_email"
              name="user_email"
              aria-label="Enter your email address"
              spellCheck="false"
              autoComplete="email"
              defaultValue={user_email ? user_email : ''}
              data-cy="cyEmailAddressInput"
            />
          </div>
          <button
            className="govuk-button"
            data-module="govuk-button"
            type="submit"
            data-cy="cySaveAndContinueButton"
          >
            Save and continue
          </button>
        </form>
      </Layout>
    </>
  );
};

export default Email;
