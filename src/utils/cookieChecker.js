import nookies from 'nookies';

const checkifCookieDoesExist = (ctx, cookieName) => {
  const cookies = nookies.get(ctx);
  return cookies[cookieName] ? true : false;
};

export default checkifCookieDoesExist;
