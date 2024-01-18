import { useEffect } from 'react';
import { SearchFilterButton } from '../search-apply-filters/SearchFilterButton';
import { SearchFilterClearButton } from '../search-clear-filters/SearchFilterClearButton';
import { SearchFilterDate } from '../search-filter-date/SearchFilterDate';
import { SearchFilterSelector } from '../search-filter-selector/SearchFilterSelector';
import { buildQueryString } from '../../../../pages/save-search';
import { isMobile } from 'react-device-detect';

export function SearchFilterContainer({ filters, filterObj, query }) {
  useEffect(() => {
    const $filterAccordion = document.querySelector(
      '[data-module="gap-accordion"]',
    );
    if ($filterAccordion && window.GOVUKFrontend !== undefined) {
      new window.GOVUKFrontend.Accordion($filterAccordion).init();

      // TODO: Backup option
      // if (isMobile) {
      //   document.querySelector('.govuk-accordion__controls').click();
      // }
    }
  }, []);

  return (
    <div className="govuk-grid-column-one-third">
      <div className="gap_filters govuk-!-margin-bottom-2">
        <SearchFilterClearButton
          classname={
            'govuk-button govuk-button--secondary govuk-!-margin-bottom-6'
          }
          dataCy={'cyCancelFilterTop'}
        />

        <div
          className="govuk-accordion"
          data-module="gap-accordion"
          id="accordion-default"
          aria-label="filter options"
        >
          {isMobile ? (
            <SearchOptionsContainer filters={filters} filterObj={filterObj} />
          ) : (
            <Filters filters={filters} filterObj={filterObj} />
          )}
        </div>
      </div>
      <div className="govuk-button-group govuk-!-margin-bottom-0 gap_filters-actions">
        <SearchFilterButton />

        <SearchFilterClearButton
          classname={'govuk-button govuk-button--secondary'}
          dataCy={'cyCancelFilterBottom'}
        />
      </div>
      <hr className="govuk-section-break govuk-section-break--visible" />
      {Object.values(filterObj).length <= 1 ? (
        <button
          className="govuk-button govuk-button--secondary govuk-button--disabled govuk-!-margin-top-4"
          data-module="govuk-button"
          disabled="disabled"
          aria-disabled="true"
        >
          Save this search
        </button>
      ) : (
        <a
          className="govuk-button govuk-button--secondary govuk-!-margin-top-4"
          data-module="govuk-button"
          role="button"
          data-cy="cySaveSearchLink"
          href={`/save-search?${buildQueryString(query)}`}
        >
          Save this search
        </a>
      )}

      <p className="govuk-body">
        Saving your search will make it quicker to find relevant grants.
      </p>
    </div>
  );
}

function SearchOptionsContainer({ filters, filterObj }) {
  const index = -1;
  return (
    <div key={index} className="govuk-accordion__section">
      <div
        key={index}
        className="govuk-accordion__section govuk-accordion__section--expanded"
      >
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend">
            <div className="govuk-accordion__section-header">
              <h2 className="govuk-accordion__section-heading govuk-fieldset__heading">
                <span
                  className="govuk-accordion__section-button"
                  id={`accordion-default-heading-${index + 1}`}
                  data-cy={`cyAccordionButton-${''}`}
                >
                  Search options
                </span>
              </h2>
            </div>
          </legend>
          <div
            id={`accordion-default-content-${index + 1}`}
            className="govuk-accordion__section-content"
            data-testid="section-content"
            aria-labelledby={`accordion-default-heading-${index + 1}`}
            role="group"
            data-cy={`cyAccordionContent-${''}`}
          >
            <Filters filters={filters} filterObj={filterObj} />
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function Filters({ filters, filterObj }) {
  return (
    <>
      {filters?.map((filter, index) => (
        <SearchFilterSelector
          key={index}
          index={index}
          filter={filter}
          filterObj={filterObj}
        />
      ))}

      <SearchFilterDate index={filters.length} filterObj={filterObj} />
    </>
  );
}
