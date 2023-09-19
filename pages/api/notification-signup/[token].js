import nookies from 'nookies';
import {
  decryptSignedApiKey,
  generateSignedApiKey,
} from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import {
  cookieName,
  maxAgeForCookies,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';

export default async function handler(req, res) {
  const { token } = req.query;

  const tokenValues = decryptSignedApiKey(token);
  const decryptedEmailAddress = await decrypt(
    tokenValues.encrypted_email_address,
  );

  const subscriptionService = SubscriptionService.getInstance();

  await subscriptionService.addSubscription(
    decryptedEmailAddress,
    tokenValues.contentful_grant_subscription_id,
  );

  nookies.destroy({ res }, cookieName['currentEmailAddress']);
  const cookieSignedKey = generateSignedApiKey({
    email: tokenValues.encrypted_email_address,
  });
  nookies.set({ res }, cookieName['currentEmailAddress'], cookieSignedKey, {
    maxAge: maxAgeForCookies,
    path: '/',
    httpOnly: true,
  });

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?grantId=${tokenValues.contentful_grant_subscription_id}&action=${URL_ACTIONS.SUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}
