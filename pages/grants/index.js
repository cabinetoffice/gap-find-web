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
  generateSearchHeadingFromDateRange
} from '../../src/utils/transform';

export async function getServerSideProps({ query }) {
  let searchTerm = '';
  let searchResult;
  let searchHeading = 'Search grants';
  const sortBy = query?.sortBy ? query.sortBy : 'default';
  const clearFilters = !!query?.clearFilters;
  const clearDateFilters = !!query?.clearDateFilters;
  const filters = await fetchFilters();

  let filterArray = [];
  let filterObjFromQuery = {};

  if (clearFilters) {
    query = clearFiltersFromQuery(query);
  } else if (clearDateFilters) {
    query = clearFiltersFromQuery(query, ['from', 'to']);
  }

  filterObjFromQuery = extractFiltersFields(query, filters);
  addPublishedDateFilter(query, filterObjFromQuery);
  filterArray = buildDslQuery(filterObjFromQuery);

  searchTerm = query.searchTerm ? query.searchTerm : searchTerm;
  if (query.searchTerm || filterArray?.length > 0) {
    searchTerm = query.searchTerm ? query.searchTerm : searchTerm;
    searchHeading = filterObjFromQuery.dateRange
      ? `Showing grants added between ${filterObjFromQuery.dateRange.values[0].from.dateStr} to ${filterObjFromQuery.dateRange.values[0].to.dateStr}`
      : searchHeading;
  }

  let limit = GRANTS_PER_PAGE;
  let currentPage = '1';

  if (query?.limit) {
    limit = query?.limit;
  }

  if (query?.page) {
    currentPage = query?.page;
  }

  if (filterObjFromQuery.dateRange) {
    searchHeading = generateSearchHeadingFromDateRange(
      filterObjFromQuery.dateRange.values[0]
    );
  }

  const elasticSearchServiceInstance = ElasticSearchService.getInstance();

  searchResult = await elasticSearchServiceInstance.search(
    searchTerm,
    filterArray,
    limit,
    currentPage,
    sortBy
  );

  const total = searchResult.totalGrants;
  searchResult = searchResult.parsedElasticResults;

  const titleContent = `${
    filterObjFromQuery.errors.length > 0 ? 'Error: ' : ''
  } Searching for 
  ${searchTerm ? searchTerm : 'all grants'}, 
  ${total} 
  ${
    filterObjFromQuery && Object.keys(filterObjFromQuery).length >= 2
      ? 'filtered '
      : ''
  } 
  ${total !== 1 ? 'results ' : 'result '} 
- Find a grant`;

  return {
    props: {
      searchResult,
      sortBy,
      filters,
      searchTerm,
      searchHeading,
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
  filterObj,
  totalGrants,
  query,
  currentPage,
  titleContent,
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
      <Layout description="Find a grant">
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-0 padding-bottom40">
          <Link href={{ pathname: '../', query: { searchTerm } }}>
            <a className="govuk-back-link" data-cy="cyBrowseBackText">
              {gloss.buttons.back}
            </a>
          </Link>
        </div>
        <ErrorBanner errors={filterObj.errors} />
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
