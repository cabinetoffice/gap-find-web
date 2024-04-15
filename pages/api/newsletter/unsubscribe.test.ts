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
import { getJwtFromCookies } from '../../../src/utils';

jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    utils: { addErrorInfo: (err) => err },
  },
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
  const mockGetJwtFromCookies = getJwtFromCookies as jest.Mock;
  const mockDecrypt = decrypt as jest.Mock;
  const mockNewsletterService = {
    getByEmailAndNewsletterType: jest.fn(),
    getBySubAndNewsletterType: jest.fn(),
    subscribeToNewsletter: jest.fn(),
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

  describe('One Login disabled', () => {
    it('should remove a newsletter subscription then redirect', async () => {
      const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
      process.env.ONE_LOGIN_ENABLED = 'false';
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
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(
        1,
      );
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith({
        plaintextEmail: decryptedEmail,
        sub: null,
        type: NewsletterType.NEW_GRANTS,
      });
      expect(res.redirect).toBeCalledTimes(1);
      expect(res.redirect).toBeCalledWith(expectedUrl);
      process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
    });

    it('should log a console error if newsletter unsubscribe fails and continue to redirect', async () => {
      const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
      process.env.ONE_LOGIN_ENABLED = 'false';
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
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(
        1,
      );
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith({
        plaintextEmail: decryptedEmail,
        sub: null,
        type: NewsletterType.NEW_GRANTS,
      });
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        'error unsubscribing from newsletter',
        error,
      );
      expect(res.redirect).toBeCalledTimes(1);
      expect(res.redirect).toBeCalledWith(expectedUrl);
      process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
    });

    it('should redirect to the login page if the user is not authenticated', async () => {
      const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
      process.env.ONE_LOGIN_ENABLED = 'false';
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
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(
        0,
      );
      expect(res.redirect).toBeCalledTimes(0);
      process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
    });
  });

  describe('One Login enabled', () => {
    it('should remove a newsletter subscription then redirect', async () => {
      const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
      process.env.ONE_LOGIN_ENABLED = 'true';
      newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
      const email = 'test@email.com';
      const sub = 'sub';
      mockGetJwtFromCookies.mockReturnValue({
        jwtPayload: {
          email,
          sub,
        },
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
      expect(mockGetJwtFromCookies).toBeCalledTimes(1);
      expect(mockGetJwtFromCookies).toBeCalledWith(req);
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(
        1,
      );
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith({
        plaintextEmail: email,
        sub,
        type: NewsletterType.NEW_GRANTS,
      });
      expect(res.redirect).toBeCalledTimes(1);
      expect(res.redirect).toBeCalledWith(expectedUrl);
      process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
    });

    it('should log a console error if newsletter unsubscribe fails and continue to redirect', async () => {
      const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
      process.env.ONE_LOGIN_ENABLED = 'true';
      const error = new Error('failed');
      newsletterSubscriptionServiceSpy.mockReturnValue(mockNewsletterService);
      const email = 'test@email.com';
      const sub = 'sub';
      mockGetJwtFromCookies.mockReturnValue({
        jwtPayload: {
          email,
          sub,
        },
      });
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
      expect(mockGetJwtFromCookies).toBeCalledTimes(1);
      expect(mockGetJwtFromCookies).toBeCalledWith(req);
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledTimes(
        1,
      );
      expect(mockNewsletterService.unsubscribeFromNewsletter).toBeCalledWith({
        plaintextEmail: email,
        sub,
        type: NewsletterType.NEW_GRANTS,
      });
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        'error unsubscribing from newsletter',
        error,
      );
      expect(res.redirect).toBeCalledTimes(1);
      expect(res.redirect).toBeCalledWith(expectedUrl);
      process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
    });
  });
});
