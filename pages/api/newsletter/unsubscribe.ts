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
import { addErrorInfo, getJwtFromCookies, logger } from '../../../src/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const newsletterService = NewsletterSubscriptionService.getInstance();
  let decryptedEmailAddress;
  // let sub;
  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const { jwtPayload } = getJwtFromCookies(req);
    decryptedEmailAddress = jwtPayload.email;
    // sub = jwtPayload.sub;
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
    await newsletterService.unsubscribeFromNewsletter(
      decryptedEmailAddress,
      NewsletterType.NEW_GRANTS,
    );
  } catch (e) {
    logger.error('error unsubscribing from newsletter', addErrorInfo(e, req));
  }

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_UNSUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}
