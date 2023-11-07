import { render, screen } from '@testing-library/react';
import { parseBody } from 'next/dist/server/api-utils/node';
import Router from 'next/router';
import SaveSearch, {
  getServerSideProps,
} from '../../../pages/save-search/index';
import { fetchFilters } from '../../../src/utils/contentFulPage';
import { extractFiltersFields } from '../../../src/utils/transform';

jest.mock('../../../src/utils/contentFulPage');
jest.mock('../../../src/utils/transform');
jest.mock('next/dist/server/api-utils/node');

describe('getServerSideProps', () => {
  const filterObjectFromQuery = {
    'fields.grantApplicantType.en-US': {
      display: 'Who can apply',
      index_name: 'fields.grantApplicantType.en-US',
      type: 'text-filter',
      values: [
        {
          id: '1',
          display: 'Personal / individual',
          search_parameter: 'Personal / Individual',
        },
        {
          id: '2',
          display: 'Public sector',
          search_parameter: 'Public Sector',
        },
      ],
    },
  };

  const filters = [
    {
      display: 'Who can apply',
      index_name: 'fields.grantApplicantType.en-US',
      type: 'text-filter',
      sublevel: [
        {
          id: '1',
          display: 'Personal / individual',
          search_parameter: 'Personal / Individual',
        },
        {
          id: '2',
          display: 'Public sector',
          search_parameter: 'Public Sector',
        },
      ],
    },
  ];

  it('should return expected props for GET request', async () => {
    const context = {
      req: {
        method: 'GET',
      },
      query: {
        'fields.grantApplicantType.en-US': 1,
      },
    };

    const expectedreturn = {
      props: {
        filters: filters,
        filterObj: filterObjectFromQuery,
        query: context.query,
        queryString: 'fields.grantApplicantType.en-US=1',
        errors: [],
        savedSearchName: null,
      },
    };

    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObjectFromQuery);

    const result = await getServerSideProps(context);

    expect(fetchFilters).toHaveBeenCalled();
    expect(extractFiltersFields).toHaveBeenCalledWith(context.query, filters);
    expect(result).toEqual(expectedreturn);
  });

  it('should return expected validation error if saved search name has not been provided', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.grantApplicantType.en-US': 1,
      },
    };

    const parsedBody = {
      search_name: '',
    };

    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObjectFromQuery);
    parseBody.mockResolvedValue(parsedBody);

    const result = await getServerSideProps(context);

    const expectedreturn = {
      props: {
        filters: filters,
        filterObj: filterObjectFromQuery,
        query: context.query,
        queryString: 'fields.grantApplicantType.en-US=1',
        errors: [
          {
            field: 'search_name',
            error: 'Enter a name for your saved search.',
          },
        ],
        savedSearchName: '',
      },
    };

    expect(fetchFilters).toHaveBeenCalled();
    expect(extractFiltersFields).toHaveBeenCalledWith(context.query, filters);
    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(result).toEqual(expectedreturn);
  });

  it('should return expected validation error if saved search name is longer than 250 characters', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.grantApplicantType.en-US': 1,
      },
    };

    const longSearchName =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,';
    const parsedBody = {
      search_name: longSearchName,
    };

    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObjectFromQuery);
    parseBody.mockResolvedValue(parsedBody);

    const result = await getServerSideProps(context);

    const expectedreturn = {
      props: {
        filters: filters,
        filterObj: filterObjectFromQuery,
        query: context.query,
        queryString: 'fields.grantApplicantType.en-US=1',
        errors: [
          {
            field: 'search_name',
            error: 'Saved search name must be 250 characters or less.',
          },
        ],
        savedSearchName: longSearchName,
      },
    };

    expect(fetchFilters).toHaveBeenCalled();
    expect(extractFiltersFields).toHaveBeenCalledWith(context.query, filters);
    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(result).toEqual(expectedreturn);
  });

  it('should redirect to the email page if no validation errors', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.grantApplicantType.en-US': [1, 2],
      },
    };

    const savedSearchName = 'All UK search';
    const parsedBody = {
      search_name: savedSearchName,
    };

    const expectedQueryString = `fields.grantApplicantType.en-US=1&fields.grantApplicantType.en-US=2&search_name=${savedSearchName}`;

    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObjectFromQuery);
    parseBody.mockResolvedValue(parsedBody);

    const result = await getServerSideProps(context);

    const expectedreturn = {
      redirect: {
        statusCode: 302,
        destination: `save-search/notifications?${expectedQueryString}`,
      },
    };

    expect(fetchFilters).toHaveBeenCalled();
    expect(extractFiltersFields).toHaveBeenCalledWith(context.query, filters);
    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(result).toEqual(expectedreturn);
  });
});

