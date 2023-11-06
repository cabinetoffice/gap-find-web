import { render, screen } from '@testing-library/react';
import Signup, {
  getServerSideProps,
} from '../../../pages/subscriptions/signup';
import { fetchEntry } from '../../../src/utils/contentFulPage';
import { client } from '../../../src/utils';

jest.mock('../../../src/utils/contentFulPage');
jest.mock('next/router', () => ({
  useRouter() {
    return jest.fn();
  },
}));
jest.mock('../../../src/utils/jwt', () => ({
  getJwtFromCookies: jest.fn(() => ({ jwtPayload: {}, jwt: 'a.b.c' })),
}));
jest.mock('../../../src/utils/axios', () => ({
  client: {
    post: jest.fn(),
  },
}));
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

describe('Signing up with email and accepting privacy policy', () => {
  const grantDetail = {
    fields: {
      grantName: 'Chargepoint Grant for people renting and living in flats (1)',
      label: 'Chargepoint Grant 2',
    },
    sys: {
      id: 'id',
    },
    errors: [],
    previousFormValues: {},
  };

  beforeEach(() => {
    fetchEntry.mockReturnValue(grantDetail);
  });

  const component = <Signup grantDetail={grantDetail} />;

  it('should not load errors on initial load', () => {
    render(component);
    expect(screen.queryByText('There is a problem')).toBeNull();
    expect(
      screen.queryByRole('link', { name: 'summary-user_email' }),
    ).toBeNull();
    expect(
      screen.queryByRole('link', { name: 'summary-notification_privacy' }),
    ).toBeNull();
    const textbox = screen.getByRole('textbox', {
      name: 'Enter your email address',
    });
    expect(textbox).not.toHaveClass('govuk-input--error');
    expect(textbox.getAttribute('aria-label')).toBe('Enter your email address');
    expect(screen.getByTestId('red-banner')).not.toHaveClass(
      'govuk-form-group--error',
    );
  });

  it('Should display the name of the grant', () => {
    render(component);
    expect(
      screen.getByText(
        'Enter your email address to get updates about Chargepoint Grant for people renting and living in flats (1).',
      ),
    ).toBeDefined();
  });

  it('Should have a privacy policy checkbox and relevant label', () => {
    render(component);
    const checkbox = screen.getByTestId('notification_privacy');
    expect(checkbox).toHaveProperty('type', 'checkbox');
    expect(screen.getByText('I have read and understood the')).toBeDefined();
    expect(checkbox).not.toBeChecked();
  });

  it('Should have a continue button of type submit', () => {
    render(component);

    const continueBtn = screen.getByRole('button', {
      name: 'Submit email address',
    });
    expect(continueBtn.getAttribute('aria-label')).toBe('Submit email address');
    expect(continueBtn).toHaveProperty('type', 'submit');
    expect(screen.getByText('Continue')).toBeDefined();
  });

  it('Should have a back link', () => {
    render(component);
    expect(screen.getByText('Back')).toBeDefined();
  });
});

describe('Validation errors when signing up', () => {
  const grantDetail = {
    fields: {
      grantName:
        'Chargepoint Grant for people renting and living in flats (1) ',
      label: 'Chargepoint Grant 2',
    },
    sys: {
      id: 'id',
    },
    errors: [
      {
        field: 'notification_privacy',
        error:
          'You must confirm that you have read and understood the privacy policy',
      },
      { field: 'user_email', error: 'You must enter an email address' },
    ],
    previousFormValues: {},
  };
  beforeEach(() => {
    fetchEntry.mockReturnValue(grantDetail);
  });
  const component = <Signup grantDetail={grantDetail} />;

  it('should display an error summary box at the top of the screen', () => {
    render(component);
    expect(screen.getByText('There is a problem')).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'You must enter an email address' }),
    ).toBeDefined();
    expect(
      screen.getByRole('link', {
        name: 'You must confirm that you have read and understood the privacy policy',
      }),
    ).toBeDefined();
  });

  it('should display an error above the checkbox field', () => {
    render(component);
    const specificErrorMessage = screen.getAllByTestId(
      'specific-error-message',
    );
    expect(specificErrorMessage).toBeDefined();
    expect(specificErrorMessage.length).toBe(2);
  });

  it('should display an error above the email field', () => {
    render(component);
    const errorId = screen.getAllByTestId('specific-error-message');

    expect(errorId).toBeDefined();
    expect(errorId.length).toBe(2);
    expect(
      screen.getByRole('textbox', { name: 'Enter your email address' }),
    ).toHaveClass('govuk-input--error');
  });

  it('should have a red border', () => {
    render(component);
    expect(screen.getByTestId('red-banner')).toHaveClass(
      'govuk-form-group--error',
    );
  });
});

