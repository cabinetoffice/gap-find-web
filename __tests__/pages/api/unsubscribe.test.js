import handler from '../../../pages/api/unsubscribe-subscription';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { notificationRoutes } from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';
import { hash } from '../../../src/utils/hash';

jest.mock('../../../src/utils/encryption');
jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/hash');
jest.mock('../../../src/utils/jwt', () => ({
  getJwtFromCookies: jest.fn(() => ({
    jwtPayload: { sub: '1234' },
    jwt: 'a.b.c',
  })),
}));

const req = {
  body: {
    email: 'test@test.com',
    grantId: '12345678',
  },
  cookies: {},
};
describe('handler function for the deletion or subscriptions', () => {
  let res = {};
  beforeEach(async () => {
    jest.resetAllMocks();
    res.redirect = jest.fn();
    process.env.ONE_LOGIN_ENABLED = 'false';
  });
  it('should redirect to the manage notifications page when a record is deleted', async () => {
    const encryptedEmail = 'test-encrypted-email-string';
    const decryptedEmail = 'test-decrypted-email-string';

    decrypt.mockResolvedValue(decryptedEmail);
    const subscriptionServiceMock = jest
      .spyOn(
        SubscriptionService.prototype,
        'deleteSubscriptionByEmailOrSubAndGrantId',
      )
      .mockImplementationOnce(() => {
        return 'success';
      });
    decryptSignedApiKey.mockReturnValue({
      email: encryptedEmail,
    });
    hash.mockReturnValue(decryptedEmail);

    req.cookies = { currentEmailAddress: 'hello there' };

    await handler(req, res);

    expect(decrypt).toHaveBeenCalledTimes(1);
    expect(decrypt).toHaveBeenCalledWith(encryptedEmail);
    expect(subscriptionServiceMock).toHaveBeenCalledTimes(1);
    expect(subscriptionServiceMock).toHaveBeenCalledWith({
      emailAddress: decryptedEmail,
      grantId: '12345678',
    });
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      new URL(
        `${notificationRoutes['manageNotifications']}?grantId=${req.body.grantId}&action=unsubscribe`,
        process.env.HOST,
      ).toString(),
    );
  });

  it('should redirect to the check email page when a cookie is not set', async () => {
    req.cookies = {};

    const result = await handler(req, res);

    expect(result).toStrictEqual({
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    });
  });
});
