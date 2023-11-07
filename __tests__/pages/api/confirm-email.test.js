import handler from '../../../pages/api/confirm-email/[pid]';
import {
  decryptSignedApiKey,
  generateSignedApiKey,
} from '../../../src/service/api-key-service';
import * as nookies from 'nookies';
import { notificationRoutes } from '../../../src/utils/constants';

jest.mock('../../../src/service/api-key-service');

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
    destroy: jest.fn(),
    set: jest.fn(),
  };
});

const req = {
  query: {
    pid: 'TEST JWT',
  },
};

const res = {
  redirect: jest.fn(),
};

describe('Confirm email and set cookie', () => {
  const mockDestroy = jest.fn();
  const mockSet = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    nookies.destroy.mockImplementation(mockDestroy);
    nookies.set.mockImplementation(mockSet);
  });

  it('should redirect the user', () => {
    decryptSignedApiKey.mockReturnValue({
      email: 'test@test.com',
    });
    handler(req, res);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      notificationRoutes['manageNotifications'],
    );
  });

  it('should set a cookie when the token is decoded successfully', () => {
    decryptSignedApiKey.mockReturnValue({
      email: 'test@test.com',
    });
    generateSignedApiKey.mockReturnValue({
      email: 'test@test.com',
    });
    handler(req, res);
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(mockDestroy).toHaveBeenCalledWith({ res }, 'currentEmailAddress');
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(
      { res },
      'currentEmailAddress',
      { email: 'test@test.com' },
      {
        maxAge: 2 * 60 * 60,
        path: '/',
        httpOnly: true,
      },
    );
  });
});
