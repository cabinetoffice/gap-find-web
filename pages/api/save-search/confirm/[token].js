import nookies from 'nookies';
import {
  decryptSignedApiKey,
  generateSignedApiKey,
} from '../../../../src/service/api-key-service';
import {
  SavedSearchStatusType,
  updateStatus,
} from '../../../../src/service/saved_search_service';
import {
  cookieName,
  maxAgeForCookies,
  notificationRoutes,
} from '../../../../src/utils/constants';

export default async function handler(req, res) {
  const { token } = req.query;
  const savedSearchId = decryptSignedApiKey(token);
  const savedSearch = await updateStatus(
    savedSearchId.id,
    SavedSearchStatusType.CONFIRMED
  );

  const cookieSignedKey = generateSignedApiKey({
    email: savedSearch.user.encryptedEmailAddress,
  });

  nookies.set({ res }, cookieName['currentEmailAddress'], cookieSignedKey, {
    maxAge: maxAgeForCookies,
    path: '/',
    httpOnly: true,
  });

  res.redirect(
    new URL(
      `${notificationRoutes['manageNotifications']}`,
      process.env.HOST
    ).toString()
  );
}
