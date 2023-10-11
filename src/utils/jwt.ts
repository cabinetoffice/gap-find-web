// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { NextApiRequest } from 'next';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { decodeJwt } from 'jose';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET;

export const getJwtFromCookies = async (req: NextRequest | NextApiRequest) => {
  // Implementation below replicates that of a lambda function
  // cabinet office have:
  // https://github.com/cabinetoffice/x-co-login-auth-lambda/blob/22ce5fa104d2a36016a79f914d238f53ddabcee4/src/controllers/http/v1/request/utils.js#L81
  const cookieValue =
    req instanceof NextRequest
      ? req.cookies.get(USER_TOKEN_NAME)
      : req.cookies[USER_TOKEN_NAME];

  const parsedCookie = cookie.parse(`connect.sid=${cookieValue}`)[
    'connect.sid'
  ];

  // If the cookie is not a signed cookie, the parser will return the provided value
  const jwt = cookieParser.signedCookie(parsedCookie, USER_TOKEN_SECRET);

  if (!jwt || jwt === 'undefined')
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`,
    );

  return { jwtPayload: await decodeJwt(jwt), jwt };
};