describe('save-search/index.js testing the page', () => {
  const mockBack = jest.fn();
  const propsWithoutErrors = {
    filters: [],
    filterObj: {},
    query: {},
    queryString: '',
    errors: [],
    savedSearchName: '',
  };

  const propsWithErrors = {
    filters: [],
    filterObj: {},
    query: {},
    queryString: '',
    errors: [
      {
        field: 'search_name',
        error: 'Enter a saved seaarch name',
      },
    ],
    savedSearchName: '',
  };

  beforeAll(async () => {
    const useRouter = jest.spyOn(Router, 'useRouter');

    useRouter.mockImplementation(() => ({
      route: '/',
      pathname: '',
      prefetch: jest.fn(() => Promise.resolve()),
      push: jest.fn(),
      back: mockBack,
    }));
  });

  it('should render a heading', async () => {
    render(<SaveSearch {...propsWithoutErrors} />);

    expect(screen.getAllByText('Save your search')).toHaveLength(1);
  });

  it('should render the description', async () => {
    render(<SaveSearch {...propsWithoutErrors} />);

    expect(
      screen.queryAllByText('The filters you have chosen include:'),
    ).toHaveLength(1);
  });

  it('the back button should have the right href', async () => {
    render(<SaveSearch {...propsWithoutErrors} />);

    expect(screen.getByTestId('govuk-back')).toHaveAttribute('href', '/grants');
  });

  it('should render input heading and description', async () => {
    render(<SaveSearch {...propsWithoutErrors} />);

    expect(screen.getAllByText('Name this search')).toHaveLength(1);
    expect(
      screen.getAllByText(
        'You can save more than one search. Add a name so it is easier to tell your searches apart.',
      ),
    ).toHaveLength(1);
  });

  it('should list of filters to save', async () => {
    const propsWithFilters = {
      ...propsWithoutErrors,
      filterObj: {
        'fields.grantApplicantType.en-US': {
          display: 'Who can apply',
          index_name: 'fields.grantApplicantType.en-US',
          type: 'text-filter',
          values: [
            {
              id: '1',
              display: 'Personal / individual',
              search_parameter: 'Personal / Individual',
            },
            {
              id: '2',
              display: 'Public sector',
              search_parameter: 'Public Sector',
            },
          ],
        },
        dateRange: {
          values: [
            {
              from: {
                year: '2022',
                month: '12',
                day: '01',
              },
              to: {
                year: '2022',
                month: '01',
                day: '01',
              },
            },
          ],
        },
      },
      filters: [
        {
          display: 'Who can apply',
          index_name: 'fields.grantApplicantType.en-US',
          type: 'text-filter',
          sublevel: [
            {
              id: '1',
              display: 'Personal / individual',
              search_parameter: 'Personal / Individual',
            },
            {
              id: '2',
              display: 'Public sector',
              search_parameter: 'Public Sector',
            },
          ],
        },
      ],
    };
    render(<SaveSearch {...propsWithFilters} />);

    expect(screen.queryAllByText('Who can apply')).toHaveLength(1);
    expect(screen.getAllByText('Personal / individual')).toHaveLength(1);
    expect(screen.getAllByText('Public sector')).toHaveLength(1);
  });

  it('should display errors', async () => {
    render(<SaveSearch {...propsWithErrors} />);

    expect(screen.queryByText('There is a problem')).toBeDefined();
    expect(screen.queryAllByText('Enter a saved seaarch name')).toHaveLength(2);
    expect(document.getElementById('search_name')).toHaveClass(
      'govuk-input--error',
    );
    expect(screen.getByTestId('red-banner')).toHaveClass(
      'govuk-form-group--error',
    );
  });

  it('should populate the text box if a saved search name is provided', () => {
    const propsWithSavedSearch = {
      ...propsWithoutErrors,
      savedSearchName: 'All England Search',
    };
    render(<SaveSearch {...propsWithSavedSearch} />);

    expect(document.getElementById('search_name')).toHaveValue(
      propsWithSavedSearch.savedSearchName,
    );
  });
});
