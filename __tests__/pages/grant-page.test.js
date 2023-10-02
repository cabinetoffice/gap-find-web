import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import BrowseGrants, { getServerSideProps } from '../../pages/grants/index';
import { ElasticSearchService } from '../../src/service/elastic_service';
import { fetchFilters } from '../../src/utils/contentFulPage';
import { clearFiltersFromQuery } from '../../src/utils/transform';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});
jest.mock('../../src/utils/transform', () => ({
  ...jest.requireActual('../../src/utils/transform'),
  clearFiltersFromQuery: jest.fn(),
}));
jest.mock('../../src/utils/contentFulPage');

const mockGrant = {
  grantName: 'Some Grant Name',
  label: 'label',
  grantLocation: ['location one', 'location two'],
  grantApplicantType: ['applicant type one', 'applicant type two'],
  grantShortDescription: 'Some grant description blah blah blah',
  grantFunder: 'Grant Funder',
  grantMinimumAwardDisplay: '£500',
  grantMaximumAwardDisplay: '£10,000',
  grantTotalAwardDisplay: '£100 million',
  grantApplicationOpenDate: '2022-02-03T00:01+00:00',
  grantApplicationCloseDate: '2022-04-03T00:01+00:00',
};

const mockFilters = [
  {
    display: 'Who can apply',
    index_name: 'fields.grantApplicationType.en-US',
    sublevel: [
      {
        display: 'Personal / individual',
        id: '1',
      },
      {
        display: 'Public sector',
        id: '2',
      },
      {
        display: 'Private sector',
        id: '3',
      },
      {
        display: 'Non profit',
        id: '4',
      },
    ],
  },
];

const component = (
  <BrowseGrants
    searchResult={[mockGrant]}
    searchTerm="search"
    searchHeading="Search grants"
    filters={mockFilters}
    errors={[]}
    filterObj={{ fieldsgrantApplicationTypeenUS: '', errors: [] }}
    totalGrants={1}
    query={{}}
  />
);

const invalidFilterComponent = (
  <BrowseGrants
    searchResult={[mockGrant]}
    searchTerm="search"
    searchHeading="Search grants"
    filters={mockFilters}
    errors={[{ field: 'datepicker', error: 'Test' }]}
    filterObj={{ errors: [{ field: 'datepicker', error: 'Test' }] }}
    totalGrants={1}
    query={{}}
  />
);

let pushMock = jest.fn();

