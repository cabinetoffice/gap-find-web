import { axios, axiosConfig } from '../../src/utils';
import { UnsubscribeSubscriptionRequest } from '../types/subscription';

export class SubscriptionService {
  private static endpoint = {
    addSubscription: ' ',
    userParam: 'users/',
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

  async getSubscriptionsByEmail(
    emailAddress: string,
    jwt: string,
  ): Promise<Response> {
    const endpoint: string =
      SubscriptionService.endpoint.userParam + encodeURIComponent(emailAddress);
    const result = await SubscriptionService.client.get(
      endpoint,
      axiosConfig(jwt),
    );
    return result.data;
  }

  async getSubscriptionByEmailAndGrantId(
    emailAddress: string,
    grantId: string,
  ): Promise<Response> {
    const endpoint: string = `${
      SubscriptionService.endpoint.userParam + encodeURIComponent(emailAddress)
    }/${SubscriptionService.endpoint.grantIdParam + grantId}`;
    const result = await SubscriptionService.client.get(endpoint);
    return result.data;
  }

  async getSubscriptionBySubAndGrantId(
    sub: string,
    grantId: string,
    unsubscribeReference?: string,
  ): Promise<Response> {
    const endpoint = `${
      SubscriptionService.endpoint.userParam + encodeURIComponent(sub)
    }/${SubscriptionService.endpoint.grantIdParam + grantId}`;
    const result = await SubscriptionService.client.get(
      endpoint + '?unsubscribeReference=' + unsubscribeReference,
    );
    return result.data;
  }

  async deleteSubscriptionByEmailOrSubAndGrantId(
    dto: UnsubscribeSubscriptionRequest,
  ): Promise<Response> {
    const id = dto.sub ? dto.sub : dto.emailAddress;

    const endpoint = `${
      SubscriptionService.endpoint.userParam + encodeURIComponent(id)
    }/${SubscriptionService.endpoint.grantIdParam + dto.grantId}`;
    const queryParam = dto.unsubscribeReferenceId
      ? `?unsubscribeReference=${dto.unsubscribeReferenceId}`
      : '';
    const result = await SubscriptionService.client.delete(
      endpoint + queryParam,
    );
    return result.data;
  }
}
