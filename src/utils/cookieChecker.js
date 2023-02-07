import nookies from 'nookies';

const checkifCookieDoesExist = (ctx, cookieName) => {
  const cookies = nookies.get(ctx);
  if (cookies[cookieName]) return true;
  return false;
};

export default checkifCookieDoesExist;