describe('Rendering the browse grants page', () => {
  beforeAll(() => {
    useRouter.mockReturnValue({
      route: '/',
      prefetch: jest.fn(() => Promise.resolve()),
      back: jest.fn(),
      push: pushMock,
      query: { page: '1' },
    });
  });

  it('Should render a back button', () => {
    render(component);
    expect(screen.getByText('Back')).toBeDefined();
  });

  it('renders error message when error array in props is populated', () => {
    render(invalidFilterComponent);
    expect(
      screen.getByRole('heading', { name: 'There is a problem' }),
    ).toBeDefined();

    const summaryDatepicker = screen.getByRole('link', {
      name: 'Test',
    });

    expect(summaryDatepicker).toBeDefined();
    expect(summaryDatepicker).toHaveAttribute('href', '#datepicker');
    expect(summaryDatepicker).toHaveTextContent('Test');
  });

  it('should have a back button that retains search terms and goes back', () => {
    render(component);
    expect(screen.getByText('Back')).toHaveAttribute(
      'href',
      '/?searchTerm=search',
    );
  });

  it('Should render grant title link', () => {
    render(component);
    expect(screen.getByRole('link', { name: 'Some Grant Name' })).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Some Grant Name' }),
    ).toHaveAttribute('href', '/grants/label');
  });

  it('Should render grant description', () => {
    render(component);
    expect(
      screen.getByText('Some grant description blah blah blah'),
    ).toBeDefined();
  });

  it('Should render grant location', () => {
    render(component);
    expect(screen.getByText('Location')).toBeDefined();
    expect(screen.getByText('location one, location two')).toBeDefined();
  });

  it('Should render grant funder', () => {
    render(component);
    expect(screen.getByText('Funding organisation')).toBeDefined();
    expect(screen.getByText('Grant Funder')).toBeDefined();
  });

  it('Should render grant applicant type', () => {
    render(component);
    expect(screen.getAllByText('Who can apply')).toHaveLength(2);
    expect(
      screen.getByText('applicant type one, applicant type two'),
    ).toBeDefined();
  });

  it('Should render grant amount', () => {
    render(component);
    expect(screen.getByText('How much you can get')).toBeDefined();
    expect(screen.getByText('From £500 to £10,000')).toBeDefined();
  });

  it('Should render grant size', () => {
    render(component);
    expect(screen.getByText('Total size of grant scheme')).toBeDefined();
    expect(screen.getByText('£100 million')).toBeDefined();
  });

  it('Should render grant opening date', () => {
    render(component);
    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' && content === 'Opening date'
        );
      }),
    ).toBeDefined();
    expect(screen.getByText('3 February 2022, 12:01am')).toBeDefined();
  });

  it('Should render grant closing date', () => {
    render(component);
    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'span' && content === 'Closing date'
        );
      }),
    ).toBeDefined();
    expect(screen.getByText('3 April 2022, 12:01am')).toBeDefined();
  });

  it('Should render a label for the search form', () => {
    render(component);
    expect(screen.getByText('Search grants')).toBeDefined();
  });

  it('Should render filters', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: 'Who can apply' }),
    ).toBeDefined();
    expect(screen.getByText('Personal / individual')).toBeDefined();
    expect(screen.getByText('Public sector')).toBeDefined();
    expect(screen.getByText('Private sector')).toBeDefined();
    expect(screen.getByText('Non profit')).toBeDefined();
    expect(screen.getByText('Date added')).toBeDefined();
  });

  it('Should render sort by options if theres 1 or more grants', () => {
    render(component);
    expect(screen.getByTestId('js-select')).toBeDefined();
    const options = screen.getAllByRole('option');
    expect(options[0].innerText).toEqual('Opening date');
    expect(options[0]).toHaveAttribute('data-value', 'openingDate');
    expect(options[1].innerText).toEqual('Closing date');
    expect(options[1]).toHaveAttribute('data-value', 'closingDate');
    expect(options[2].innerText).toEqual('Grant value: High to low');
    expect(options[2]).toHaveAttribute('data-value', 'maxValue');
    expect(options[3].innerText).toEqual('Grant value: Low to high');
    expect(options[3]).toHaveAttribute('data-value', 'minValue');
  });

  it('Should push new query when sort by is changed', () => {
    render(component);
    expect(screen.getByTestId('js-select')).toBeDefined();
    let options = screen.getAllByRole('option');
    userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    userEvent.click(options[1]);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({
      query: expect.objectContaining({ sortBy: 'closingDate' }),
    });
  });
});

