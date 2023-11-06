import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import CheckEmail, {
  getServerSideProps,
} from '../../../pages/notifications/check-email';
import { notificationRoutes } from '../../../src/utils/constants';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));
jest.mock('nookies', () => ({
  get: jest.fn(),
  set: jest.fn(),
  destroy: jest.fn(),
}));
jest.mock('../../../src/utils/cookieAndJwtChecker');

const mockQuery = {
  'email-address': 'test@gmail.com',
};

describe('Testing check-email component', () => {
  const pushMock = jest.fn();
  beforeAll(async () => {
    nookies.get.mockReturnValue({
      currentEmailAddress:
        '{"emailAddress":"test@gmail.com","isEmailConfirmed":true}',
    });
    useRouter.mockReturnValue({
      pathname: 'test',
      push: pushMock,
    });
  });

  it('renders at CheckEmail heading', async () => {
    const { props } = await getServerSideProps({ query: {} });
    render(<CheckEmail {...props} />);
    const heading = screen.getAllByText(
      /Manage notifications and saved searches/,
    );
    expect(heading).toHaveLength(1);
  });

  it('renders at CheckEmail heading', async () => {
    const { props } = await getServerSideProps({ query: {} });
    render(<CheckEmail {...props} />);
    const heading = screen.getAllByText(
      /If you have signed up for updates or saved searches, you can unsubscribe here/,
    );
    expect(heading).toHaveLength(1);
  });

  it('should display an error summary box at the top of the screen', () => {
    const props = {
      errors: [
        {
          field: 'email',
          error: 'You must enter an email address',
        },
      ],
      previousValue: 'test',
    };
    render(<CheckEmail {...props} />);
    expect(screen.getByText('There is a problem')).toBeDefined();
    const errorMessage = screen.getAllByText('You must enter an email address');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.length).toBe(2);
  });

  it('should display an error above the email field', () => {
    const props = {
      errors: [
        {
          field: 'email',
          error: 'You must enter an email address',
        },
      ],
      previousValue: 'test',
    };
    render(<CheckEmail {...props} />);
    expect(screen.getByTestId('specific-error-message')).toBeDefined();
    expect(screen.getByTestId('email')).toHaveClass('govuk-input--error');
  });

  it('should have a red border', () => {
    const props = {
      errors: [
        {
          field: 'email',
          error: 'You must enter an email address',
        },
      ],
      previousValue: 'test',
    };
    render(<CheckEmail {...props} />);
    expect(screen.getByTestId('red-banner')).toHaveClass(
      'govuk-form-group--error',
    );
  });
});

describe('get server side props', () => {
  it('should return the props for the check email component if the email cookie has not been set', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);
    let result = await getServerSideProps({ query: mockQuery });
    expect(result).toStrictEqual({
      props: {
        errors: [],
        previousValue: '',
      },
    });
  });

  it('should return a redirect if the cookie checker finds the cookie', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);
    let result = await getServerSideProps({ query: mockQuery });
    expect(result).toStrictEqual({
      redirect: {
        permanent: false,
        destination: notificationRoutes['manageNotifications'],
      },
    });
  });

  it('should return errors in the props with previous form values if validation failed', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);
    const email = 'a-bad-email';

    const errors = JSON.stringify({
      field: 'email',
      error: 'You must enter an email address',
    });

    const request = {
      query: {
        id: 'a-grant-id',
        grantLabel: 'a-grant-label',
        email,
        'errors[]': errors,
      },
    };

    const props = await getServerSideProps(request);

    const expectedResponse = {
      props: {
        errors: [
          {
            field: 'email',
            error: 'You must enter an email address',
          },
        ],
        previousValue: email,
      },
    };

    expect(props).toEqual(expectedResponse);
  });
});
