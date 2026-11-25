import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { SubscriptionService } from '../../../src/service/subscription-service';
import { getVerifiedJwtFromCookies } from '../../../src/service/user-service';
import {
  cookieName,
  notificationRoutes,
  URL_ACTIONS,
} from '../../../src/utils/constants';
import { decrypt } from '../../../src/utils/encryption';

export default async function handler(req, res) {
  if (process.env.ONE_LOGIN_ENABLED === 'true') {
    const verifiedJwt = await getVerifiedJwtFromCookies(req);
    if (!verifiedJwt) return res.redirect(303, process.env.APPLICANT_HOST);

    await deleteSubscriptionBySubAndGrantId(
      verifiedJwt.jwtPayload.sub,
      req.body.grantId,
    );
  } else {
    const result = await deleteSubscriptionByEmailAndGrantId(req);

    if (result?.redirect) {
      return result;
    }
  }

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}?grantId=${req.body.grantId}&action=${URL_ACTIONS.UNSUBSCRIBE}`,
      process.env.HOST,
    ).toString(),
  );
}

const deleteSubscriptionBySubAndGrantId = async (sub, grantId) => {
  const subscriptionService = SubscriptionService.getInstance();

  await subscriptionService.deleteSubscriptionByEmailOrSubAndGrantId({
    grantId,
    sub,
  });
};

const deleteSubscriptionByEmailAndGrantId = async (req) => {
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
  await subscriptionService.deleteSubscriptionByEmailOrSubAndGrantId({
    emailAddress: decryptedEmailAddress,
    grantId: req.body.grantId,
  });
};