describe('getServerSideProps', () => {
  let elasticSearchServiceMock;
  beforeEach(() => {
    jest.clearAllMocks();

    fetchFilters.mockReturnValue(mockFilters);

    elasticSearchServiceMock = jest
      .spyOn(ElasticSearchService.prototype, 'search')
      .mockImplementationOnce(() => {
        return {
          parsedElasticResults: [
            {
              grantName: 'test grant',
            },
          ],
          totalGrants: 1,
        };
      });
  });

  afterEach(() => {
    expect(elasticSearchServiceMock).toHaveBeenCalledTimes(1);
  });

  const getExpectedResult = ({
    searchTerm = '',
    errors = [],
    searchTermInvalid = false,
  } = {}) => ({
    props: {
      searchResult: [
        {
          grantName: 'test grant',
        },
      ],
      sortBy: 'default',
      filters: [
        {
          display: 'Who can apply',
          index_name: 'fields.grantApplicationType.en-US',
          sublevel: [
            {
              display: 'Personal / individual',
              id: '1',
            },
            {
              display: 'Public sector',
              id: '2',
            },
            {
              display: 'Private sector',
              id: '3',
            },
            {
              display: 'Non profit',
              id: '4',
            },
          ],
        },
      ],
      searchTerm: !searchTermInvalid ? searchTerm : '',
      searchHeading: 'Search grants',
      filterObj: {
        errors: [],
      },
      errors,
      totalGrants: 1,
      query: searchTerm ? { searchTerm, href: '/grants' } : { href: '/grants' },
      currentPage: '1',
      titleContent: ` Searching for \n  ${
        searchTerm && !searchTermInvalid ? searchTerm : 'all grants'
      }, \n  1 \n   \n  result  \n- Find a grant`,
    },
  });

  it('searches elastic service with blank searchTerm if none passed', async () => {
    const result = await getServerSideProps({ query: {} });

    expect(result).toStrictEqual(getExpectedResult());
  });

  it('searches elastic service with blank search term and returns error if searchTerm > 100 chars', async () => {
    const longSearchTerm =
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901';

    const result = await getServerSideProps({
      query: { searchTerm: longSearchTerm },
    });

    expect(result).toStrictEqual(
      getExpectedResult({
        searchTerm: longSearchTerm,
        errors: [
          {
            error: 'Search term must be 100 characters or less',
            field: 'searchAgainTermInput',
          },
        ],
        searchTermInvalid: true,
      }),
    );
  });

  it('searches elastic service using passed search term', async () => {
    const result = await getServerSideProps({
      query: { searchTerm: 'unit test search' },
    });

    expect(result).toStrictEqual(
      getExpectedResult({ searchTerm: 'unit test search' }),
    );
  });

  describe('filters', () => {
    const query = {
      clearFilters: 'true',
      searchTerm: 'unit test search',
      'fields.grantApplicantType.en-US': 4,
      'from-day': '9',
      'from-month': '5',
      'from-year': '2022',
      'to-day': '16',
      'to-month': '5',
      'to-year': '2022',
    };
    const mockResponseAfterClear = { searchTerm: 'unit test search' };
    beforeEach(() =>
      clearFiltersFromQuery.mockReturnValue(mockResponseAfterClear),
    );

    it('should retrieve available filters from contentful', async () => {
      const result = await getServerSideProps({
        query: { searchTerm: 'unit test search' },
      });
      expect(fetchFilters).toHaveBeenCalledTimes(1);
      expect(result.props).toEqual(
        expect.objectContaining({ filters: mockFilters }),
      );
    });

    it('should clear filters from query when requested', async () => {
      const result = await getServerSideProps({ query });

      expect(result.props).toEqual(
        expect.objectContaining({ filterObj: { errors: [] } }),
      );
    });

    it('should clear date range filters from query when requested', async () => {
      const query = {
        clearDateFilters: 'true',
        searchTerm: 'unit test search',
        'fields.grantApplicantType.en-US': 4,
        'from-day': '9',
        'from-month': '5',
        'from-year': '2022',
        'to-day': '16',
        'to-month': '5',
        'to-year': '2022',
      };
      const mockResponseAfterClear = { searchTerm: 'unit test search' };
      clearFiltersFromQuery.mockReturnValue(mockResponseAfterClear);

      await getServerSideProps({
        query,
      });
      expect(clearFiltersFromQuery).toHaveBeenCalledTimes(1);
      expect(clearFiltersFromQuery).toHaveBeenCalledWith(query, ['from', 'to']);
    });
  });

  describe('sorting', () => {
    it('should assign a default sort if none is provided', async () => {
      const result = await getServerSideProps({
        query: { searchTerm: 'unit test search' },
      });
      expect(result.props.sortBy).toBe('default');
    });

    it('should use sort provided in query', async () => {
      const result = await getServerSideProps({
        query: { searchTerm: 'unit test search', sortBy: 'openingDate' },
      });
      expect(result.props.sortBy).toBe('openingDate');
    });
  });

  describe('pagination', () => {
    it('should call search from elastic search class with pagination properties if present', async () => {
      await getServerSideProps({
        query: { searchTerm: 'unit test search', skip: 10, limit: 10, page: 2 },
      });
      expect(elasticSearchServiceMock).toHaveBeenCalledWith(
        'unit test search',
        [],
        10,
        2,
        'default',
      );
    });

    it('should use default pagination properties if none provided', async () => {
      await getServerSideProps({
        query: { searchTerm: 'unit test search' },
      });
      expect(elasticSearchServiceMock).toHaveBeenCalledWith(
        'unit test search',
        [],
        10,
        '1',
        'default',
      );
    });
  });

  describe('searchHeading', () => {
    it('should use the default heading if no dates are provided', async () => {
      const result = await getServerSideProps({ query: {} });
      expect(result.props.searchHeading).toBe('Search grants');
    });

    it('should display date if results are filtered by a date range', async () => {
      const mockDateFilterQuery = {
        'from-day': '9',
        'from-month': '5',
        'from-year': '2022',
        'to-day': '16',
        'to-month': '5',
        'to-year': '2022',
      };

      const result = await getServerSideProps({ query: mockDateFilterQuery });
      expect(result.props.searchHeading).toBe(
        'Showing grants added between 9 May 2022 to 16 May 2022',
      );
    });
  });
});
