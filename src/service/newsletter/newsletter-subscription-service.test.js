import { NewsletterSubscriptionService } from './newsletter-subscription-service';
import axios from 'axios';
import { NewsletterType } from '../../types/newsletter';

jest.mock('next/config', () => {
  return jest.fn().mockImplementation(() => {
    return { serverRuntimeConfig: {} };
  });
});

jest.mock('axios', () => {
  const createMock = {
    get: jest.fn().mockImplementation(() => {
      return {
        data: {
          id: 1,
          email: 'email@email.com',
          createdAt: 'a-date',
        },
      };
    }),

    delete: jest.fn(),
  };
  return {
    create: jest.fn().mockImplementation(() => {
      return createMock;
    }),
  };
});

let newsletterSubscriptionService = NewsletterSubscriptionService.getInstance();
let axiosInstance = axios.create();

describe('newsletter-subscription-service', () => {
  describe('getByEmailAndNewsletterType', () => {
    it('should return a newsletter subscription', async () => {
      const email = 'email@email.com';
      const encodedEmail = 'email%40email.com';
      const newsletterType = NewsletterType.NEW_GRANTS;

      const expectedResult = {
        id: 1,
        email: email,
        createdAt: 'a-date',
      };

      const spy = jest
        .spyOn(global, 'encodeURIComponent')
        .mockReturnValueOnce(encodedEmail);

      const result =
        await newsletterSubscriptionService.getByEmailAndNewsletterType(
          email,
          newsletterType,
        );

      expect(spy).toHaveBeenCalledWith(email);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/users/${encodedEmail}/types/${newsletterType}`,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('unsubscribeFromNewsletter', () => {
    it('should unsubscrube from the new grants newsletter', async () => {
      const email = 'email@email.com';
      await newsletterSubscriptionService.unsubscribeFromNewsletter(
        email,
        NewsletterType.NEW_GRANTS,
      );

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/users/${email}/types/${NewsletterType.NEW_GRANTS}`,
      );
    });
  });
});
