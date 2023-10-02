export type NewsletterSubscription = {
  id?: number;
  email: string;
  newsletterType: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export enum NewsletterType {
  NEW_GRANTS = 'NEW_GRANTS',
}
