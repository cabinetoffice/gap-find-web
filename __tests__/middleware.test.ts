import { middleware } from '../middleware';
import { NextRequest } from 'next/server';
import { checkUserLoggedIn } from '../src/service';
import { getJwtFromMiddlewareCookies } from '../src/utils';
import {
  LOGIN_NOTICE_TYPES,
  newsletterRoutes,
  notificationRoutes,
} from '../src/utils/constants';

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
const APPLICANT_HOST = process.env.APPLICANT_HOST;

const expiringSoon = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt.toISOString();
};

const buildRequest = (path: string, method = 'GET') => {
  const req = new NextRequest(new Request(`${HOST}${path}`, { method }));
  req.cookies.set(process.env.USER_TOKEN_NAME!, 'token');
  return req;
};

// NextResponse.next() sets this header; a redirect doesn't
const isPassedThrough = (res: Response) =>
  res.headers.get('x-middleware-next') === '1';

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
  describe('routes that act on the signed-in user', () => {
    const protectedRoutes = [
      ['POST', notificationRoutes.unsubscribeApi],
      ['POST', newsletterRoutes.unsubscribeApi],
      ['POST', `${notificationRoutes.deleteSaveSearch}/123`],
      ['GET', `${notificationRoutes.deleteSaveSearch}/123`],
      ['GET', `${notificationRoutes.unsubscribe}/grant-id`],
    ];

    it.each(protectedRoutes)(
      'rejects a forged token on %s %s',
      async (method, path) => {
        mockedGetJwt.mockReturnValue({
          jwtPayload: { sub: 'victim', email: 'victim@example.com' },
          jwt: 'forged',
        });
        mockedCheckUserLoggedIn.mockResolvedValueOnce(false);

        const res = await middleware(buildRequest(path, method));

        expect(mockedCheckUserLoggedIn).toHaveBeenCalledWith('forged');
        expect(isPassedThrough(res)).toBe(false);
        expect(res.headers.get('Location')).toBe(APPLICANT_HOST);
      },
    );

    it.each(protectedRoutes)(
      'lets a valid token through on %s %s',
      async (method, path) => {
        mockedGetJwt.mockReturnValue({
          jwtPayload: { sub: 'user', expiresAt: '2999-01-01T00:00:00Z' },
          jwt: 'a.b.c',
        });
        mockedCheckUserLoggedIn.mockResolvedValueOnce(true);

        const res = await middleware(buildRequest(path, method));

        expect(isPassedThrough(res)).toBe(true);
      },
    );

    it('redirects a rejected form post with 303 so the browser follows it with a GET', async () => {
      mockedCheckUserLoggedIn.mockResolvedValueOnce(false);

      const res = await middleware(
        buildRequest(notificationRoutes.unsubscribeApi, 'POST'),
      );

      expect(res.status).toBe(303);
    });

    it('keeps the 307 redirect for a rejected page load', async () => {
      mockedCheckUserLoggedIn.mockResolvedValueOnce(false);

      const res = await middleware(
        buildRequest(notificationRoutes.manageNotifications),
      );

      expect(res.status).toBe(307);
    });

    it('lets a form post with a valid token that expires soon through, without the refresh redirect', async () => {
      mockedGetJwt.mockReturnValue({
        jwtPayload: { expiresAt: expiringSoon() },
        jwt: 'a.b.c',
      });
      mockedCheckUserLoggedIn.mockResolvedValueOnce(true);

      const res = await middleware(
        buildRequest(notificationRoutes.unsubscribeApi, 'POST'),
      );

      expect(isPassedThrough(res)).toBe(true);
    });

    it('still sends a page load with a token that expires soon to refresh it', async () => {
      mockedGetJwt.mockReturnValue({
        jwtPayload: { expiresAt: expiringSoon() },
        jwt: 'a.b.c',
      });
      mockedCheckUserLoggedIn.mockResolvedValueOnce(true);
      const path = notificationRoutes.manageNotifications;

      const res = await middleware(buildRequest(path));

      expect(res.headers.get('Location')).toBe(
        `${USER_SERVICE_HOST}/refresh-token?redirectUrl=${HOST}${path}`,
      );
    });

    it('does not check the token on public pages', async () => {
      const res = await middleware(buildRequest('/grants'));

      expect(mockedCheckUserLoggedIn).not.toHaveBeenCalled();
      expect(isPassedThrough(res)).toBe(true);
    });
  });
});
