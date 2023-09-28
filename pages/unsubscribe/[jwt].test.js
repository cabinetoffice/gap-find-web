import { AxiosError } from 'axios';
import { decryptSignedApiKey } from '../../src/service/api-key-service';
import { NewsletterSubscriptionService } from '../../src/service/newsletter/newsletter-subscription-service';
import { getServerSideProps } from './[jwt].page';
import { TokenExpiredError } from 'jsonwebtoken';
import { SubscriptionService } from '../../src/service/subscription-service';
import { deleteSaveSearch } from '../../src/service/saved_search_service';

jest.mock('../service-error/index.page', () => ({
  default: () => <p>ServiceErrorPage</p>,
}));
jest.mock('../../src/service/api-key-service', () => ({
  decryptSignedApiKey: jest.fn(),
}));
jest.mock('../../src/utils/encryption', () => ({
  decrypt: jest.fn(),
}));
jest.mock('../../src/service/saved_search_service');

const newsletterSubscriptionServiceSpy = ({ throwsError }) =>
  jest
    .spyOn(NewsletterSubscriptionService, 'getInstance')
    .mockImplementation(() => ({
      unsubscribeFromNewsletter: () => {
        if (throwsError) {
          throw new AxiosError();
        } else {
          return Promise.resolve();
        }
      },
      getByEmailAndNewsletterType: undefined,
    }));

const grantSubscriptionSpy = ({ throwsError }) =>
  jest.spyOn(SubscriptionService, 'getInstance').mockImplementation(() => ({
    addSubscription: null,
    getSubscriptionByEmailAndGrantId: null,
    getSubscriptionsByEmail: null,
    deleteSubscriptionByEmailAndGrantId: async () => {
      if (throwsError) {
        throw new AxiosError();
      } else {
        return Promise.resolve();
      }
    },
  }));

const mockSavedSearch = ({ throwsError }) => {
  deleteSaveSearch.mockImplementation(() => {
    if (throwsError) {
      throw new AxiosError();
    } else {
      return Promise.resolve();
    }
  });
};

const getContext = ({ jwt }) => ({
  query: {
    jwt,
  },
});

describe('getServerSideProps()', () => {
  beforeEach(jest.clearAllMocks);

  it('should return error when jwt has expired', async () => {
    decryptSignedApiKey.mockImplementation(() => {
      throw new TokenExpiredError();
    });
    const context = getContext({ jwt: 'invalid-jwt' });
    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        error: true,
      },
    });
  });

  it.each`
    type                    | mockServiceFunction                 | mockServiceThrowsError
    ${'NEWSLETTER'}         | ${newsletterSubscriptionServiceSpy} | ${true}
    ${'GRANT_SUBSCRIPTION'} | ${grantSubscriptionSpy}             | ${true}
    ${'SAVED_SEARCH'}       | ${mockSavedSearch}                  | ${true}
    ${'NEWSLETTER'}         | ${newsletterSubscriptionServiceSpy} | ${false}
    ${'GRANT_SUBSCRIPTION'} | ${grantSubscriptionSpy}             | ${false}
    ${'SAVED_SEARCH'}       | ${mockSavedSearch}                  | ${false}
  `(
    'should return correct props when jwt is valid and $type mock service is called with throwsError: $mockServiceThrowsError',
    async ({ type, mockServiceFunction, mockServiceThrowsError }) => {
      decryptSignedApiKey.mockReturnValue({
        id: 'some-id',
        type,
        emailAddress: 'some-email',
      });
      const context = getContext({ jwt: 'valid.jwt.token' });
      mockServiceFunction({ throwsError: mockServiceThrowsError });
      const response = await getServerSideProps(context);

      expect(response).toEqual(
        mockServiceThrowsError
          ? {
              props: {
                error: true,
              },
            }
          : undefined
      );
    }
  );
});
