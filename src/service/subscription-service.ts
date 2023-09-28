import { axios } from '../../src/utils';

export class SubscriptionService {
  private static endpoint = {
    addSubscription: ' ',
    emailParam: 'users/',
    grantIdParam: 'grants/',
  };

  private static instance: SubscriptionService;

  private static client = axios.create({
    baseURL: `${process.env.BACKEND_HOST}/subscriptions/`,
  });

  constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }

    return SubscriptionService.instance;
  }

  async addSubscription(
    emailAddress: string,
    contentfulGrantSubscriptionId: string,
  ): Promise<boolean> {
    const result = await SubscriptionService.client.post(
      SubscriptionService.endpoint.addSubscription,
      { emailAddress, contentfulGrantSubscriptionId },
    );
    return result.data;
  }

  async getSubscriptionsByEmail(emailAddress: string): Promise<Response> {
    const endpoint: string =
      SubscriptionService.endpoint.emailParam +
      encodeURIComponent(emailAddress);
    const result = await SubscriptionService.client.get(endpoint);
    return result.data;
  }

  async getSubscriptionByEmailAndGrantId(
    emailAddress: string,
    grantId: string,
  ): Promise<Response> {
    const endpoint: string = `${
      SubscriptionService.endpoint.emailParam + encodeURIComponent(emailAddress)
    }/${SubscriptionService.endpoint.grantIdParam + grantId}`;
    const result = await SubscriptionService.client.get(endpoint);
    return result.data;
  }

  async deleteSubscriptionByEmailAndGrantId(
    emailAddress: string,
    grantId: string,
  ): Promise<Response> {
    const endpoint: string = `${
      SubscriptionService.endpoint.emailParam + encodeURIComponent(emailAddress)
    }/${SubscriptionService.endpoint.grantIdParam + grantId}`;
    const result = await SubscriptionService.client.delete(endpoint);
    return result.data;
  }
}
