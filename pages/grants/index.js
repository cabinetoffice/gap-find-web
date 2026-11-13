import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import ErrorBanner from '../../src/components/displayErrors/errorBanner/ErrorBanner';
import { NewsletterCallToAction } from '../../src/components/newsletter/NewsletterCallToAction';
import { ImportantBanner } from '../../src/components/notification-banner';
import { useAppContext, useAuth } from '../_app';
import { Pagination } from '../../src/components/pagination/Pagination';
import Layout from '../../src/components/partials/Layout';
import { SearchFilterContainer } from '../../src/components/search-page/search-filter-container/SearchFilterContainer';
import { SearchForm } from '../../src/components/search-page/search-form/SearchForm';
import { SearchResultCard } from '../../src/components/search-page/search-result-card/SearchResultCard';
import { FavouriteForm } from '../../src/components/search-page/favourite-mark/FavouriteMark';
import { SearchResultCounter } from '../../src/components/search-page/search-results-counter/SearchResultCounter';
import { SearchSortBy } from '../../src/components/search-page/search-sortby/SearchSortBy';
import { ElasticSearchService } from '../../src/service/elastic_service';
import { getFavouriteGrantIdsForRequest } from '../../src/service/favourite-service';
import {
  CSRF_HEADER_NAME,
  FAVOURITE_QUERY_PARAMS,
  GRANTS_PER_PAGE,
} from '../../src/utils/constants';
import { fetchFilters } from '../../src/utils/contentFulPage';
import { isFavouritesEnabled } from '../../src/utils/featureFlags';
import gloss from '../../src/utils/glossary.json';
import {
  addPublishedDateFilter,
  buildDslQuery,
  clearFiltersFromQuery,
  extractFiltersFields,
  generateSearchHeadingFromDateRange,
} from '../../src/utils/transform';

const conditionallyClearFiltersFromQuery = (
  clearFilters,
  clearDateFilters,
  query,
) => {
  if (clearFilters) return clearFiltersFromQuery(query);
  else if (clearDateFilters)
    return clearFiltersFromQuery(query, ['from', 'to']);
  return query;
};

const buildTitleContent = (filterObjFromQuery, searchTerm, total) => `${
  filterObjFromQuery.errors.length > 0 ? 'Error: ' : ''
} Searching for 
  ${searchTerm || 'all grants'}, 
  ${total} 
  ${
    filterObjFromQuery && Object.keys(filterObjFromQuery).length >= 2
      ? 'filtered '
      : ''
  } 
  ${total !== 1 ? 'results ' : 'result '} 
- Find a grant`;

const validateSearchTerm = (searchTerm = '') => searchTerm.trim().length < 100;

const findGrantNameById = (grants, grantId) =>
  (typeof grantId === 'string' &&
    grants.find((grant) => grant.id === grantId)?.grantName) ||
  null;

// Set on the response by the CSRF middleware
const getCsrfToken = (res) => {
  const token = res?.getHeader?.(CSRF_HEADER_NAME);
  return typeof token === 'string' && token ? token : null;
};

export async function getServerSideProps({ query, req, res }) {
  const filteredQuery = conditionallyClearFiltersFromQuery(
    Boolean(query.clearFilters),
    Boolean(query.clearDateFilters),
    query,
  );
  const searchTermValid = validateSearchTerm(filteredQuery.searchTerm);
  const searchTerm =
    searchTermValid && filteredQuery.searchTerm ? filteredQuery.searchTerm : '';
  const sortBy = filteredQuery.sortBy || 'default';
  const filters = await fetchFilters();

  const filterObjFromQuery = extractFiltersFields(filteredQuery, filters);
  addPublishedDateFilter(filteredQuery, filterObjFromQuery);
  const filterArray = buildDslQuery(filterObjFromQuery);
  const searchHeading = filterObjFromQuery.dateRange
    ? generateSearchHeadingFromDateRange(filterObjFromQuery.dateRange.values[0])
    : 'Search grants';

  const limit = filteredQuery.limit || GRANTS_PER_PAGE;
  const currentPage = filteredQuery.page || '1';

  const elasticSearchServiceInstance = ElasticSearchService.getInstance();

  const searchResult = await elasticSearchServiceInstance.search(
    searchTerm,
    filterArray,
    limit,
    currentPage,
    sortBy,
  );

  const total = searchResult.totalGrants;

  const favouritesEnabled = isFavouritesEnabled();
  const favouriteGrantIds = favouritesEnabled
    ? await getFavouriteGrantIdsForRequest(req)
    : [];
  const favouriteAddedGrantName = favouritesEnabled
    ? findGrantNameById(
        searchResult.parsedElasticResults,
        query[FAVOURITE_QUERY_PARAMS.ADDED],
      )
    : null;
  const favouriteErrorGrantName = favouritesEnabled
    ? findGrantNameById(
        searchResult.parsedElasticResults,
        query[FAVOURITE_QUERY_PARAMS.ERROR],
      )
    : null;

  const titleContent = buildTitleContent(
    filterObjFromQuery,
    searchTerm,
    searchResult.totalGrants,
  );

  const errors = [...(filterObjFromQuery.errors || [])];

  if (!searchTermValid)
    errors.push({
      error: 'Search term must be 100 characters or less',
      field: 'searchAgainTermInput',
    });

  return {
    props: {
      searchResult: searchResult.parsedElasticResults,
      sortBy,
      filters,
      searchTerm,
      searchHeading,
      errors,
      filterObj: filterObjFromQuery,
      totalGrants: total,
      query: { ...query, href: '/grants' },
      currentPage,
      titleContent,
      favouriteGrantIds,
      favouriteAddedGrantName,
      favouriteErrorGrantName,
      favouritesEnabled,
      csrfToken: favouritesEnabled ? getCsrfToken(res) : null,
    },
  };
}

