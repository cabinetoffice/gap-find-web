import { HEADERS } from '../../../src/utils/constants';
import handler from './delete';
import axios from 'axios';

jest.mock('axios');

const getMockRequest = (overrides = {}) => ({
  headers: {
    [HEADERS.CORRELATION_ID]: 'test-id',
  },
  ...overrides,
});

describe('handler', () => {
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
