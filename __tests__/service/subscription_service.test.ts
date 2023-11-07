import { SubscriptionService } from '../../src/service/subscription-service';
import body from './subscriptionManager.data';
import { axios } from '../../src/utils/axios';

jest.mock('jsonwebtoken');

jest.mock('../../src/utils/axios', () => {
  const createMock = {
    post: jest.fn().mockImplementation(() => {
      return {
        data: true,
      };
    }),
    delete: jest.fn().mockImplementation(() => {
      return {
        data: true,
      };
    }),
    get: jest.fn().mockImplementation(() => {
      return {
        data: [
          {
            encrypted_email_address: 'test@test.com',
            hashed_email_address: 'test@test.com',
            contentful_grant_subscription_id: '12345678',
            createdAt: 'now',
            updatedAt: 'now',
          },
        ],
      };
    }),
    getUri: jest.fn(),
    defaults: jest.fn(),
    request: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    and: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
  };
  return {
    axios: {
      create: jest.fn().mockImplementation(() => {
        return createMock;
      }),
    },
  };
});

jest.mock('next/config', () => {
  return jest.fn().mockImplementation(() => {
    return { serverRuntimeConfig: {} };
  });
});
const subscriptionService = SubscriptionService.getInstance();
const instance = axios.create();

describe('subscription manager add subscription', () => {
  it('should return true when a correct email and grant id are passed in', async () => {
    const result = await subscriptionService.addSubscription({
      emailAddress: body.encrypted_email_address,
      grantId: body.contentful_grant_subscription_id,
    });
    expect(result).toBe(true);
    expect(instance.post).toHaveBeenNthCalledWith(1, ' ', {
      emailAddress: body.encrypted_email_address,
      contentfulGrantSubscriptionId: body.contentful_grant_subscription_id,
    });
  });
});

describe('subscription manager delete Subscription By ID', () => {
  it('should delete a subscription when correct values are passed into the function', async () => {
    const result =
      await subscriptionService.deleteSubscriptionByEmailOrSubAndGrantId({
        emailAddress: body.encrypted_email_address,
        grantId: body.contentful_grant_subscription_id,
      });

    expect(instance.delete).toHaveBeenNthCalledWith(
      1,
      'users/fake%40fake.com/grants/12345678?unsubscribeReference=undefined',
    );
    expect(result).toBe(true);
  });
});

describe('subscription manager get Subscription By Email', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  it('should return records when they are found', async () => {
    const example = [
      {
        encrypted_email_address: 'test@test.com',
        hashed_email_address: 'test@test.com',
        contentful_grant_subscription_id: '12345678',
        createdAt: 'now',
        updatedAt: 'now',
      },
    ];

    const result = await subscriptionService.getSubscriptionsByEmail(
      'test@test.com',
      'jwt',
    );

    expect(result).toEqual(example);

    expect(instance.get).toHaveBeenNthCalledWith(1, 'users/test%40test.com', {
      withCredentials: true,
      headers: {
        Cookie: `user-service-token=jwt;`,
      },
    });
  });

  it('should return an empty object if no records are found', async () => {
    (instance as any).get.mockImplementation(() => {
      return {
        data: {},
      };
    });
    expect(
      await subscriptionService.getSubscriptionsByEmail('test@test.com', 'jwt'),
    ).toEqual({});
    expect(instance.get).toHaveBeenNthCalledWith(1, 'users/test%40test.com', {
      withCredentials: true,
      headers: {
        Cookie: `user-service-token=jwt;`,
      },
    });
  });
});

describe('subscription manager get Subscription By Email and ID', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  it('should return emails if any are found', async () => {
    const example = {
      encrypted_email_address: 'test@test.com',
      hashed_email_address: 'test@test.com',
      contentful_grant_subscription_id: '12345678',
      createdAt: 'now',
      updatedAt: 'now',
    };
    (instance as any).get.mockImplementation(() => {
      return {
        data: example,
      };
    });
    expect(
      await subscriptionService.getSubscriptionByEmailAndGrantId(
        'test@test.com',
        '12345678',
      ),
    ).toEqual(example);
    expect(instance.get).toHaveBeenNthCalledWith(
      1,
      'users/test%40test.com/grants/12345678',
    );
  });

  it('should return an empty object if no records are found', async () => {
    (instance as any).get.mockImplementation(() => {
      return {
        data: {},
      };
    });
    expect(
      await subscriptionService.getSubscriptionByEmailAndGrantId(
        'test@test.com',
        '12345678',
      ),
    ).toEqual({});
    expect(instance.get).toHaveBeenNthCalledWith(
      1,
      'users/test%40test.com/grants/12345678',
    );
  });
});
