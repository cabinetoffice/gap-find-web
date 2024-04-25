import { NextRequest } from 'next/server';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import cookieParser from 'cookie-parser';
import { decodeJwt } from 'jose';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME as string;
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET;

export const getJwtFromCookies = (
  req: NextRequest | NextApiRequest | GetServerSidePropsContext['req'],
) => {
  const cookieValue =
    req instanceof NextRequest
      ? req.cookies.get(USER_TOKEN_NAME)
      : req.cookies[USER_TOKEN_NAME];

  // If the cookie is not a signed cookie, the parser will return the provided value
  const jwt = cookieParser.signedCookie(cookieValue, USER_TOKEN_SECRET);

  if (!jwt)
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`,
    );

  return { jwtPayload: decodeJwt(jwt), jwt };
};

export const getJwtFromMiddlewareCookies = (req: NextRequest) => {
  const COOKIE_SECRET = process.env.COOKIE_SECRET;

  const userTokenCookie = req.cookies.get(USER_TOKEN_NAME);

  if (!userTokenCookie)
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: cookie not found`,
    );

  const cookieValue = userTokenCookie.value;

  // If the cookie is not a signed cookie, the parser will return the provided value
  const unsignedCookie = cookieParser.signedCookie(cookieValue, COOKIE_SECRET);

  if (!unsignedCookie || unsignedCookie === 'undefined') {
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`,
    );
  }

  return { jwt: unsignedCookie, jwtPayload: decodeJwt(unsignedCookie) };
};

export const axiosConfig = (jwt: string) => {
  return {
    withCredentials: true,
    headers: {
      Cookie: `user-service-token=${jwt};`,
    },
  };
};
