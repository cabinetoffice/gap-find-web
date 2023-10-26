import axios from 'axios';

const GRANT_SUBSCRIPTION = 'GRANT_SUBSCRIPTION';
const NEWSLETTER = 'NEWSLETTER';
const SAVED_SEARCH = 'SAVED_SEARCH';

interface NotificationKeys {
  newsletterId?: string;
  subscriptionId?: string;
  savedSearchId?: string;
}

interface UnsubscribeReferenceData extends NotificationKeys {
  encryptedEmailAddress: string;
  user: { encryptedEmailAddress: string; id: number };
}

const NOTIFICATION_KEY_MAP = {
  subscriptionId: GRANT_SUBSCRIPTION,
  newsletterId: NEWSLETTER,
  savedSearchId: SAVED_SEARCH,
} as const;

export const getTypeFromNotificationIds = ({
  subscriptionId,
  newsletterId,
  savedSearchId,
}: NotificationKeys) =>
  Object.values(NOTIFICATION_KEY_MAP).find(
    (value) =>
      (subscriptionId && value === GRANT_SUBSCRIPTION) ||
      (newsletterId && value === NEWSLETTER) ||
      (savedSearchId && value === SAVED_SEARCH),
  ) as (typeof NOTIFICATION_KEY_MAP)[keyof typeof NOTIFICATION_KEY_MAP];

export const removeUnsubscribeReference = async (id: string) =>
  axios.delete<void>(`${process.env.BACKEND_HOST}/unsubscribe/${id}`);

export const getUnsubscribeReferenceFromId = async (id: string) => {
  const { data } = await axios.get<UnsubscribeReferenceData>(
    process.env.BACKEND_HOST + '/unsubscribe/' + id,
  );
  return data;
};
