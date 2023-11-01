export type UnsubscribeSubscriptionRequest = {
  grantId: string;
  emailAddress?: string;
  sub?: string;
  unsubscribeReferenceId?: string;
};

export type MigrationBannerProps = {
  applyMigrationStatus: string;
  grantIdCookieValue?: string;
  findMigrationStatus: string;
  migrationType: string;
};
