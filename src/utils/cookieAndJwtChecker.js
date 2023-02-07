import nookies from 'nookies';
import jwt from 'jsonwebtoken';

export const hasValidJwt = (err) => {
  return err ? false : true;
};

const cookieExistsAndContainsValidJwt = (ctx, cookieName) => {
  const cookies = nookies.get(ctx);
  const cookie = cookies[cookieName];

  if (!!cookie) {
    return jwt.verify(cookie, process.env.JWT_SECRET_KEY, hasValidJwt);
  }

  return false;
};

export default cookieExistsAndContainsValidJwt;
