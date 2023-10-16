import { middleware } from '../middleware';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { checkUserLoggedIn } from '../src/service';
import {
  getJwtFromCookies,
  LOGIN_NOTICE_TYPES,
  notificationRoutes,
} from '../src/utils';

jest.mock('../src/service');
jest.mock('../src/utils/jwt', () => ({
  getJwtFromCookies: jest.fn(() => ({ jwtPayload: {}, jwt: 'a.b.c' })),
}));

const mockedCheckUserLoggedIn = jest.mocked(checkUserLoggedIn);
const mockedGetJwt = jest.mocked(getJwtFromCookies);

const HOST = process.env.HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

describe('Middleware', () => {
  beforeEach(jest.clearAllMocks);

  describe('authentication', () => {
    const manageNotificationsUrl = `${HOST}${notificationRoutes.manageNotifications}`;
    const loginNoticeUrl = `${HOST}${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`;

    it('redirects to login notice if no JWT in cookies ', async () => {
      const req = new NextRequest(new Request(manageNotificationsUrl));
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(loginNoticeUrl);
    });

    it('redirects to login notice if JWT is not valid', async () => {
      mockedCheckUserLoggedIn.mockResolvedValueOnce(false);

      const req = new NextRequest(new Request(manageNotificationsUrl));
      req.cookies.set(process.env.USER_TOKEN_NAME, 'invalid');
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('Location')).toBe(loginNoticeUrl);
    });

    it('redirects to refresh URL if JWT is close to expiration', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes
      mockedGetJwt.mockResolvedValueOnce({
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
  });
});
