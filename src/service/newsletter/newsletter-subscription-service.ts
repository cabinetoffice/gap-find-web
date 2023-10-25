import { axios, axiosConfig } from '../../../src/utils';
import { NewsletterSubscription, NewsletterType } from '../../types/newsletter';

export class NewsletterSubscriptionService {
  private static endpoint = {
    addSubscription: ' ',
    emailParam: 'users/',
    typesParam: 'types/',
    newslettersParam: 'newsletters/',
  };

  private static instance: NewsletterSubscriptionService;

  private static client = axios.create({
    baseURL: `${process.env.BACKEND_HOST}/${NewsletterSubscriptionService.endpoint.newslettersParam}`,
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
    const encodedEmail = encodeURIComponent(email);
    const response = await NewsletterSubscriptionService.client.get(
      `/${NewsletterSubscriptionService.endpoint.emailParam}${encodedEmail}/${NewsletterSubscriptionService.endpoint.typesParam}${newsletterType}`,
      axiosConfig(jwt),
    );

    return response.data;
  }

  async subscribeToNewsletter(
    email: string,
    sub: string,
    newsletterType: NewsletterType,
    jwt: string,
  ): Promise<NewsletterSubscription> {
    const response = await NewsletterSubscriptionService.client.post(
      NewsletterSubscriptionService.endpoint.addSubscription,
      { email, sub, newsletterType },
      axiosConfig(jwt),
    );
    return response.data;
  }

  async unsubscribeFromNewsletter(
    plaintextEmail: string,
    type: NewsletterType,
  ): Promise<void> {
    return await NewsletterSubscriptionService.client.delete(
      `/${NewsletterSubscriptionService.endpoint.emailParam}${plaintextEmail}/${NewsletterSubscriptionService.endpoint.typesParam}${type}`,
    );
  }
}
