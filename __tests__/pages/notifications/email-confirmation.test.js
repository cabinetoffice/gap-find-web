import { render, screen } from '@testing-library/react';
import EmailConfirmation, {
  getServerSideProps,
} from '../../../pages/notifications/email-confirmation';
import { sendEmail } from '../../../src/service/gov_notify_service';
import cookieExistsAndContainsValidJwt from '../../../src/utils/cookieAndJwtChecker';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { notificationRoutes } from '../../../src/utils/constants';
import { generateSignedApiKey } from '../../../src/service/api-key-service';
import { encrypt } from '../../../src/utils/encryption';

jest.mock('../../../src/utils/encryption');

const encryptedEmail = 'test-encrypted-email-string';

jest.mock('next/config', () =>
  jest.fn().mockImplementation(() => ({
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},
  })),
);

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
  };
});

jest.mock('../../../src/service/gov_notify_service');
jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/cookieAndJwtChecker');

describe('Testing email-confirmation component', () => {
  const pushMock = jest.fn();
  beforeAll(async () => {
    nookies.get.mockReturnValue({
      currentEmailAddress: 'test@test.com',
    });
    useRouter.mockReturnValue({
      pathname: 'test',
      push: pushMock,
    });
    encrypt.mockResolvedValue(encryptedEmail);
  });

  it('renders at email-confirmation heading', async () => {
    const { props } = await getServerSideProps({ query: {} });
    render(<EmailConfirmation {...props} />);
    const heading = screen.getAllByText(/Check your email/);
    // 1 for breadcrumb and 1 for main heading
    expect(heading).toHaveLength(2);
  });

  it('renders at email-confirmation content with email address from cookies', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(false);

    let props = {
      email: 'test@test.com',
    };

    render(<EmailConfirmation {...props} />);
    const heading = screen.getAllByText(/We’ve sent an email to test@test.com/);
    expect(heading).toHaveLength(1);
  });

  it('renders at email-confirmation content with  no email address from cookies', async () => {
    nookies.get.mockReturnValue({ currentEmailAddress: '{}' });
    const { props } = await getServerSideProps({ query: {} });
    render(<EmailConfirmation {...props} />);
    const heading = screen.getAllByText(/We’ve sent an email to/);
    expect(heading).toHaveLength(1);
  });
});

describe('getServerSideProps', () => {
  it('should redirect out if cookie exists', async () => {
    cookieExistsAndContainsValidJwt.mockReturnValue(true);

    const response = await getServerSideProps();

    expect(response).toEqual({
      redirect: {
        permanent: false,
        destination: notificationRoutes['manageNotifications'],
      },
    });
  });

  it('should redirect if email address is not present in request', async () => {
    const ctx = {
      query: {},
    };

    cookieExistsAndContainsValidJwt.mockReturnValue(false);

    const response = await getServerSideProps(ctx);

    expect(response).toEqual({
      redirect: {
        permanemt: false,
        destination:
          '/notifications/check-email?errors[]={"field":"email","error":"You must enter an email address."}&email=undefined',
      },
    });
  });

  it('should redirect if email address is badly formatted', async () => {
    const ctx = {
      query: {
        email: 'badly-formatted-email',
      },
    };

    cookieExistsAndContainsValidJwt.mockReturnValue(false);

    const response = await getServerSideProps(ctx);

    expect(response).toEqual({
      redirect: {
        permanemt: false,
        destination:
          '/notifications/check-email?errors[]={"field":"email","error":"Enter an email address in the correct format, like name@example.com"}&email=badly-formatted-email',
      },
    });
  });

  it('should send a confirmation email', async () => {
    const email = 'email@email.com';
    const ctx = {
      query: {
        email: email,
      },
    };

    const expectedPersonalisation = {
      'confirmation link': `${process.env.HOST}${notificationRoutes['confirmSubscription']}/a-signed-api-key`,
    };

    cookieExistsAndContainsValidJwt.mockReturnValue(false);
    generateSignedApiKey.mockReturnValue('a-signed-api-key');

    const response = await getServerSideProps(ctx);

    expect(sendEmail).toHaveBeenCalledWith(
      email,
      expectedPersonalisation,
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_TEMPLATE_UNSUBSCRIBE,
    );
    expect(response).toEqual({
      props: {
        email,
      },
    });
  });
});
