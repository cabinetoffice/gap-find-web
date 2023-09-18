import { DateValidationError } from './transformer/date-range-transformer.errors';
import { transformQueryDateToMoment } from './transformer/date-range-transformer';

export const extractFiltersFields = (query, filters) => {
  const filterObj = {};
  filterObj.errors = [];
  for (const property in query) {
    if (property?.startsWith('fields')) {
      if (filters !== null) {
        const filter = filters.find((filters_value) => {
          if (filters_value.index_name === property) {
            return true;
          }
        });
        if (!filter) continue;
        const sublevel = filter.sublevel.filter((sublevel_value) => {
          if (Array.isArray(query[property])) {
            for (const value of query[property]) {
              if (sublevel_value.id === value) {
                return true;
              }
            }
          } else {
            if (sublevel_value.id === query[property]) {
              return true;
            }
          }
        });
        const filterResult = Object.assign({}, filter);
        delete filterResult.sublevel;
        filterResult.values = sublevel;
        filterObj[property] = filterResult;
      }
    }
  }

  return filterObj;
};

export function addPublishedDateFilter(query, filterObj) {
  const baseFromDate = getDateFromQuery(query, 'from-');
  const baseToDate = getDateFromQuery(query, 'to-');

  if (baseFromDate || baseToDate) {
    let search_parameter = {};
    let toDate, fromDate;
    let fromBuilder = {};
    let toBuilder = {};
    let dateRangeFilterBuilder = {};

    try {
      if (!baseFromDate && baseToDate) {
        const error = new DateValidationError('Enter the From date');
        error.fieldName = 'From';
        error.fields.day = true;
        error.fields.month = true;
        error.fields.year = true;
        throw error;
      }

      if (baseFromDate && !baseToDate) {
        const error = new DateValidationError('Enter the To date');
        error.fieldName = 'To';
        error.fields.day = true;
        error.fields.month = true;
        error.fields.year = true;
        throw error;
      }

      fromDate = transformQueryDateToMoment(baseFromDate, 'From');
      toDate = transformQueryDateToMoment(baseToDate, 'To');

      if (toDate.isBefore(fromDate)) {
        const error = new DateValidationError(
          'To date must be the same as or after From date',
        );
        error.fieldName = 'Both';
        error.fields.day = true;
        error.fields.month = true;
        error.fields.year = true;
        throw error;
      }

      dateRangeFilterBuilder = {
        index_name: 'sys.createdAt',
        type: 'range-filter',
      };

      search_parameter = {
        gte: fromDate.startOf('day').toISOString(true),
        lte: toDate.endOf('day').toISOString(true),
      };
    } catch (error) {
      console.error(error);
      filterObj.errors.push({
        error: error.message,
        field: 'datepicker',
      });

      if (error instanceof DateValidationError) {
        let fieldName = error.fieldName.toLowerCase();
        switch (fieldName) {
          case 'both':
            fromBuilder = {
              error: error.fields,
            };
            toBuilder = {
              error: error.fields,
            };
            break;
          case 'to':
            toBuilder = {
              error: error.fields,
            };
            break;
          case 'from':
            fromBuilder = {
              error: error.fields,
            };
            break;
        }
      }
    }

    let fromMonth, toMonth;
    if (baseFromDate?.month) {
      fromMonth = +baseFromDate.month + 1;
    } else {
      fromMonth = null;
    }
    if (baseToDate?.month) {
      toMonth = +baseToDate.month + 1;
    } else {
      toMonth = null;
    }

    filterObj.dateRange = {
      ...dateRangeFilterBuilder,
      values: [
        {
          search_parameter,
          from: {
            dateStr: fromDate ? fromDate.format('D MMMM YYYY') : null,
            day: baseFromDate ? baseFromDate.day : null,
            month: fromMonth,
            year: baseFromDate ? baseFromDate.year : null,
            ...fromBuilder,
          },
          to: {
            dateStr: toDate ? toDate.format('D MMMM YYYY') : null,
            day: baseToDate ? baseToDate.day : null,
            month: toMonth,
            year: baseToDate ? baseToDate.year : null,
            ...toBuilder,
          },
        },
      ],
    };
  }
}

function getDateFromQuery(query, fieldPrefix) {
  if (!query) return null;

  let day = query[fieldPrefix + 'day'];
  let month = query[fieldPrefix + 'month'];
  let year = query[fieldPrefix + 'year'];

  let transformedMonth = '';
  if (month) {
    transformedMonth = `${month - 1}`;
  }
  if (day || month || year) {
    return {
      day,
      month: transformedMonth,
      year,
    };
  } else {
    return null;
  }
}

export const buildDslQuery = (filters) => {
  const filterArray = [];
  const innerArray = [];

  if (filters !== null) {
    for (const filter of Object.values(filters)) {
      const tempArray = [];
      switch (filter.type) {
        case 'text-filter': {
          for (const filterValue of filter.values) {
            tempArray.push({
              match_phrase: {
                [filter.index_name]: filterValue.search_parameter,
              },
            });
          }
          innerArray.push(tempArray);
          break;
        }
        case 'range-filter': {
          for (const filterValue of filter.values) {
            tempArray.push({
              range: {
                [filter.index_name]: filterValue.search_parameter,
              },
            });
          }
          innerArray.push(tempArray);
          break;
        }
      }
    }
    const innerQuery = [];
    for (const query in innerArray)
      innerQuery.push({
        bool: {
          should: innerArray[query],
        },
      });
    if (innerQuery.length > 0) {
      filterArray.push({
        bool: {
          must: innerQuery,
        },
      });
    }
  }

  return filterArray;
};

const allFilters = ['fields', 'from', 'to'];

export const clearFiltersFromQuery = (query, filters) => {
  filters = filters ? filters : allFilters;
  Object.entries(query).forEach(([key]) => {
    if (filters.some((filter) => key.startsWith(filter))) {
      delete query[key];
    }
  });

  return query;
};

export const generateSearchHeadingFromDateRange = (dateRangeValues) => {
  return `Showing grants added between ${dateRangeValues.from.dateStr} to ${dateRangeValues.to.dateStr}`;
};
