// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { v4 } from 'uuid';
import { checkUserLoggedIn } from './src/service';
import { logger } from './src/utils';
import {
  HEADERS,
  notificationRoutes,
  newsletterRoutes,
  LOGIN_NOTICE_TYPES,
  URL_ACTIONS,
} from './src/utils/constants';
import { getJwtFromMiddlewareCookies } from './src/utils';

const HOST = process.env.HOST;
const ONE_LOGIN_ENABLED = process.env.ONE_LOGIN_ENABLED;
const APPLICANT_HOST = process.env.APPLICANT_HOST;
const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;

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

const handleManageNotificationsRedirect = (req: NextRequest) => {
  const action = req.nextUrl.searchParams.get('action');
  if (action === URL_ACTIONS.NEWSLETTER_SUBSCRIBE)
    return NextResponse.redirect(
      getLoginNoticeUrl(LOGIN_NOTICE_TYPES.NEWSLETTER),
    );
  return NextResponse.redirect(
    getLoginNoticeUrl(LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS),
  );
};

const handleSubscriptionRedirect = (req: NextRequest) => {
  const res = NextResponse.redirect(
    `${getLoginNoticeUrl(LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS)}${
      req.nextUrl.search
    }`,
  );

  return res;
};

const handleSavedSearchRedirect = (req: NextRequest) => {
  const res = NextResponse.redirect(
    `${getLoginNoticeUrl(LOGIN_NOTICE_TYPES.SAVED_SEARCH)}${
      req.nextUrl.search
    }`,
  );

  return res;
};

export function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
  if (manageNotificationsPattern.test({ pathname: req.nextUrl.pathname })) {
    return handleManageNotificationsRedirect(req);
  }

  if (subscriptionSignUpPattern.test({ pathname: req.nextUrl.pathname })) {
    return handleSubscriptionRedirect(req);
  }

  if (saveSearchPattern.test({ pathname: req.nextUrl.pathname })) {
    return handleSavedSearchRedirect(req);
  }

  return NextResponse.redirect(redirectUri);
}

const authenticateRequest = async (req: NextRequest, res: NextResponse) => {
  try {
    const { jwt, jwtPayload } = getJwtFromMiddlewareCookies(req);

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
    return res;
  } catch (err) {
    logger.error(err.message);
    logger.error(
      'failed to authenticate request',
      logger.utils.addErrorInfo(err, req),
    );
    return buildMiddlewareResponse(req, APPLICANT_HOST);
  }
};

const authenticatedPaths = [
  '/api/user/migrate',
  notificationRoutes.manageNotifications,
  notificationRoutes.subscriptionSignUp,
  notificationRoutes.saveSearch,
  notificationRoutes.deleteSaveSearch,
  newsletterRoutes.signup,
  newsletterRoutes.confirmation,
  newsletterRoutes.unsubscribe,
].map((path) => new URLPattern({ pathname: path }));

const isAuthenticatedPath = (pathname: string) =>
  ONE_LOGIN_ENABLED == 'true' &&
  authenticatedPaths.some((authenticatedPath) =>
    authenticatedPath.test({ pathname }),
  );

const httpLoggers = {
  req: (req: NextRequest) => {
    const correlationId = v4();
    req.headers.set(HEADERS.CORRELATION_ID, correlationId);
    logger.http('Incoming request', {
      ...logger.utils.formatRequest(req),
      correlationId,
    });
  },
  res: (req: NextRequest, res: NextResponse) =>
    logger.http(
      'Outgoing response - PLEASE NOTE: this represents a snapshot of the response as it exits the middleware, changes made by other server code (eg getServerSideProps) will not be shown',
      {
        ...logger.utils.formatResponse(res),
        correlationId: req.headers.get(HEADERS.CORRELATION_ID),
      },
    ),
};

type LoggerType = keyof typeof httpLoggers;

const urlsToSkip = ['/_next/', '/assets/', '/javascript/'];

const getConditionalLogger = (req, type: LoggerType) => {
  const userAgentHeader = req.headers.get('user-agent') || '';
  const shouldSkipLogging =
    userAgentHeader.startsWith('ELB-HealthChecker') ||
    urlsToSkip.some((url) => req.nextUrl.pathname.startsWith(url));
  return shouldSkipLogging ? () => undefined : httpLoggers[type];
};

export const middleware = async (req: NextRequest) => {
  const logRequest = getConditionalLogger(req, 'req');
  const logResponse = getConditionalLogger(req, 'res');
  let res = NextResponse.next();
  logRequest(req, res);

  if (isAuthenticatedPath(req.nextUrl.pathname)) {
    res = await authenticateRequest(req, res);
  }

  logResponse(req, res);
  return res;
};
