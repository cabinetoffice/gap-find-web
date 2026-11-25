import { HEADERS } from '../../../src/utils/constants';
import handler from './delete';
import axios from 'axios';
import { decodeJwt } from 'jose';
import { checkUserLoggedIn } from '../../../src/service/user-service';

jest.mock('axios');
jest.mock('../../../src/service/user-service');
jest.mock('jose', () => ({ decodeJwt: jest.fn() }));

const getMockRequest = (overrides = {}) => ({
  headers: {
    [HEADERS.CORRELATION_ID]: 'test-id',
    authorization: 'Bearer super-admin-jwt',
  },
  ...overrides,
});

const getMockResponse = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  return res;
};

describe('handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    checkUserLoggedIn.mockResolvedValue(true);
    decodeJwt.mockReturnValue({ roles: '[FIND, APPLICANT, SUPER_ADMIN]' });
  });

  describe('authorisation', () => {
    const expectRejected = (res, status) => {
      expect(axios).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(status);
    };

    it('returns 401 without calling the backend when there is no Authorization header', async () => {
      const res = getMockResponse();

      await handler(
        getMockRequest({
          headers: { [HEADERS.CORRELATION_ID]: 'test-id' },
          query: { sub: 'victim-sub' },
        }),
        res,
      );

      expect(checkUserLoggedIn).not.toHaveBeenCalled();
      expectRejected(res, 401);
    });

    it('returns 401 when the Authorization header is not a Bearer token', async () => {
      const res = getMockResponse();

      await handler(
        getMockRequest({
          headers: {
            [HEADERS.CORRELATION_ID]: 'test-id',
            authorization: 'Basic abc',
          },
          query: { sub: 'victim-sub' },
        }),
        res,
      );

      expectRejected(res, 401);
    });

    it('returns 401 for a forged or invalid token', async () => {
      checkUserLoggedIn.mockResolvedValue(false);
      const res = getMockResponse();

      await handler(getMockRequest({ query: { sub: 'victim-sub' } }), res);

      expect(checkUserLoggedIn).toHaveBeenCalledWith('super-admin-jwt');
      expect(decodeJwt).not.toHaveBeenCalled();
      expectRejected(res, 401);
    });

    it('returns 403 for a valid token without the SUPER_ADMIN role', async () => {
      decodeJwt.mockReturnValue({ roles: '[FIND, APPLICANT, ADMIN]' });
      const res = getMockResponse();

      await handler(getMockRequest({ query: { sub: 'victim-sub' } }), res);

      expectRejected(res, 403);
    });

    it('accepts SUPER_ADMIN when roles is an array', async () => {
      decodeJwt.mockReturnValue({ roles: ['FIND', 'SUPER_ADMIN'] });
      axios.mockResolvedValue({ status: 200 });
      const res = getMockResponse();

      await handler(getMockRequest({ query: { sub: 'a-sub' } }), res);

      expect(axios).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  it('should make request to backend host and successfully delete a user by sub', async () => {
    const axiosResponse = { status: 200 };

    axios.mockResolvedValue(axiosResponse);

    const req = getMockRequest({
      query: {
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    });

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    await handler(req, res);

    expect(axios).toHaveBeenCalledWith({
      method: 'delete',
      url: `${process.env.BACKEND_HOST}/user/delete`,
      params: {
        sub: 'urn:fdc:gov.uk:2022:ibd2rz2CgyidndXyq2zyfcnQwyYI57h34TyuGt87Uhs',
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should make request to backend host and successfully delete a user by email', async () => {
    const axiosResponse = { status: 200 };

    axios.mockResolvedValue(axiosResponse);

    const req = getMockRequest({
      query: {
        email: 'test-user@email.com',
      },
    });

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    await handler(req, res);

    expect(axios).toHaveBeenCalledWith({
      method: 'delete',
      url: `${process.env.BACKEND_HOST}/user/delete`,
      params: {
        email: 'test-user@email.com',
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should make request to backend host and unsuccessfully delete a user', async () => {
    const axiosError = new Error('Simulated Axios Error');
    axiosError.response = {
      status: 500,
      data: { message: 'User Unsuccessfully deleted' },
    };

    axios.mockImplementation(() => {
      throw axiosError;
    });

    const req = getMockRequest({
      query: {
        email: 'test-user@gov.uk',
      },
    });

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };

    await handler(req, res);

    expect(axios).toHaveBeenCalledWith({
      method: 'delete',
      url: `${process.env.BACKEND_HOST}/user/delete`,
      params: {
        email: 'test-user@gov.uk',
      },
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(axiosError.response.data);
  });
});
