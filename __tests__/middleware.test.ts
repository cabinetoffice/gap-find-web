import { middleware } from '../middleware';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { checkUserLoggedIn } from '../src/service';
import { getJwtFromMiddlewareCookies } from '../src/utils';
import { LOGIN_NOTICE_TYPES, notificationRoutes } from '../src/utils/constants';

jest.mock('../src/service');
jest.mock('../src/utils/jwt', () => ({
  getJwtFromMiddlewareCookies: jest.fn(() => ({
    jwtPayload: {},
    jwt: 'a.b.c',
  })),
}));

const mockedCheckUserLoggedIn = jest.mocked(checkUserLoggedIn);
const mockedGetJwt = jest.mocked(getJwtFromMiddlewareCookies);

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ONE_LOGIN_ENABLED = 'true';
  });

  describe('authentication', () => {
    const manageNotificationsUrl = `${HOST}${notificationRoutes.manageNotifications}`;
    const subscriptionUrl = `${HOST}${notificationRoutes.subscriptionSignUp}`;
    const loginNoticeUrl = `${HOST}${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`;
    const subscriptionLoginNoticeUrl = `${HOST}${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS}`;

    it('redirects to login notice if no JWT in cookies ', async () => {
      process.env.ONE_LOGIN_ENABLED = 'true';

      const req = new NextRequest(new Request(manageNotificationsUrl));
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(loginNoticeUrl);
    });

    it('redirects to login notice if JWT is not valid', async () => {
      process.env.ONE_LOGIN_ENABLED = 'true';

      mockedCheckUserLoggedIn.mockResolvedValueOnce(false);

      const req = new NextRequest(new Request(manageNotificationsUrl));
      req.cookies.set(process.env.USER_TOKEN_NAME!, 'invalid');
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(loginNoticeUrl);
    });

    it('redirects to refresh URL if JWT is close to expiration', async () => {
      process.env.ONE_LOGIN_ENABLED = 'true';

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes
      mockedGetJwt.mockReturnValue({
        jwtPayload: {
          valid: true,
          expiresAt: expiresAt.toISOString(),
        },
        jwt: 'a.b.c',
      });
      mockedCheckUserLoggedIn.mockResolvedValueOnce(true);

      const req = new NextRequest(new Request(manageNotificationsUrl));
      req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(
        `${USER_SERVICE_HOST}/refresh-token?redirectUrl=${manageNotificationsUrl}`,
      );
    });

    it('redirects to subscription login notice if no JWT in cookies and url is subscription pattern ', async () => {
      process.env.ONE_LOGIN_ENABLED = 'true';

      const req = new NextRequest(new Request(subscriptionUrl));
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(subscriptionLoginNoticeUrl);
    });
  });
});
