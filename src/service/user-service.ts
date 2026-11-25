import { getJwtFromCookies } from '../utils/jwt';

const USER_SERVICE_HOST = process.env.USER_SERVICE_HOST;
const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const TECHNICAL_SUPPORT_DOMAIN = process.env.TECHNICAL_SUPPORT_DOMAIN;

export async function checkUserLoggedIn(userToken: string) {
  const requestUrl = `${USER_SERVICE_HOST}/is-user-logged-in`;
  const response = await fetch(requestUrl, {
    headers: {
      Cookie: `${USER_TOKEN_NAME}=${userToken}`,
    },
  });
  if (!response.ok)
    throw new Error(
      `GET request to ${requestUrl} failed with response code: ${response.status}: ${response.statusText}`,
    );
  return response.json();
}

type CookieRequest = Parameters<typeof getJwtFromCookies>[0];

/**
 * Returns the user token from the request's cookies, but only once
 * user-service has confirmed it is genuine and the session is still active.
 * Returns null when there is no token, it can't be read, or it isn't valid.
 *
 * Use this before acting on the token's `sub` or `email`. getJwtFromCookies
 * only decodes the token and doesn't check its signature, so anyone can
 * send a made-up token with someone else's details in it.
 */
export async function getVerifiedJwtFromCookies(req: CookieRequest) {
  let token: ReturnType<typeof getJwtFromCookies>;
  try {
    token = getJwtFromCookies(req);
  } catch {
    return null;
  }

  const isLoggedIn = await checkUserLoggedIn(token.jwt);
  return isLoggedIn === true ? token : null;
}

export async function getUserRoles(userToken: string) {
  const requestUrl = `${USER_SERVICE_HOST}/user/roles`;
  const response = await fetch(requestUrl, {
    headers: {
      Cookie: `${USER_TOKEN_NAME}=${userToken}`,
    },
  });
  if (!response.ok)
    throw new Error(
      `GET request to ${requestUrl} failed with response code: ${response.status}: ${response.statusText}`,
    );
  return response.json();
}

export function getUserRolesRelatedRedirect(
  applicantUrl: string,
  adminUrl: string,
  userRoles,
) {
  if (userRoles.isSuperAdmin) return `${adminUrl}/super-admin-dashboard`;
  else if (userRoles.isAdmin) return `${adminUrl}/dashboard`;
  else if (userRoles.isTechnicalSupport)
    return `${TECHNICAL_SUPPORT_DOMAIN}/api-keys`;
  else if (userRoles.isApplicant) return `${applicantUrl}/dashboard`;
}
