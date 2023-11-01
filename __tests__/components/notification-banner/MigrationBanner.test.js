import { render, screen } from '@testing-library/react';
import { MigrationBanner } from '../../../src/components/notification-banner';

const testProps = {
  subscriptionFindOnly: {
    applyMigrationStatus: 'NOT_STARTED',
    findMigrationStatus: 'SUCCEEDED',
    migrationType: 'subscription-notifications',
  },

  subscriptionFindAndApply: {
    findMigrationStatus: 'SUCCEEDED',
    migrationType: 'subscription-notifications',
    applyMigrationStatus: 'SUCCEEDED',
  },

  findFailed: {
    migrationType: 'subscription-notifications',
    applyMigrationStatus: 'SUCCEEDED',
    findMigrationStatus: 'FAILED',
  },

  applyFailed: {
    findMigrationStatus: 'SUCCEEDED',
    migrationType: 'subscription-notifications',
    applyMigrationStatus: 'FAILED',
  },
};

const expectedFindOnlyContent = [
  'You have signed up for updates about some-grant.',
  'You can now access your notifications when you sign in with GOV.UK One Login.',
];

const expectedFindAndApplyContent = [
  'You have signed up for updates about some-grant.',
  'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
];

describe('MigrationBanner', () => {
  const {
    subscriptionFindAndApply,
    subscriptionFindOnly,
    findFailed,
    applyFailed,
  } = testProps;
  it.each`
    props                       | expected
    ${subscriptionFindOnly}     | ${expectedFindOnlyContent}
    ${subscriptionFindAndApply} | ${expectedFindAndApplyContent}
    ${findFailed}               | ${'Something went wrong while transferring your data.'}
    ${applyFailed}              | ${'Something went wrong while transferring your data.'}
  `('should render $expected', async ({ props, expected }) => {
    render(<MigrationBanner nameOfGrantUpdated={'some-grant'} {...props} />);
    typeof expected === 'string'
      ? expect(screen.getByText(expected)).toBeVisible()
      : expected.forEach((assertion) =>
          expect(screen.getByText(assertion)).toBeVisible(),
        );
  });
});
