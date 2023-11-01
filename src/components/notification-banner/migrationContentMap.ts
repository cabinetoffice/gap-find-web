import { LOGIN_NOTICE_TYPES } from '../../utils';

export const MIGRATION_CONTENT_MAP = {
  [LOGIN_NOTICE_TYPES.MANAGE_NOTIFICATIONS]: () => ({
    FIND: {
      HEADING:
        'You can now access your notifications when you sign in with GOV.UK One Login.',
      CONTENT: null,
    },
    FIND_AND_APPLY: {
      HEADING:
        'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
      CONTENT: null,
    },
  }),
  [LOGIN_NOTICE_TYPES.NEWSLETTER]: () => ({
    FIND: {
      HEADING: 'You have signed up for updates about new grants.',
      CONTENT:
        'You can now access your notifications when you sign in with GOV.UK One Login.',
    },
    FIND_AND_APPLY: {
      HEADING: 'You have signed up for updates about new grants.',
      CONTENT:
        'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
    },
  }),
  [LOGIN_NOTICE_TYPES.SUBSCRIPTION_NOTIFICATIONS]: (nameOfGrant: string) => ({
    FIND: {
      HEADING: `You have signed up for updates about ${nameOfGrant}.`,
      CONTENT:
        'You can now access your notifications when you sign in with GOV.UK One Login.',
    },
    FIND_AND_APPLY: {
      HEADING: `You have signed up for updates about ${nameOfGrant}.`,
      CONTENT:
        'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
    },
  }),
  [LOGIN_NOTICE_TYPES.SAVED_SEARCH]: () => ({
    FIND: {
      HEADING: 'Your saved search has been added.',
      CONTENT:
        'You can now access your notifications when you sign in with GOV.UK One Login.',
    },
    FIND_AND_APPLY: {
      HEADING: 'Your saved search has been added.',
      CONTENT:
        'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
    },
  }),
};
