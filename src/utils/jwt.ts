// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import cookieParser from 'cookie-parser';
import { decodeJwt } from 'jose';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET;

export const getJwtFromCookies = (
  req: NextRequest | NextApiRequest | GetServerSidePropsContext['req'],
) => {
  const cookieValue =
    req instanceof NextRequest
      ? req.cookies.get(USER_TOKEN_NAME as string)
      : req.cookies[USER_TOKEN_NAME as string];

  console.log(cookieValue);

  // If the cookie is not a signed cookie, the parser will return the provided value
  const jwt = cookieParser.signedCookie(cookieValue, USER_TOKEN_SECRET);

  if (!jwt)
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`,
    );

  return { jwtPayload: decodeJwt(jwt), jwt };
};

export const axiosConfig = (jwt: string) => {
  return {
    withCredentials: true,
    headers: {
      Cookie: `user-service-token=${jwt};`,
    },
  };
};
