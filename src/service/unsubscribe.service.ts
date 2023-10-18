import axios from 'axios';

type UnsubscribeReferenceData = {
  encryptedEmailAddress: string;
  newsletterId?: string;
  subscriptionId?: string;
  savedSearchId?: string;
  user: { encryptedEmailAddress: string };
  type: 'NEWSLETTER' | 'GRANT_SUBSCRIPTION' | 'SAVED_SEARCH';
};

export const getUnsubscribeReferenceFromId = async (id: string) => {
  const { data } = await axios.get<UnsubscribeReferenceData>(
    process.env.BACKEND_HOST + '/unsubscribe/' + id,
  );
  return data;
};
