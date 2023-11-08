// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { v4 } from 'uuid';
import { checkUserLoggedIn } from './src/service';
import {
  HEADERS,
  notificationRoutes,
  newsletterRoutes,
  LOGIN_NOTICE_TYPES,
  logger,
  getJwtFromCookies,
  addErrorInfo,
} from './src/utils';

const COOKIE_CONFIG = {
  path: '/',
  secure: true,
  httpOnly: true,
  maxAge: 900,
};
const HOST = process.env.HOST;
const ONE_LOGIN_ENABLED = process.env.ONE_LOGIN_ENABLED;
const APPLICANT_HOST = process.env.APPLICANT_HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

const asObject = (
  entries: IterableIterator<[string, string]>,
  keysToExclude: string[] = [],
) =>
  Array.from(entries)
    .filter(([key]) => !keysToExclude.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as object);

const formatRequest = (req: NextRequest) => ({
  url: req.url,
  method: req.method,
  cookies: Array.from(req.cookies.values()).filter(
    (value) => !value.startsWith('user-service-token'),
  ),
  headers: asObject(req.headers.entries(), ['cookie']),
});

const formatResponse = (res: NextResponse) => ({
  url: res.url,
  status: res.status,
  headers: asObject(res.headers.entries(), ['cookie']),
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

const subscriptionSignUpPattern = new URLPattern({
  pathname: notificationRoutes.subscriptionSignUp,
});

const saveSearchPattern = new URLPattern({
  pathname: notificationRoutes.saveSearch,
});

type ValueOf<T> = T[keyof T];

const getLoginNoticeUrl = (noticeType: ValueOf<typeof LOGIN_NOTICE_TYPES>) =>
  `${HOST}${notificationRoutes.loginNotice}${noticeType}`;

const handleSubscriptionRedirect = (req: NextRequest) => {
  const grantId = req.nextUrl.searchParams.get('id');

  const res = NextResponse.redirect(
    getLoginNoticeUrl(LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS),
  );

  res.cookies.set('grantIdCookieValue', grantId, COOKIE_CONFIG);

  return res;
};

const handleSavedSearchRedirect = (req: NextRequest) => {
  const res = NextResponse.redirect(
    `${getLoginNoticeUrl(LOGIN_NOTICE_TYPES.SAVED_SEARCH)}?${
      req.nextUrl.search
    }`,
  );

  return res;
};

export function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
  if (manageNotificationsPattern.test({ pathname: req.nextUrl.pathname })) {
    return NextResponse.redirect(
      getLoginNoticeUrl(LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS),
    );
  }

  if (subscriptionSignUpPattern.test({ pathname: req.nextUrl.pathname })) {
    return handleSubscriptionRedirect(req);
  }

  if (saveSearchPattern.test({ pathname: req.nextUrl.pathname })) {
    return handleSavedSearchRedirect(req);
  }

  return NextResponse.redirect(redirectUri);
}

const logRequest = (req: NextRequest) => {
  const correlationId = v4();
  req.headers.set(HEADERS.CORRELATION_ID, correlationId);
  logger.http('Incoming request', { ...formatRequest(req), correlationId });
  const res = NextResponse.next();
  logger.http('Outgoing response', { ...formatResponse(res), correlationId });
};

const authenticateRequest = async (req: NextRequest) => {
  try {
    const { jwt, jwtPayload } = getJwtFromCookies(req);
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
  '/api/user/migrate',
  notificationRoutes.manageNotifications,
  notificationRoutes.subscriptionSignUp,
  notificationRoutes.saveSearch,
  newsletterRoutes.signup,
  newsletterRoutes.confirmation,
  newsletterRoutes.unsubscribe,
].map((path) => new URLPattern({ pathname: path }));

const isAuthenticatedPath = (pathname: string) =>
  ONE_LOGIN_ENABLED == 'true' &&
  authenticatedPaths.some((authenticatedPath) =>
    authenticatedPath.test({ pathname }),
  );

export const middleware = async (req: NextRequest) => {
  const userAgentHeader = req.headers.get('user-agent') || '';
  if (!userAgentHeader.startsWith('ELB-HealthChecker')) logRequest(req);
  const { pathname } = req.nextUrl;
  if (isAuthenticatedPath(pathname)) return authenticateRequest(req);
};