describe('getServerSideProps', () => {
  const grantDetail = {
    props: {
      grantDetail: {
        fields: {
          grantName:
            'Chargepoint Grant for people renting and living in flats (1) ',
          label: 'Chargepoint Grant 2',
        },
        sys: {
          id: 'id',
        },
        errors: [],
        previousFormValues: {},
      },
    },
  };

  beforeEach(() => {
    fetchEntry.mockReturnValue(grantDetail);
    process.env.ONE_LOGIN_ENABLED = 'false';
  });

  it('should redirect to the 404 page if no grant ID is provided', async () => {
    const request = {
      query: {
        id: undefined,
      },
    };

    const props = await getServerSideProps(request);

    expect(props).toEqual({
      redirect: {
        permanent: false,
        destination: '/static/page-not-found',
      },
    });
  });

  it('should return grant details without errors on initial load', async () => {
    const request = {
      query: {
        id: 'a-grant-id',
        grantLabel: 'a-grant-label',
      },
    };

    const props = await getServerSideProps(request);

    expect(props).toEqual(grantDetail);
  });

  it('should call subscription api and redirect to manage notifications when one login is enabled', async () => {
    process.env.ONE_LOGIN_ENABLED = 'true';
    const request = {
      query: {
        id: 'a-grant-id',
        grantLabel: 'a-grant-label',
      },
    };
    client.post.mockResolvedValue({});

    const props = await getServerSideProps(request);

    expect(client.post).toHaveBeenCalledTimes(1);
    expect(props).toEqual({
      redirect: {
        destination:
          '/notifications/manage-notifications?action=subscribe&grantId=a-grant-id',
        permanent: false,
      },
    });
  });

  it('should return errors in the props with previous form values if validation failed', async () => {
    const previousFormValues = {
      user_email: 'a-bad-email',
    };

    const error = JSON.stringify({
      field: 'user_email',
      error: 'You must enter an email address',
    });

    const errors = [error];

    const request = {
      query: {
        id: 'a-grant-id',
        grantLabel: 'a-grant-label',
        previousFormValues,
        'errors[]': errors,
      },
    };

    const expectedResponse = {
      ...grantDetail,
    };
    expectedResponse.props.grantDetail.errors = errors;
    expectedResponse.props.grantDetail.previousFormValues = previousFormValues;

    const props = await getServerSideProps(request);

    expect(props).toEqual(expectedResponse);
  });

  it('should return errors in the props if errors in request is not an array after validation fails', async () => {
    const previousFormValues = {
      user_email: 'a-bad-email',
    };

    const errors = JSON.stringify({
      field: 'user_email',
      error: 'You must enter an email address',
    });

    const request = {
      query: {
        id: 'a-grant-id',
        grantLabel: 'a-grant-label',
        previousFormValues,
        'errors[]': errors,
      },
    };

    const expectedResponse = {
      ...grantDetail,
    };
    expectedResponse.props.grantDetail.errors = errors;
    expectedResponse.props.grantDetail.previousFormValues = previousFormValues;

    const props = await getServerSideProps(request);

    expect(props).toEqual(expectedResponse);
  });
});
