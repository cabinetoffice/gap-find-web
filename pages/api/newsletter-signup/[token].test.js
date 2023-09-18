import handler from './[token]';
import { decryptSignedApiKey } from '../../../src/service/api-key-service';
import { notificationRoutes, URL_ACTIONS } from '../../../src/utils/constants';
import axios from 'axios';
import { encrypt } from '../../../src/utils/encryption';

jest.mock('axios');
jest.mock('../../../src/service/api-key-service');
jest.mock('../../../src/utils/encryption');
jest.mock('nookies');

describe('newslettersignup', () => {
  it('should add a newsletter subscription', async () => {
    const req = {
      query: {
        token: 'an-encrypted-jwt',
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    const tokenValues = {
      email: 'email@email.com',
      newsletterType: 'NEW_GRANTS_ADDED',
    };

    decryptSignedApiKey.mockReturnValue(tokenValues);
    encrypt.mockResolvedValue('an-encrypted-email');

    await handler(req, res);

    expect(axios.post).toHaveBeenCalledWith(
      new URL('/newsletters', process.env.BACKEND_HOST).toString(),
      tokenValues,
    );
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      new URL(
        `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_SUBSCRIBE}`,
        process.env.HOST,
      ).toString(),
    );
  });

  it('should catch any errors thrown and continue', async () => {
    const req = {
      query: {
        token: 'an-encrypted-jwt',
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    const tokenValues = {
      email: 'email@email.com',
      newsletterType: 'NEW_GRANTS_ADDED',
    };

    decryptSignedApiKey.mockReturnValue(tokenValues);
    encrypt.mockResolvedValue('an-encrypted-email');
    axios.post.mockRejectedValue(new Error('Error from post request'));

    await handler(req, res);

    expect(axios.post).rejects.toThrow(new Error('Error from post request'));
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      new URL(
        `${notificationRoutes['manageNotifications']}?action=${URL_ACTIONS.NEWSLETTER_SUBSCRIBE}`,
        process.env.HOST,
      ).toString(),
    );
  });
});
