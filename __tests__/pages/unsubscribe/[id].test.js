import '@testing-library/jest-dom';
import { AxiosError } from 'axios';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { getServerSideProps } from '../../../pages/unsubscribe/[id]';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { deleteSaveSearch } from '../../../src/service/saved_search_service';
import { getUnsubscribeReferenceFromId } from '../../../src/service/unsubscribe.service';

jest.mock('../../../pages/service-error/index.page', () => ({
  default: () => <p>ServiceErrorPage</p>,
}));
jest.mock('../../../src/utils/encryption', () => ({
  decrypt: jest.fn(),
}));
jest.mock(
  '../../../src/service/newsletter/newsletter-subscription-service',
  () => ({
    NewsletterSubscriptionService: {
      getInstance: jest.fn(),
      unsubscribeFromNewsletter: jest.fn(),
    },
  }),
);
jest.mock('../../../src/service/subscription-service', () => ({
  SubscriptionService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../src/service/unsubscribe.service', () => ({
  getUnsubscribeReferenceFromId: jest.fn(),
  removeUnsubscribeReference: jest.fn(),
  getTypeFromNotificationIds: jest.requireActual(
    '../../../src/service/unsubscribe.service',
  ).getTypeFromNotificationIds,
}));
jest.mock('../../../src/service/saved_search_service');

const newsletterSubscriptionServiceSpy = ({ throwsError }) =>
  NewsletterSubscriptionService.getInstance.mockImplementation(() => ({
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
  SubscriptionService.getInstance.mockImplementation(() => ({
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

describe('getServerSideProps()', () => {
  beforeEach(jest.clearAllMocks);

  it('should return error when the token is invalid ', async () => {
    getUnsubscribeReferenceFromId.mockReturnValue(
      new AxiosError('Internal server error'),
    );

    const context = getContext({ id: 'invalid-id' });
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
    'should return correct props when id is valid and $type mock service is called with throwsError: $mockServiceThrowsError',
    async ({ type, mockServiceFunction, mockServiceThrowsError }) => {
      getUnsubscribeReferenceFromId.mockReturnValue(
        getMockUnsubscribeReferenceData(type),
      );
      const context = getContext({ jwt: 'valid.jwt.token' });
      mockServiceFunction({ throwsError: mockServiceThrowsError });
      const response = await getServerSideProps(context);
      expect(response).toEqual({
        props: {
          error: mockServiceThrowsError,
        },
      });
    },
  );
});

const getContext = ({ id }) => ({
  query: {
    id,
  },
});

const TEST_USER_DATA_MAP = {
  NEWSLETTER: {
    newsletterId: 'some-newsletter-id',
    subscriptionId: null,
    savedSearchId: null,
  },
  GRANT_SUBSCRIPTION: {
    newsletterId: null,
    subscriptionId: 'some-subscription-id',
    savedSearchId: null,
  },
  SAVED_SEARCH: {
    newsletterId: null,
    subscriptionId: null,
    savedSearchId: 'some-saved-search-id',
  },
};

const getMockUnsubscribeReferenceData = (type) => ({
  user: {
    encryptedEmailAddress: 'some-email',
    sub: 'sub',
  },
  ...TEST_USER_DATA_MAP[type],
});
