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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const newsletterService = NewsletterSubscriptionService.getInstance();
  if (!req.cookies[cookieName.currentEmailAddress]) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    };
  }

  const decodedEmailCookie = decryptSignedApiKey(
    req.cookies[cookieName['currentEmailAddress']]
  );
  const decryptedEmailAddress = await decrypt(decodedEmailCookie.email);

  try {
    newsletterService.unsubscribeFromNewsletter(decryptedEmailAddress, NewsletterType.NEW_GRANTS);
  } catch (e) {
    console.error(e);
  }

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_UNSUBSCRIBE}`,
      process.env.HOST
    ).toString()
  );
}
