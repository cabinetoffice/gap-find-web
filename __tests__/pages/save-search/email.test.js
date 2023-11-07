import { render, screen } from '@testing-library/react';
import { parseBody } from 'next/dist/server/api-utils/node';
import Router from 'next/router';
import Email, { getServerSideProps } from '../../../pages/save-search/email';
import { buildQueryString } from '../../../pages/save-search/index';
import { generateSignedApiKey } from '../../../src/service/api-key-service';
import { sendEmail } from '../../../src/service/gov_notify_service';
import { save } from '../../../src/service/saved_search_service';
import { EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR } from '../../../src/utils/constants';
import { fetchFilters } from '../../../src/utils/contentFulPage';
import { extractFiltersFields } from '../../../src/utils/transform';

jest.mock('../../../pages/save-search/index');
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../src/utils/contentFulPage');
jest.mock('../../../src/utils/transform');
jest.mock('../../../src/service/saved_search_service');
jest.mock('../../../src/service/gov_notify_service');
jest.mock('../../../src/service/api-key-service');

describe('getServerSideProps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return expected props for a GET request', async () => {
    const context = {
      req: {
        method: 'GET',
      },
      query: {
        'fields.whoCanApply': 1,
      },
    };

    const expectedQueryString = 'fields.whoCanApply=1';

    const expectedReturn = {
      props: {
        query: context.query,
        errors: [],
        queryString: expectedQueryString,
      },
    };

    buildQueryString.mockReturnValue(expectedQueryString);

    const result = await getServerSideProps(context);

    expect(result).toEqual(expectedReturn);
  });

  it('should return expected validation errors if privacy policy is not accepted and email address is empty', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.whoCanApply': 1,
      },
    };

    const expectedQueryString = 'fields.whoCanApply=1';

    const parsedBody = {
      notification_privacy: '',
      user_email: '',
    };

    const expectedResponse = {
      props: {
        query: context.query,
        errors: [
          {
            field: 'notification_privacy',
            error:
              'You must confirm that you have read and understood the privacy notice.',
          },
          {
            field: 'user_email',
            error: 'Enter your email address.',
          },
        ],
        privacy: parsedBody.notification_privacy ?? null,
        user_email: parsedBody.user_email ?? null,
        queryString: expectedQueryString,
      },
    };

    parseBody.mockResolvedValue(parsedBody);

    const methodResponse = await getServerSideProps(context);

    expect(buildQueryString).toHaveBeenCalledWith(context.query);
    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(methodResponse).toEqual(expectedResponse);
  });

  it('should return assign notifications_consent to "true"', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.grantApplicantType.en-US': [1, 2],
        search_name: 'All UK Search',
        notifications_consent: 'true',
      },
    };

    const parsedBody = {
      notification_privacy: 'on',
      user_email: 'email@test.com',
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

    const filterObj = {
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
            search_parameter: {
              gte: '2022-01-01',
              lte: '2022-10-10',
            },
          },
        ],
      },
    };

    const searchToSave = {
      name: context.query.search_name,
      filters: [
        {
          name: 'fields.grantApplicantType.en-US',
          searchTerm: 'Personal / Individual',
          subFilterid: '1',
          type: 'text-filter',
        },
        {
          name: 'fields.grantApplicantType.en-US',
          searchTerm: 'Public Sector',
          subFilterid: '2',
          type: 'text-filter',
        },
      ],
      fromDate: '2022-01-01',
      toDate: '2022-10-10',
      status: 'DRAFT',
      notifications: true,
      email: parsedBody.user_email,
      search_term: undefined,
    };

    const searchAfterSave = {
      id: 1,
      name: context.query.search_name,
      filters: [
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '1',
        },
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '2',
        },
      ],
      fromDate: '2022-01-01',
      toDate: '2022-10-10',
      status: 'DRAFT',
      notifications: false,
      search_term: undefined,
      user: {
        emailAddress: parsedBody.user_email,
      },
    };

    const token = 'an-encrypted-search-id';

    parseBody.mockResolvedValue(parsedBody);
    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObj);
    save.mockResolvedValue(searchAfterSave);
    generateSignedApiKey.mockReturnValue(token);

    await getServerSideProps(context);

    expect(save).toHaveBeenCalledWith(searchToSave);
  });

  it('should return expected validation errors if email address is not in expected format', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.whoCanApply': 1,
      },
    };

    const expectedQueryString = 'fields.whoCanApply=1';

    const parsedBody = {
      notification_privacy: 'on',
      user_email: 'a-badly-formatted-email-address',
    };

    const expectedResponse = {
      props: {
        query: context.query,
        errors: [
          {
            field: 'user_email',
            error: EMAIL_ADDRESS_FORMAT_VALIDATION_ERROR,
          },
        ],
        privacy: parsedBody.notification_privacy ?? null,
        user_email: parsedBody.user_email ?? null,
        queryString: expectedQueryString,
      },
    };

    parseBody.mockResolvedValue(parsedBody);

    const methodResponse = await getServerSideProps(context);

    expect(buildQueryString).toHaveBeenCalledWith(context.query);
    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(methodResponse).toEqual(expectedResponse);
  });

  it('should create a saved search, save it to the database and redirect to check email page', async () => {
    const context = {
      req: {
        method: 'POST',
      },
      query: {
        'fields.grantApplicantType.en-US': [1, 2],
        search_name: 'All UK Search',
      },
    };

    const parsedBody = {
      notification_privacy: 'on',
      user_email: 'email@test.com',
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

    const filterObj = {
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
            search_parameter: {
              gte: '2022-01-01',
              lte: '2022-10-10',
            },
          },
        ],
      },
    };

    const searchToSave = {
      name: context.query.search_name,
      filters: [
        {
          name: 'fields.grantApplicantType.en-US',
          searchTerm: 'Personal / Individual',
          subFilterid: '1',
          type: 'text-filter',
        },
        {
          name: 'fields.grantApplicantType.en-US',
          searchTerm: 'Public Sector',
          subFilterid: '2',
          type: 'text-filter',
        },
      ],
      fromDate: '2022-01-01',
      toDate: '2022-10-10',
      status: 'DRAFT',
      notifications: false,
      email: parsedBody.user_email,
      search_term: undefined,
    };

    const searchAfterSave = {
      id: 1,
      name: context.query.search_name,
      filters: [
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '1',
        },
        {
          name: 'fields.grantApplicantType.en-US',
          subFilterid: '2',
        },
      ],
      fromDate: '2022-01-01',
      toDate: '2022-10-10',
      status: 'DRAFT',
      notifications: false,
      search_term: undefined,
      user: {
        emailAddress: parsedBody.user_email,
      },
    };

    const token = 'an-encrypted-search-id';

    parseBody.mockResolvedValue(parsedBody);
    fetchFilters.mockResolvedValue(filters);
    extractFiltersFields.mockReturnValue(filterObj);
    save.mockResolvedValue(searchAfterSave);
    generateSignedApiKey.mockReturnValue(token);

    const methodResponse = await getServerSideProps(context);

    expect(parseBody).toHaveBeenCalledWith(context.req, '1mb');
    expect(fetchFilters).toHaveBeenCalled();
    expect(extractFiltersFields).toHaveBeenCalledWith(context.query, filters);
    expect(save).toHaveBeenCalledWith(searchToSave);
    expect(sendEmail).toHaveBeenCalledWith(
      parsedBody.user_email,
      {
        'Confirmation link for saved search': `${process.env.HOST}/api/save-search/confirm/${token}`,
        'name of saved search': searchAfterSave.name,
      },
      process.env.GOV_NOTIFY_SAVED_SEARCH_CONFIRMATION_TEMPLATE,
    );
    expect(methodResponse).toEqual({
      redirect: {
        statusCode: 302,
        destination: `check-email?email=${parsedBody.user_email}`,
      },
    });
  });

  describe('save-search/index.js testing the page', () => {
    const mockBack = jest.fn();
    const props = {
      errors: [],
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
      render(<Email {...props} />);

      expect(screen.getAllByText('Enter your email address')).toHaveLength(1);
    });

    it('should render the description', async () => {
      render(<Email {...props} />);

      expect(
        screen.queryAllByText(
          'To save your search, enter your email address below.',
        ),
      ).toHaveLength(1);
    });

    it('should render privacy policy', async () => {
      render(<Email {...props} />);

      const linkToNotice = screen.getByRole('link', { name: 'privacy notice' });
      expect(linkToNotice).toBeDefined();
      expect(linkToNotice).toHaveAttribute('href', '/info/privacy');
      expect(linkToNotice).toHaveAttribute('target', '_blank');
    });

    it('should NOT pre-populate the email and privacy notice values if no pre-existing answers provided', () => {
      render(<Email {...props} />);

      expect(document.getElementById('user_email')).toHaveValue('');
      expect(document.getElementById('notification_privacy')).not.toBeChecked();
    });

    it('should pre-populate the email and privacy notice values if pre-existing answers provided', () => {
      const PropsWithExistingValues = {
        ...props,
        user_email: 'test@gmail.com',
        privacy: 'on',
      };
      render(<Email {...PropsWithExistingValues} />);

      expect(document.getElementById('user_email')).toHaveValue(
        'test@gmail.com',
      );
      expect(document.getElementById('notification_privacy')).toBeChecked();
    });

    it('should display error banner if error array is not empty', () => {
      const propsWithErrors = {
        ...props,
        errors: [
          {
            field: 'user_email',
            error: 'Enter your email address.',
          },
        ],
      };
      render(<Email {...propsWithErrors} />);

      expect(screen.queryByText('There is a problem')).toBeDefined();
      expect(document.getElementById('red-banner')).toHaveClass(
        'govuk-form-group--error',
      );
    });

    it('should display error messages and apply error classes to required components', () => {
      const propsWithErrors = {
        ...props,
        errors: [
          {
            field: 'user_email',
            error: 'Enter your email address.',
          },
          {
            field: 'notification_privacy',
            error:
              'You must confirm that you have read and understood the privacy policy.',
          },
        ],
      };
      render(<Email {...propsWithErrors} />);

      expect(document.getElementById('user_email')).toHaveClass(
        'govuk-input--error',
      );
      expect(screen.queryAllByText('Enter your email address.')).toHaveLength(
        2,
      );
      expect(
        screen.queryAllByText(
          'You must confirm that you have read and understood the privacy policy.',
        ),
      ).toHaveLength(2);
    });

    it('should submit the form to the expected URL with additional query params', () => {
      const queryString = 'searchTerm=test&fields.whoCanApply=1';
      const propsWithQueryString = {
        ...props,
        queryString,
      };
      render(<Email {...propsWithQueryString} />);

      expect(
        document.getElementById('saved-search-email-form'),
      ).toHaveAttribute('action', `/save-search/email?${queryString}`);
    });

    it('the back button should have the right href', async () => {
      const propsWithQueryParams = {
        ...props,
        query: {
          searchTerm: 'test',
        },
      };
      render(<Email {...propsWithQueryParams} />);

      expect(screen.getByTestId('govuk-back')).toHaveAttribute(
        'href',
        '/save-search/notifications?searchTerm=test',
      );
    });
  });
});
