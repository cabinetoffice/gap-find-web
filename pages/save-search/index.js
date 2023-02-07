import { parseBody } from 'next/dist/server/api-utils/node';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import ErrorBanner from '../../src/components/displayErrors/errorBanner/ErrorBanner';
import SpecificErrorMessage from '../../src/components/displayErrors/specificMessageError/SpecificErrorMessage';
import Layout from '../../src/components/partials/Layout';
import { fetchFilters } from '../../src/utils/contentFulPage';
import gloss from '../../src/utils/glossary.json';
import {
  addPublishedDateFilter,
  extractFiltersFields,
} from '../../src/utils/transform';

function extractFiltersFromQueryString(query, filters) {
  let filterObjFromQuery = extractFiltersFields(query, filters);
  addPublishedDateFilter(query, filterObjFromQuery);
  return filterObjFromQuery;
}

export function buildQueryString(query) {
  const queryArray = [];
  for (const indexName in query) {
    if (Array.isArray(query[indexName])) {
      query[indexName].forEach((value) =>
        queryArray.push(`${indexName}=${value}`)
      );
    } else {
      queryArray.push(`${indexName}=${query[indexName]}`);
    }
  }
  return queryArray.join('&');
}

const validate = (savedSearchName) => {
  const errors = [];

  if (!savedSearchName) {
    errors.push({
      field: 'search_name',
      error: 'Enter a name for your saved search.',
    });
  } else {
    if (savedSearchName.length > 250) {
      errors.push({
        field: 'search_name',
        error: 'Saved search name must be 250 characters or less.',
      });
    }
  }

  return errors;
};

export async function getServerSideProps({ req, query }) {
  const filters = await fetchFilters();
  const filterObjFromQuery = extractFiltersFromQueryString(query, filters);
  let queryString = buildQueryString(query);
  let savedSearchName = query.search_name ?? null;
  let validationErrors = [];

  if (req.method === 'POST') {
    const body = await parseBody(req, '1mb');
    validationErrors = validate(body.search_name);
    savedSearchName = body.search_name;
    delete query.search_name;
    queryString = buildQueryString(query);

    if (validationErrors.length === 0) {
      return {
        redirect: {
          statusCode: 302,
          destination: `save-search/notifications?${queryString}&search_name=${body.search_name}`,
        },
      };
    }
  }

  return {
    props: {
      filters,
      filterObj: filterObjFromQuery,
      query,
      queryString,
      errors: validationErrors,
      savedSearchName,
    },
  };
}

const SaveSearch = ({
  filters = [],
  filterObj,
  query,
  queryString,
  errors,
  savedSearchName,
}) => {
  const dateObj = filterObj['dateRange']?.values[0];
  return (
    <>
      <Head>
        <title>{errors.length > 0 ? 'Error: ' : ''} Save your search</title>
      </Head>
      <Layout description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link href={{ pathname: '/grants', query: query }}>
            <a className="govuk-back-link" data-testid="govuk-back">
              {gloss.buttons.back}
            </a>
          </Link>
        </div>
        <ErrorBanner errors={errors} />
        <form action={`/save-search?${queryString}`} method="POST">
          <div className="govuk-grid-row govuk-body">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l" data-cy="cySaveSearchHeader">
                Save your search
              </h1>
              <p className="govuk-body" data-cy="cySaveSearchFilters">
                The filters you have chosen include:
              </p>
              <dl className="govuk-summary-list">
                {filters?.length > 0 &&
                  filters?.map((filter, index) => {
                    if (filterObj[filter.index_name]?.values?.length > 0) {
                      return (
                        <div className="govuk-summary-list__row" key={index}>
                          <dt
                            className="govuk-summary-list__key"
                            data-cy={`cyFilterKey${filter.display}`}
                          >
                            {filter.display}
                          </dt>
                          <dd className="govuk-summary-list__value">
                            <ul className="govuk-list govuk-list--bullet">
                              {filterObj[filter.index_name]?.values?.length >
                                0 &&
                                filterObj[filter.index_name].values.map(
                                  (selected, index) => {
                                    return (
                                      <li
                                        key={index}
                                        data-cy={`cyFilterValue${selected.display}`}
                                      >
                                        {selected.display}
                                      </li>
                                    );
                                  }
                                )}
                            </ul>
                          </dd>
                        </div>
                      );
                    }
                  })}
                {dateObj && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Date added</dt>
                    <dd className="govuk-summary-list__value">
                      <p className="govuk-body">
                        <span className="govuk-!-font-weight-bold">From: </span>
                        {dateObj.from.day}/{dateObj.from.month}/
                        {dateObj.from.year}
                      </p>
                      <p className="govuk-body">
                        <span className="govuk-!-font-weight-bold">To: </span>
                        {dateObj.to.day}/{dateObj.to.month}/{dateObj.to.year}
                      </p>
                    </dd>
                  </div>
                )}
              </dl>

              <div
                data-testid="red-banner"
                className={`govuk-form-group ${
                  errors.length > 0 ? 'govuk-form-group--error' : ''
                }`}
              >
                <h1 className="govuk-label-wrapper">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="search_name"
                    data-cy="cyNameThisSearchLabel"
                  >
                    Name this search
                  </label>
                </h1>
                <p className="govuk-body" data-cy="cyNameThisSearchDescription">
                  You can save more than one search. Add a name so it is easier
                  to tell your searches apart.
                </p>

                <SpecificErrorMessage
                  errors={errors}
                  errorType={'search_name'}
                />

                <input
                  className={`govuk-input ${
                    errors.some((error) => error.field === 'search_name')
                      ? 'govuk-input--error'
                      : ''
                  }`}
                  id="search_name"
                  name="search_name"
                  type="text"
                  defaultValue={savedSearchName ? savedSearchName : ''}
                  data-cy="cyNameThisSearchInput"
                />
              </div>
              <button
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cySaveAndContinueButton"
              >
                Save and continue
              </button>
            </div>
          </div>
        </form>
      </Layout>
    </>
  );
};

export default SaveSearch;
