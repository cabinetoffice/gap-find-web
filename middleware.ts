// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { v4 } from 'uuid';
import { checkUserLoggedIn } from './src/service';
import {
  HEADERS,
  notificationRoutes,
  LOGIN_NOTICE_TYPES,
  logger,
  getJwtFromCookies,
  addErrorInfo,
} from './src/utils';

const HOST = process.env.HOST;
const ONE_LOGIN_ENABLED = process.env.ONE_LOGIN_ENABLED;
const APPLICANT_HOST = process.env.APPLICANT_HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;
const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET;

const asObject = (entries: IterableIterator<[string, string]>) =>
  Array.from(entries)
    .filter(([key]) => key !== 'cookie')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as object);

const formatRequest = (req: NextRequest) => ({
  url: req.url,
  method: req.method,
  cookies: Array.from(req.cookies.values()).filter(
    (value) => !value.startsWith('user-service-token'),
  ),
  headers: asObject(req.headers.entries()),
});

const formatResponse = (res: NextResponse) => ({
  url: res.url,
  status: res.status,
  headers: asObject(res.headers.entries()),
});

const isWithinNumberOfMinsOfExpiry = (
  expiresAt: Date,
  numberOfMins: number,
) => {
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + numberOfMins);

  return expiresAt >= now && expiresAt <= nowPlusMins;
};

const manageNotificationsPattern = new URLPattern({
  pathname: notificationRoutes.manageNotifications,
});

export function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
  // @TODO: check if user is saving notification here -
  // if so, set data to be saved in cookie in response
  // note that if we get here, the user either isn't logged in
  // or needs to refresh their session, and will be redirected
  // away from the app before returning
  if (manageNotificationsPattern.test({ pathname: req.nextUrl.pathname })) {
    return NextResponse.redirect(
      `${HOST}${notificationRoutes.loginNotice}${LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS}`,
    );
  }
  return NextResponse.redirect(redirectUri);
}

const logRequest = (req: NextRequest) => {
  const correlationId = req.headers.get(HEADERS.CORRELATION_ID) || v4();
  logger.http('Incoming request', { ...formatRequest(req), correlationId });
  const res = NextResponse.next();
  logger.http('Outgoing response', { ...formatResponse(res), correlationId });
};

const authenticateRequest = async (req: NextRequest) => {
  try {
    const { jwt, jwtPayload } = getJwtFromCookies(
      req,
      USER_TOKEN_NAME,
      USER_TOKEN_SECRET,
    );
    const validJwtResponse = await checkUserLoggedIn(jwt);

    if (!validJwtResponse) {
      return buildMiddlewareResponse(req, APPLICANT_HOST);
    }

    const expiresAt = new Date(jwtPayload.expiresAt as string);
    if (isWithinNumberOfMinsOfExpiry(expiresAt, 30)) {
      return NextResponse.redirect(
        `${USER_SERVICE_HOST}/refresh-token?redirectUrl=${HOST}${req.nextUrl.pathname}`,
      );
    }
  } catch (err) {
    logger.error(err.message);
    logger.error('failed to authenticate request', addErrorInfo(err, req));
    return buildMiddlewareResponse(req, APPLICANT_HOST);
  }
};

const authenticatedPaths = [
  notificationRoutes.manageNotifications,
  '/api/user/migrate',
];

const isAuthenticatedPath = (url: string) =>
  ONE_LOGIN_ENABLED == 'true' &&
  authenticatedPaths.some((path) => url.startsWith(path));

export const middleware = async (req: NextRequest) => {
  const userAgentHeader = req.headers.get('user-agent') || '';
  if (!userAgentHeader.startsWith('ELB-HealthChecker')) logRequest(req);
  const nextUrl = req.nextUrl.pathname;
  if (isAuthenticatedPath(nextUrl)) return authenticateRequest(req);
};
