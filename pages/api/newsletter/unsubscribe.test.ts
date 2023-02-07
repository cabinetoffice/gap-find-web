import * as apikeyservice from '../../../src/service/api-key-service';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../../src/types/newsletter';
import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';
import subject from './unsubscribe';
jest.mock('../../../src/utils/encryption');

describe('newsletter unsubscribe api', () => {
  const newsletterSubscriptionServiceSpy = jest.spyOn(
    NewsletterSubscriptionService,
    'getInstance'
  );
  const apiKeyServiceSpy = jest.spyOn(apikeyservice, 'decryptSignedApiKey');
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
    process.env.HOST
  ).toString();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should remove a newsletter subscription then redirect', async () => {
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    apiKeyServiceSpy.mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);

    const req = {
      cookies: {
        [cookieName.currentEmailAddress]: cookie,
      },
    };

    const res = {
      redirect: jest.fn(),
    };
    await subject(req as any, res as any);

    expect(newsletterSubscriptionServiceSpy).toBeCalledTimes(1);
    expect(apiKeyServiceSpy).toBeCalledTimes(1);
    expect(apiKeyServiceSpy).toBeCalledWith(cookie);
    expect(mockDecrypt).toBeCalledTimes(1);
    expect(mockDecrypt).toBeCalledWith(encryptedEmail);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(1);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith(
      decryptedEmail, NewsletterType.NEW_GRANTS
    );
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith(expectedUrl);
  });

  it('should log a console error if newsletter unsubscrube fails and continue to redirect', async () => {
    const error = new Error('failed');
    const consoleSpy = jest.spyOn(global.console, 'error').mockImplementation();
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    apiKeyServiceSpy.mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);
    mockNewsletterService.unsubscribeFromNewsletter.mockImplementation(() => {
      throw error;
    });

    const req = {
      cookies: {
        [cookieName.currentEmailAddress]: cookie,
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    await subject(req as any, res as any);

    expect(newsletterSubscriptionServiceSpy).toBeCalledTimes(1);
    expect(apiKeyServiceSpy).toBeCalledTimes(1);
    expect(apiKeyServiceSpy).toBeCalledWith(cookie);
    expect(mockDecrypt).toBeCalledTimes(1);
    expect(mockDecrypt).toBeCalledWith(encryptedEmail);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(1);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith(
      decryptedEmail, NewsletterType.NEW_GRANTS
    );
    expect(consoleSpy).toBeCalledTimes(1);
    expect(consoleSpy).toBeCalledWith(error);
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith(expectedUrl);
  });

  it("should redirect to the login page if the user is not authenticated", async () => {
    newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
    apiKeyServiceSpy.mockReturnValue(cookie);
    mockDecrypt.mockResolvedValue(decryptedEmail);

    const req = {
      cookies: {},
    };

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
    expect(apiKeyServiceSpy).toBeCalledTimes(0);
    expect(mockDecrypt).toBeCalledTimes(0);
    expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(0);
    expect(res.redirect).toBeCalledTimes(0);

  })
});