const FavouriteBanner = ({ addedGrantName, errorGrantName }) => {
  if (errorGrantName)
    return (
      <ImportantBanner
        heading={`Sorry, we could not add ${errorGrantName} to your favourites. Please try again later.`}
      />
    );
  if (addedGrantName)
    return (
      <ImportantBanner
        isSuccess
        heading={`${addedGrantName} has been added to your favourites.`}
      />
    );
  return null;
};

const BrowseByCategory = ({
  searchResult: fields,
  sortBy,
  filters = [],
  searchTerm,
  searchHeading,
  errors,
  filterObj,
  totalGrants,
  query,
  currentPage,
  titleContent,
  favouriteGrantIds = [],
  favouriteAddedGrantName = null,
  favouriteErrorGrantName = null,
  favouritesEnabled = false,
  csrfToken = null,
}) => {
  const router = useRouter();
  const { isUserLoggedIn } = useAuth();
  const { oneLoginEnabled } = useAppContext();
  const canFavourite =
    favouritesEnabled &&
    oneLoginEnabled === 'true' &&
    Boolean(isUserLoggedIn) &&
    Boolean(csrfToken);

  // Remove the favourite result from the address once the banner has shown,
  // so refreshing or re-sorting does not show it again
  useEffect(() => {
    const favouriteParams = Object.values(FAVOURITE_QUERY_PARAMS);
    if (!router?.query || !favouriteParams.some((p) => p in router.query))
      return;

    const remainingQuery = Object.fromEntries(
      Object.entries(router.query).filter(
        ([key]) => !favouriteParams.includes(key),
      ),
    );
    router.replace(
      { pathname: router.pathname, query: remainingQuery },
      undefined,
      {
        shallow: true,
        scroll: false,
      },
    );
  }, [router]);

  const handleSortByChange = (sort) => {
    const newQuery = {
      query: {
        ...router?.query,
        sortBy: sort,
      },
    };

    if (router.query) newQuery.query.searchTerm = router.query.searchTerm;
    router.push(newQuery);
  };

  return (
    <>
      <Head>
        <title>{titleContent}</title>
      </Head>
      <Layout description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link
            href={{ pathname: '../', query: { searchTerm } }}
            className="govuk-back-link"
            data-cy="cyBrowseBackText"
          >
            {gloss.buttons.back}
          </Link>
        </div>
        <FavouriteBanner
          addedGrantName={favouriteAddedGrantName}
          errorGrantName={favouriteErrorGrantName}
        />
        <ErrorBanner errors={errors} />
        <form action="/grants" method="GET">
          <div className="govuk-grid-row govuk-body govuk-!-margin-bottom-0">
            <SearchResultCounter
              countGrants={totalGrants}
              currentPage={currentPage}
            />

            <SearchForm searchTerm={searchTerm} searchHeading={searchHeading} />
          </div>
          <div className="govuk-grid-row govuk-body">
            <SearchFilterContainer
              filters={filters}
              filterObj={filterObj}
              query={query}
            />
            <div className="govuk-grid-column-two-thirds gap_results-tools">
              {totalGrants > 0 && (
                <div className="gap_results-tools__tools">
                  <SearchSortBy
                    sortBy={sortBy}
                    handleSortByChange={handleSortByChange}
                  />
                </div>
              )}

              {totalGrants === 0 && (
                <div>
                  <h2
                    className="govuk-heading-m govuk-!-margin-bottom-7"
                    data-cy="cyNoGrantFoundMessage"
                  >
                    <strong>No grants found</strong>
                  </h2>
                </div>
              )}
            </div>

            <div className="govuk-grid-column-two-thirds govuk-!-margin-top-5">
              <ul className="grants_list">
                {fields.map((item, i) => (
                  <React.Fragment key={i}>
                    {item.grantName && item.label && (
                      <SearchResultCard
                        item={item}
                        canFavourite={canFavourite}
                        isFavourite={favouriteGrantIds.includes(item.id)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </ul>
              <Pagination
                totalItems={totalGrants}
                itemsPerPage={GRANTS_PER_PAGE}
                itemType="grants"
              />
            </div>
          </div>
          <div className="govuk-!-margin-top-9">
            <NewsletterCallToAction returnParams={query} />
          </div>
        </form>
        {canFavourite && <FavouriteForm csrfToken={csrfToken} />}
      </Layout>
    </>
  );
};

export default BrowseByCategory;
