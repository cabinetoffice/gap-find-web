export type UnsubscribeSubscriptionRequest = {
  grantId: string;
  emailAddress?: string;
  sub?: string;
  unsubscribeReferenceId?: string;
};

export type MigrationBannerProps = {
  applyMigrationStatus: string | null;
  grantIdCookieValue?: string | null;
  findMigrationStatus: string | null;
  migrationType: string | null;
};
