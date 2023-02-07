import handler from '../../../pages/api/notification-signup/[token]';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { notificationRoutes } from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';
import nookies from 'nookies';

jest.mock('next/config', () => {
  return jest.fn().mockImplementation(() => {
    return { serverRuntimeConfig: {} };
  });
});

jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/encryption');
jest.mock('nookies');

const req = {
  query: {
    token: 'A test token',
  },
  cookies: {},
};

const res = {
  redirect: jest.fn(),
};

const tokenValues = {
  encrypted_email_address: 'test@test.com',
  grant_title: 'Test Grant',
  contentful_grant_subscription_id: '12345678',
};
describe('handler function for the deletion or subscriptions', () => {
  const mockDestroy = jest.fn();
  const mockSet = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();
    res.redirect = jest.fn();
    nookies.destroy.mockImplementation(mockDestroy);
    nookies.set.mockImplementation(mockSet);
  });
  it('should work as expected given a correct request', async () => {
    const subscriptionServiceMock = jest
      .spyOn(SubscriptionService.prototype, 'addSubscription')
      .mockImplementationOnce(() => {
        return true;
      });

    decryptSignedApiKey.mockReturnValue(tokenValues);
    decrypt.mockReturnValue('test-mail');

    await handler(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      new URL(
        `${notificationRoutes['manageNotifications']}?grantId=${tokenValues.contentful_grant_subscription_id}&action=subscribe`,
        process.env.HOST
      ).toString()
    );
    expect(subscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(subscriptionServiceMock).toHaveBeenCalledWith(
      'test-mail',
      '12345678'
    );
    expect(nookies.set).toHaveBeenCalledTimes(1);
    expect(nookies.destroy).toHaveBeenCalledTimes(1);
  });
});
