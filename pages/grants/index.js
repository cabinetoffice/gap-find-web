import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ErrorBanner from '../../src/components/displayErrors/errorBanner/ErrorBanner';
import { NewsletterCallToAction } from '../../src/components/newsletter/NewsletterCallToAction';
import { Pagination } from '../../src/components/pagination/Pagination';
import Layout from '../../src/components/partials/Layout';
import { SearchFilterContainer } from '../../src/components/search-page/search-filter-container/SearchFilterContainer';
import { SearchForm } from '../../src/components/search-page/search-form/SearchForm';
import { SearchResultCard } from '../../src/components/search-page/search-result-card/SearchResultCard';
import { SearchResultCounter } from '../../src/components/search-page/search-results-counter/SearchResultCounter';
import { SearchSortBy } from '../../src/components/search-page/search-sortby/SearchSortBy';
import { ElasticSearchService } from '../../src/service/elastic_service';
import { GRANTS_PER_PAGE } from '../../src/utils/constants';
import { fetchFilters } from '../../src/utils/contentFulPage';
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

export async function getServerSideProps({ query }) {
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
    },
  };
}

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
  isUserLoggedIn,
}) => {
  const router = useRouter();

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
      <Layout isUserLoggedIn={isUserLoggedIn} description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link href={{ pathname: '../', query: { searchTerm } }}>
            <a className="govuk-back-link" data-cy="cyBrowseBackText">
              {gloss.buttons.back}
            </a>
          </Link>
        </div>
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
                      <SearchResultCard item={item} />
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
      </Layout>
    </>
  );
};

export default BrowseByCategory;
