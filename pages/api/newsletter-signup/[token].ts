import type { NextApiRequest, NextApiResponse } from 'next';
import {
  decryptSignedApiKey,
  generateSignedApiKey,
} from '../../../src/service/api-key-service';
import { NewsletterSubscription } from '../../../src/types/newsletter';
import { client as axios } from '../../../src/utils/axios';
import nookies from 'nookies';
import {
  cookieName,
  HEADERS,
  maxAgeForCookies,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { encrypt } from '../../../src/utils/encryption';
import { logger } from '../../../src/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const tokenValues = decryptSignedApiKey(req.query.token.toString());
  const newsletterSubscription: NewsletterSubscription = {
    email: tokenValues.email,
    newsletterType: tokenValues.newsletterType,
  };

  // TODO we need to start thinking about sad paths to inform users about potential errors.
  try {
    await axios.post(
      new URL('/newsletters', process.env.BACKEND_HOST).toString(),
      newsletterSubscription,
    );
  } catch (e) {
    logger.error('error subscribing to newletter', {
      message: e.message,
      stack: e.stack,
      correlationId: req.headers[HEADERS.CORRELATION_ID],
    });
  }

  await addEmailAddressCookieToResponse(tokenValues, res);

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_SUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}
async function addEmailAddressCookieToResponse(
  tokenValues: any,
  res: NextApiResponse<any>,
) {
  const encryptedEmailAddress = await encrypt(tokenValues.email);
  const emailAddressJwt = generateSignedApiKey({
    email: encryptedEmailAddress,
  });

  nookies.set({ res }, cookieName['currentEmailAddress'], emailAddressJwt, {
    maxAge: maxAgeForCookies,
    path: '/',
    httpOnly: true,
  });
}
