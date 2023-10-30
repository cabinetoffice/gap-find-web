import { notificationRoutes } from '../../../src/utils/constants';

const encryptedEmail = 'test-encrypted-email-string';
const hashedEmail = 'test-hashed-email-string';

export const redirectResult = {
  redirect: {
    permanent: false,
    destination: notificationRoutes['checkEmail'],
  },
};
export const testGrants = [
  {
    fields: {
      grantName: 'Test Grant',
    },
    sys: {
      id: '12345678',
    },
  },
];
export const testSubscription = {
  id: 1,
  contentfulGrantSubscriptionId: '12345678',
  createdAt: '2022-10-17T14:33:02.381Z',
  updatedAt: '2022-10-17T14:33:02.381Z',
};
export const testSubscriptionArray = [testSubscription];
export const testSubscriptionArrayWithGrantName = [
  { ...testSubscription, grantName: testGrants[0].fields.grantName },
];

const user = {
  id: 1,
  hashedEmailAddress: hashedEmail,
  encryptedEmailAddress: encryptedEmail,
  createdAt: '2022-10-17T13:33:02.353Z',
  updatedAt: '2022-10-17T13:33:02.353Z',
  emailAddress: 'test.gov.uk',
};
const savedSearchOldest = {
  id: 7,
  name: 'search1',
  search_term: '',
  filters: [
    { name: 'fields.grantApplicantType.en-US', subFilterid: '2' },
    { name: 'fields.grantLocation.en-US', subFilterid: '1' },
    { name: 'fields.grantMaximumAward.en-US', subFilterid: '2' },
  ],
  fromDate: null,
  toDate: null,
  status: 'CONFIRMED',
  notifications: false,
  createdAt: '2022-10-18T13:42:48.285Z',
  user,
};
const savedSearchOlder = {
  id: 8,
  name: 'search2',
  search_term: '',
  filters: [
    { name: 'fields.grantApplicantType.en-US', subFilterid: '3' },
    { name: 'fields.grantLocation.en-US', subFilterid: '3' },
    { name: 'fields.grantMaximumAward.en-US', subFilterid: '2' },
    { name: 'fields.grantMaximumAward.en-US', subFilterid: '3' },
    { name: 'fields.grantMaximumAward.en-US', subFilterid: '4' },
  ],
  fromDate: null,
  toDate: null,
  status: 'CONFIRMED',
  notifications: false,
  createdAt: '2022-10-18T13:48:13.265Z',
  user,
};
const savedSearchNewest = {
  id: 9,
  name: 'search3',
  search_term: '',
  filters: [{ name: 'fields.grantApplicantType.en-US', subFilterid: '4' }],
  fromDate: null,
  toDate: null,
  status: 'DRAFT',
  notifications: false,
  createdAt: '2022-10-18T13:49:21.846Z',
  user,
};
export const savedSearches = [
  savedSearchOldest,
  savedSearchOlder,
  savedSearchNewest,
];

export const newsletterSubscription = {
  id: '1234',
  type: 'NEW_GRANTS',
  createdAt: '2022-10-18T11:14:06.119Z',
  updatedAt: '2022-10-18T11:14:06.119Z',
};
export const newGrantsParams = {
  from: { day: 9, month: 3, year: 2022 },
  to: { day: 16, month: 3, year: 2022 },
};

export const testResultSuccess = {
  props: {
    currentNotificationList: JSON.stringify(testSubscriptionArray),
    grantDetails: null,
    urlAction: null,
    newsletterSubscription,
    newGrantsParams,
    savedSearches,
    deletedSavedSearchName: null,
    migrationBannerProps: undefined,
  },
};

export const testResultDeleteSuccess = {
  props: {
    currentNotificationList: JSON.stringify(testSubscriptionArrayWithGrantName),
    grantDetails: testGrants[0],
    urlAction: 'unsubscribe',
    newsletterSubscription,
    newGrantsParams,
    savedSearches,
    deletedSavedSearchName: null,
    migrationBannerProps: undefined,
  },
};

export const testResultSubscribeSuccess = {
  props: {
    currentNotificationList: JSON.stringify(testSubscriptionArrayWithGrantName),
    grantDetails: testGrants[0],
    urlAction: 'subscribe',
    newsletterSubscription,
    newGrantsParams,
    savedSearches,
    deletedSavedSearchName: null,
    migrationBannerProps: undefined,
  },
};

export const context = {
  req: {
    cookies: {
      currentEmailAddress: { email: encryptedEmail },
    },
  },
  query: {
    grantId: null,
    applyMigrationStatus: 'SUCCEEDED',
  },
};

export const deleteContext = {
  ...context,
  query: {
    grantId: '12345678',
    action: 'unsubscribe',
  },
};

export const subscribeContext = {
  req: {
    cookies: {
      currentEmailAddress: 'test-encrypted-email-string',
    },
  },
  query: {
    grantId: '12345678',
    action: 'subscribe',
  },
};

export const props = {
  currentNotificationList: JSON.stringify(testSubscriptionArray),
  grantDetails: null,
  urlAction: null,
  newsletterSubscription,
  newGrantsParams,
  savedSearches,
  migrationBannerProps: {
    applyMigrationStatus: null,
    findMigrationStatus: null,
  },
};

export const deletedProps = {
  ...props,
  grantDetails: testGrants[0],
  urlAction: 'unsubscribe',
};

export const subscribedProps = {
  ...deletedProps,
  urlAction: 'subscribe',
};

export const noNotificationNoSavedSearchesProps = {
  ...props,
  currentNotificationList: JSON.stringify([]),
  savedSearches: [],
};
