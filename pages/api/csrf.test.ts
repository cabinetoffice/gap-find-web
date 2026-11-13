import { NextApiRequest, NextApiResponse } from 'next';
import csrfHandler from './csrf';

const mockCsrfSecret = 'csrfSecret';

const mockSend = jest.fn();

function mockSecretsManagerClient() {
  return {
    send() {
      return mockSend();
    },
  };
}

jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    ...jest.requireActual('@aws-sdk/client-secrets-manager'),
    SecretsManagerClient: mockSecretsManagerClient,
  };
});

jest.mock('../../src/utils/constants', () => ({
  ...jest.requireActual('../../src/utils/constants'),
  IS_PRODUCTION: true,
}));

const getResponse = (overrides = {}) =>
  ({
    redirect: jest.fn(),
    status: jest.fn(function () {
      return this;
    }),
    json: jest.fn(function () {
      return this;
    }),
    end: jest.fn(),
    ...overrides,
  }) as unknown as NextApiResponse;

describe('/api/csrf', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockReturnValue({
      SecretString: JSON.stringify({ csrfSecret: mockCsrfSecret }),
    });
  });

  it('responds 500 when the secret cannot be fetched', async () => {
    mockSend.mockRejectedValue(new Error('secrets manager down'));
    const req = {
      headers: { host: 'localhost:3000', 'x-forwarded-for': '::1' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('responds with 200 and expected payload to request from expected local address', async () => {
    const req = {
      headers: { host: 'localhost:3000', 'x-forwarded-for': '::1' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ secret: mockCsrfSecret });
  });

  it('responds 404 when host header not localhost:3000', async () => {
    const req = {
      headers: { host: 'https://www.google.com', 'x-forwarded-for': '::1' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalled();
  });

  it('responds 404 when x-forwarded-for header not ::1', async () => {
    const req = {
      headers: { host: 'localhost:3000', 'x-forwarded-for': '1.2.3.4' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalled();
  });
});
