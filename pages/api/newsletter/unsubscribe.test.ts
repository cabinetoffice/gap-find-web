import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../../src/types/newsletter';
import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';
import subject from './unsubscribe';
import { logger } from '../../../src/utils/logger';

jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
  addErrorInfo: (err) => err,
}));

const createMockRequest = (requestData) => ({
  headers: {
    'tco-correlation-id': 'correlationId',
  },
  ...requestData,
});

describe('newsletter unsubscribe api', () => {
  const newsletterSubscriptionServiceSpy = jest.spyOn(
    NewsletterSubscriptionService,
    'getInstance',
  );
  const mockDecrypt = decrypt as jest.Mock;
  const mockNewsletterService = {
    getByEmailAndNewsletterType: jest.fn(),
    unsubscribeFromNewsletter: jest.fn(),
  };
  const encryptedEmail = 'encrypted-email-address';
  const decryptedEmail = 'decrypted-email-address';
  const cookie = { email: encryptedEmail };
  const expectedUrl = new URL(
    `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_UNSUBSCRIBE}`,
    process.env.HOST,
  ).toString();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should remove a newsletter subscription then redirect', async () => {
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    (decryptSignedApiKey as jest.Mock).mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);

    const req = createMockRequest({
      cookies: {
        [cookieName.currentEmailAddress]: cookie,
      },
    });

    const res = {
      redirect: jest.fn(),
    };
    await subject(req as any, res as any);

    expect(newsletterSubscriptionServiceSpy).toBeCalledTimes(1);
    expect(decryptSignedApiKey as jest.Mock).toBeCalledTimes(1);
    expect(decryptSignedApiKey as jest.Mock).toBeCalledWith(cookie);
    expect(mockDecrypt).toBeCalledTimes(1);
    expect(mockDecrypt).toBeCalledWith(encryptedEmail);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(1);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith(
      decryptedEmail,
      NewsletterType.NEW_GRANTS,
    );
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith(expectedUrl);
  });

  it('should log a console error if newsletter unsubscrube fails and continue to redirect', async () => {
    const error = new Error('failed');
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    (decryptSignedApiKey as jest.Mock).mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);
    mockNewsletterService.unsubscribeFromNewsletter.mockImplementation(() => {
      throw error;
    });

    const req = createMockRequest({
      cookies: {
        [cookieName.currentEmailAddress]: cookie,
      },
    });

    const res = {
      redirect: jest.fn(),
    };

    await subject(req as any, res as any);

    expect(newsletterSubscriptionServiceSpy).toBeCalledTimes(1);
    expect(decryptSignedApiKey as jest.Mock).toBeCalledTimes(1);
    expect(decryptSignedApiKey as jest.Mock).toBeCalledWith(cookie);
    expect(mockDecrypt).toBeCalledTimes(1);
    expect(mockDecrypt).toBeCalledWith(encryptedEmail);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(1);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith(
      decryptedEmail,
      NewsletterType.NEW_GRANTS,
    );
    expect(logger.error).toBeCalledTimes(1);
    expect(logger.error).toBeCalledWith(
      'error unsubscribing from newsletter',
      error,
    );
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith(expectedUrl);
  });

  it('should redirect to the login page if the user is not authenticated', async () => {
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    (decryptSignedApiKey as jest.Mock).mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);

    const req = createMockRequest({
      cookies: {},
    });

    const res = {
      redirect: jest.fn(),
    };

    const result = await subject(req as any, res as any);

    expect(result).toStrictEqual({
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    });
    expect(newsletterSubscriptionServiceSpy).toBeCalledTimes(1);
    expect(decryptSignedApiKey as jest.Mock).toBeCalledTimes(0);
    expect(mockDecrypt).toBeCalledTimes(0);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(0);
    expect(res.redirect).toBeCalledTimes(0);
  });
});
