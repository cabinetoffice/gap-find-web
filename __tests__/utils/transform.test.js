import moment from 'moment';
import {
  addPublishedDateFilter,
  buildDslQuery,
  clearFiltersFromQuery,
  extractFiltersFields,
  generateSearchHeadingFromDateRange,
} from '../../src/utils/transform';
import {
  arrayQuery,
  filterArray,
  filterObj,
  filters,
  incorrectArrayQuery,
  incorrectFilterObj,
  incorrectTypeFilterObj,
  NonfieldsArrayQuery,
  stringArrObj,
  stringArrQuery,
  stringFilterObj,
  stringQuery,
} from './transform.data';

describe('Transform export function extract filter fields', () => {
  it('export functions should work when passed an array', async () => {
    expect(extractFiltersFields(arrayQuery, filters)).toEqual(filterObj);
  });

  it('export functions should work when passed a string', async () => {
    expect(extractFiltersFields(stringQuery, filters)).toEqual(stringFilterObj);
  });

  it('export functions should work when passed a string and an array', async () => {
    expect(extractFiltersFields(stringArrQuery, filters)).toEqual(stringArrObj);
  });

  it('export functions should work when a null filter', async () => {
    const filters = null;
    expect(extractFiltersFields(stringArrQuery, filters)).toEqual({
      errors: [],
    });
  });

  it('export functions should work when a query is submitted without the fields header', async () => {
    expect(extractFiltersFields(NonfieldsArrayQuery, filters)).toEqual({
      errors: [],
    });
  });

  it('export functions should work when a filter is added that does not exist', async () => {
    expect(extractFiltersFields(incorrectArrayQuery, filters)).toEqual(
      incorrectFilterObj,
    );
  });
});

describe('Transform export functions', () => {
  it('should work with expected data from filters on in the filter content', async () => {
    expect(buildDslQuery(filterObj)).toEqual(filterArray);
  });

  it('should work with filters that have incorrect filter types ', async () => {
    const filterArray = [];
    expect(buildDslQuery(incorrectTypeFilterObj)).toEqual(filterArray);
  });
});

describe('clearFiltersFromQuery', () => {
  it('should remove filter fields from the query object', () => {
    const query = {
      sortBy: 'default',
      searchTerm: 'a search term',
      'fields.some-filter-field': 'a value to filter on',
    };

    const response = clearFiltersFromQuery(query);
    expect(response).not.toHaveProperty('fields.some-filter-field');
  });

  it('should not alter an object if no filter fields are present', () => {
    const query = {
      sortBy: 'default',
      searchTerm: 'a search term',
    };

    expect(clearFiltersFromQuery(query)).toStrictEqual(query);
  });

  it('should remove date range fields from the query object when no filters are specified', () => {
    const query = {
      sortBy: 'default',
      searchTerm: 'a search term',
      'fields.some-filter-field': 'a value to filter on',
      'from-day': '9',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '16',
      'to-month': '5',
      'to-year': '2022',
    };

    const response = {
      sortBy: 'default',
      searchTerm: 'a search term',
    };

    expect(clearFiltersFromQuery(query)).toStrictEqual(response);
  });

  it('should only clear chosen filters if filter parameter is provided', () => {
    const query = {
      sortBy: 'default',
      searchTerm: 'a search term',
      'from-day': '9',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '16',
      'to-month': '5',
      'to-year': '2022',
    };

    const response = {
      sortBy: 'default',
      searchTerm: 'a search term',
    };

    expect(clearFiltersFromQuery(query, ['from', 'to'])).toStrictEqual(
      response,
    );
  });
});

describe('generateSearchHeadingFromDateRange', () => {
  const mockDateRange = {
    from: { dateStr: '20 April 2022', day: 20, month: 4, year: 2022 },
    to: { dateStr: '20 May 2022', day: 20, month: 5, year: 2022 },
  };

  const expectedHeader =
    'Showing grants added between 20 April 2022 to 20 May 2022';

  it('Should return correct header with expected dates included', () => {
    const header = generateSearchHeadingFromDateRange(mockDateRange);
    expect(header).toEqual(expectedHeader);
  });

  it('Should return header with both date strings included', () => {
    const header = generateSearchHeadingFromDateRange(mockDateRange);
    expect(header).toContain(mockDateRange.from.dateStr);
    expect(header).toContain(mockDateRange.to.dateStr);
  });
});

