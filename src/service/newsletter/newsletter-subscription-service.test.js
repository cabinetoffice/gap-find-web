import { NewsletterSubscriptionService } from './newsletter-subscription-service';
import { NewsletterType } from '../../types/newsletter';
import { axios } from '../../../src/utils/axios';

jest.mock('../../../src/utils/axios', () => {
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
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    axios: {
      create: jest.fn().mockImplementation(() => {
        return createMock;
      }),
    },
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
          'jwt',
        );

      expect(spy).toHaveBeenCalledWith(email);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/users/${encodedEmail}/types/${newsletterType}`,
        {
          withCredentials: true,
          headers: {
            Cookie: `user-service-token=jwt;`,
          },
        },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('unsubscribeFromNewsletter', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should unsubscribe from the new grants newsletter', async () => {
      const email = 'email@email.com';
      await newsletterSubscriptionService.unsubscribeFromNewsletter({
        plaintextEmail: email,
        type: NewsletterType.NEW_GRANTS,
      });

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/users/${email}/types/${NewsletterType.NEW_GRANTS}`,
      );
    });

    it('should unsubscribe from the new grants newsletter', async () => {
      const email = 'email@email.com';
      const sub = 'sub';
      await newsletterSubscriptionService.unsubscribeFromNewsletter({
        plaintextEmail: email,
        type: NewsletterType.NEW_GRANTS,
        sub,
      });

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/users/${sub}/types/${NewsletterType.NEW_GRANTS}`,
      );
    });

    it('should unsubscribe from the new grants newsletter', async () => {
      const email = 'email@email.com';
      const sub = 'sub';
      const unsubscribeReferenceId = 'unsubscribeReferenceId';
      await newsletterSubscriptionService.unsubscribeFromNewsletter({
        plaintextEmail: email,
        type: NewsletterType.NEW_GRANTS,
        sub,
        unsubscribeReferenceId,
      });

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/users/${sub}/types/${NewsletterType.NEW_GRANTS}?unsubscribeReference=${unsubscribeReferenceId}`,
      );
    });
  });
});
