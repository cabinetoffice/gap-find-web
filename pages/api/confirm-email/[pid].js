import {
  generateSignedApiKey,
  decryptSignedApiKey,
} from '../../../src/service/api-key-service';
import nookies from 'nookies';
import {
  maxAgeForCookies,
  notificationRoutes,
} from '../../../src/utils/constants';

const handler = (req, res) => {
  const { pid } = req.query;
  let tokenValues = decryptSignedApiKey(pid);
  nookies.destroy({ res }, 'currentEmailAddress');
  let cookieSignedKey = generateSignedApiKey({
    email: tokenValues.email,
  });
  nookies.set({ res }, 'currentEmailAddress', cookieSignedKey, {
    maxAge: maxAgeForCookies,
    path: '/',
    httpOnly: true,
  });
  res.redirect(notificationRoutes['manageNotifications']);
};

export default handler;
