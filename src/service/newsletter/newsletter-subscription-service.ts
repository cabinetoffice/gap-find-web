import { axios, axiosConfig } from '../../../src/utils';
import { NewsletterSubscription, NewsletterType } from '../../types/newsletter';

export class NewsletterSubscriptionService {
  private static instance: NewsletterSubscriptionService;

  private static client = axios.create({
    baseURL: `${process.env.BACKEND_HOST}/newsletters/`,
  });

  constructor() {}

  public static getInstance(): NewsletterSubscriptionService {
    if (!NewsletterSubscriptionService.instance) {
      NewsletterSubscriptionService.instance =
        new NewsletterSubscriptionService();
    }
    return NewsletterSubscriptionService.instance;
  }

  async getByEmailAndNewsletterType(
    email: string,
    newsletterType: NewsletterType,
    jwt: string,
  ): Promise<NewsletterSubscription> {
    const encodedemail = encodeURIComponent(email);
    const response = await NewsletterSubscriptionService.client.get(
      `/users/${encodedemail}/types/${newsletterType}`,
      axiosConfig(jwt),
    );

    return response.data;
  }

  async unsubscribeFromNewsletter(
    plaintextEmail: string,
    type: NewsletterType,
  ): Promise<void> {
    return await NewsletterSubscriptionService.client.delete(
      `/users/${plaintextEmail}/types/${type}`,
    );
  }
}
