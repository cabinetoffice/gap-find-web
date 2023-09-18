import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';

export default async function handler(req, res) {
  if (!req.cookies[cookieName['currentEmailAddress']]) {
    return {
      redirect: {
        permanent: false,
        destination: notificationRoutes['checkEmail'],
      },
    };
  }
  let decodedEmailCookie = decryptSignedApiKey(
    req.cookies[cookieName['currentEmailAddress']],
  );

  const subscriptionService = SubscriptionService.getInstance();

  const decryptedEmailAddress = await decrypt(decodedEmailCookie.email);
  await subscriptionService.deleteSubscriptionByEmailAndGrantId(
    decryptedEmailAddress,
    req.body.grantId,
  );

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?grantId=${req.body.grantId}&action=${URL_ACTIONS.UNSUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}
