import { axios, axiosConfig } from '../../../src/utils';
import { NewsletterSubscription, NewsletterType } from '../../types/newsletter';

export class NewsletterSubscriptionService {
  private static endpoint = {
    addSubscription: ' ',
    usersParam: 'users/',
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
      `/${NewsletterSubscriptionService.endpoint.usersParam}${encodedEmail}/${NewsletterSubscriptionService.endpoint.typesParam}${newsletterType}`,
      axiosConfig(jwt),
    );

    return response.data;
  }

  async getBySubAndNewsletterType(
    sub: string,
    newsletterType: NewsletterType,
    jwt: string,
  ): Promise<NewsletterSubscription> {
    const response = await NewsletterSubscriptionService.client.get(
      `/${NewsletterSubscriptionService.endpoint.usersParam}${sub}/${NewsletterSubscriptionService.endpoint.typesParam}${newsletterType}`,
      axiosConfig(jwt),
    );

    return response.data;
  }

  async subscribeToNewsletter(
    email: string,
    newsletterType: NewsletterType,
    jwt: string,
    sub?: string,
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
    unsubscribeReferenceId?: string,
    sub?: string,
  ): Promise<void> {
    const id = sub ?? plaintextEmail;
    console.log(id);
    const queryParam = unsubscribeReferenceId
      ? `?unsubscribeReference=${unsubscribeReferenceId}`
      : '';
    return await NewsletterSubscriptionService.client.delete(
      `/${NewsletterSubscriptionService.endpoint.usersParam}${id}/${NewsletterSubscriptionService.endpoint.typesParam}${type}${queryParam}`,
    );
  }
}
