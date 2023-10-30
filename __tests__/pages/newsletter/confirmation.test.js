import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import NewsletterConfirmation, {
  getServerSideProps,
} from '../../../pages/newsletter/confirmation';
import { validateSignupForm } from '../../../src/manager/signup_manager';
import { generateSignedApiKey } from '../../../src/service/api-key-service';
import { sendEmail } from '../../../src/service/gov_notify_service';
import { parseBody } from 'next/dist/server/api-utils/node';

jest.mock('next/dist/server/api-utils/node');

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

jest.mock('../../../src/service/gov_notify_service', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../../../src/manager/signup_manager', () => ({
  validateSignupForm: jest.fn(),
  generateSignupErrorsRedirectParam: jest.fn(),
}));
jest.mock('../../../src/service/api-key-service');

describe('Should Render Newsletter Confirmation Page', () => {
  beforeAll(() => {
    useRouter.mockReturnValue({
      route: '/',
      prefetch: jest.fn(() => Promise.resolve()),
      back: jest.fn(),
      push: jest.fn(),
      query: { page: '1' },
    });
  });

  const component = <NewsletterConfirmation signedUpEmail={'test@email.com'} />;

  it('Should use the generic signup component with correct values', () => {
    render(component);

    const returnLink = screen.getByText('Back to home');
    expect(returnLink).toBeDefined();
    expect(returnLink).toHaveAttribute('href', '/');

    expect(screen.getByTestId('email')).toHaveTextContent('test@email.com');
    expect(screen.getByTestId('signed_up_to_text')).toHaveTextContent(
      'new grants',
    );

    expect(screen.getByRole('heading', { name: 'Related link' })).toBeDefined();
  });
});

describe('getServerSideProps', () => {
  const req = {
    headers: {
      host: 'localhost:3000',
    },
    body: {
      user_email: 'test@email.com',
      notification_privacy: 'on',
    },
  };

  const res = {
    redirect: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    validateSignupForm.mockImplementation(() => []);
  });

  it('should validate the request', async () => {
    parseBody.mockResolvedValue(req.body);
    await getServerSideProps({ req, res });
    expect(validateSignupForm).toHaveBeenCalledTimes(1);
  });

  it('should redirect if request contains validation errors', async () => {
    validateSignupForm.mockImplementationOnce(() => [
      {
        field: 'test_field',
        error: 'This is a test error.',
      },
    ]);
    parseBody.mockResolvedValue(req.body);
    const result = await getServerSideProps({ req, res });

    expect(result).toHaveProperty('redirect');
  });

  it('should send a verification email', async () => {
    const keyValue = 'an-encrypted-jwt';
    generateSignedApiKey.mockReturnValue(keyValue);
    parseBody.mockResolvedValue(req.body);

    await getServerSideProps({ req, res });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      'test@email.com',
      {
        'Confirmation link for updates': new URL(
          `api/newsletter-signup/${keyValue}`,
          process.env.HOST,
        ).toString(),
      },
      process.env.GOV_NOTIFY_NOTIFICATION_EMAIL_NEWSLETTER_TEMPLATE,
    );
  });

  it('should handle any errors and continue', async () => {
    const keyValue = 'an-encrypted-jwt';
    generateSignedApiKey.mockReturnValue(keyValue);
    parseBody.mockResolvedValue(req.body);

    sendEmail.mockReturnValue(
      Promise.reject(new Error('something went wrong')),
    );

    const result = await getServerSideProps({ req, res });

    expect(sendEmail).rejects.toThrow(new Error('something went wrong'));
    expect(result).toEqual({
      props: {
        signedUpEmail: req.body.user_email,
      },
    });
  });

  it('should return correct props to frontend', async () => {
    parseBody.mockResolvedValue(req.body);
    const result = await getServerSideProps({ req, res });
    expect(result).toStrictEqual({
      props: { signedUpEmail: 'test@email.com' },
    });
  });
});
