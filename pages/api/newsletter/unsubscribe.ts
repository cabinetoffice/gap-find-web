import type { NextApiRequest, NextApiResponse } from 'next';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';
import { NewsletterSubscriptionService } from '../../../src/service/newsletter/newsletter-subscription-service';
import { NewsletterType } from '../../../src/types/newsletter';
import { logger } from '../../../src/utils';
import { getVerifiedJwtFromCookies } from '../../../src/service/user-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const newsletterService = NewsletterSubscriptionService.getInstance();
  let decryptedEmailAddress;
  let sub = null;
  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const verifiedJwt = await getVerifiedJwtFromCookies(req);
    if (!verifiedJwt) return res.redirect(303, process.env.APPLICANT_HOST);

    decryptedEmailAddress = verifiedJwt.jwtPayload.email;
    sub = verifiedJwt.jwtPayload.sub;
  } else {
    if (!req.cookies[cookieName.currentEmailAddress]) {
      return {
        redirect: {
          permanent: false,
          destination: notificationRoutes['checkEmail'],
        },
      };
    }

    const decodedEmailCookie = decryptSignedApiKey(
      req.cookies[cookieName['currentEmailAddress']],
    );
    decryptedEmailAddress = await decrypt(decodedEmailCookie.email);
  }

  try {
    await newsletterService.unsubscribeFromNewsletter({
      plaintextEmail: decryptedEmailAddress,
      type: NewsletterType.NEW_GRANTS,
      sub,
    });
  } catch (e) {
    logger.error(
      'error unsubscribing from newsletter',
      logger.utils.addErrorInfo(e, req),
    );
  }

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_UNSUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}