describe('addPublishedDateFilter', () => {
  it('should make no changes to the filter if no dates have been supplied', () => {
    const query = {
      searchTerm: '',
      'from-day': '',
      'from-month': '',
      'from-year': '',
      'to-day': '',
      'to-month': '',
      'to-year': '',
      sortBy: 'openingDate',
    };

    const filterObj = {
      errors: [],
    };

    const expectedFilterObj = {
      errors: [],
    };

    addPublishedDateFilter(query, filterObj);

    expect(filterObj).toStrictEqual(expectedFilterObj);
  });

  it('should add an error if a from date is provided with no to date', () => {
    const query = {
      searchTerm: '',
      'from-day': '1',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '',
      'to-month': '',
      'to-year': '',
      sortBy: 'openingDate',
    };

    const filterObj = {
      errors: [],
    };

    const expectedFilterObj = {
      errors: [
        {
          error: 'Enter the To date',
          field: 'datepicker',
        },
      ],
      dateRange: {
        values: [
          {
            search_parameter: {},
            from: {
              dateStr: null,
              day: '1',
              month: 5,
              year: '2022',
            },
            to: {
              dateStr: null,
              day: null,
              month: null,
              year: null,
              error: {
                day: true,
                month: true,
                year: true,
              },
            },
          },
        ],
      },
    };

    addPublishedDateFilter(query, filterObj);

    expect(filterObj).toStrictEqual(expectedFilterObj);
  });

  it('should add an error if a to date is provided with no from date', () => {
    const query = {
      searchTerm: '',
      'from-day': '',
      'from-month': '',
      'from-year': '',
      'to-day': '4',
      'to-month': '5',
      'to-year': '2022',
      sortBy: 'openingDate',
    };

    const filterObj = {
      errors: [],
    };

    const expectedFilterObj = {
      errors: [
        {
          error: 'Enter the From date',
          field: 'datepicker',
        },
      ],
      dateRange: {
        values: [
          {
            search_parameter: {},
            from: {
              dateStr: null,
              day: null,
              month: null,
              year: null,
              error: {
                day: true,
                month: true,
                year: true,
              },
            },
            to: {
              dateStr: null,
              day: '4',
              month: 5,
              year: '2022',
            },
          },
        ],
      },
    };

    addPublishedDateFilter(query, filterObj);

    expect(filterObj).toStrictEqual(expectedFilterObj);
  });

  it('should add an error if to date is before from date', () => {
    const query = {
      searchTerm: '',
      'from-day': '4',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '1',
      'to-month': '5',
      'to-year': '2022',
      sortBy: 'openingDate',
    };

    const filterObj = {
      errors: [],
    };

    const expectedFilterObj = {
      errors: [
        {
          error: 'To date must be the same as or after From date',
          field: 'datepicker',
        },
      ],
      dateRange: {
        values: [
          {
            search_parameter: {},
            from: {
              dateStr: '4 May 2022',
              day: '4',
              month: 5,
              year: '2022',
              error: {
                day: true,
                month: true,
                year: true,
              },
            },
            to: {
              dateStr: '1 May 2022',
              day: '1',
              month: 5,
              year: '2022',
              error: {
                day: true,
                month: true,
                year: true,
              },
            },
          },
        ],
      },
    };

    addPublishedDateFilter(query, filterObj);

    expect(filterObj).toStrictEqual(expectedFilterObj);
  });

  it('should add a complete query with no error if everything is valid', () => {
    const query = {
      searchTerm: '',
      'from-day': '1',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '4',
      'to-month': '5',
      'to-year': '2022',
      sortBy: 'openingDate',
    };

    const filterObj = {
      errors: [],
    };

    const expectedFilterObj = {
      errors: [],
      dateRange: {
        index_name: 'sys.createdAt',
        type: 'range-filter',
        values: [
          {
            search_parameter: {
              gte: moment({ day: 1, month: 4, year: 2022 })
                .startOf('day')
                .toISOString(true),
              lte: moment({ day: 4, month: 4, year: 2022 })
                .endOf('day')
                .toISOString(true),
            },
            from: {
              dateStr: '1 May 2022',
              day: '1',
              month: 5,
              year: '2022',
            },
            to: {
              dateStr: '4 May 2022',
              day: '4',
              month: 5,
              year: '2022',
            },
          },
        ],
      },
    };

    addPublishedDateFilter(query, filterObj);

    expect(filterObj).toStrictEqual(expectedFilterObj);
  });
});
