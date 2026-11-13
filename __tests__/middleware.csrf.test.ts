/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { csrfSecret } from '../src/utils/csrfMiddleware/secret';
import {
  createSecret,
  createToken,
  utoa,
} from '../src/utils/csrfMiddleware/utils';

jest.mock('../src/service');
jest.mock('../src/utils/csrfMiddleware/secret', () => ({
  csrfSecret: { get: jest.fn() },
}));

const mockGetSecret = csrfSecret.get as jest.Mock;
const HOST = process.env.HOST;
const secret = createSecret(32);

const postFavourite = (body: Record<string, string>) =>
  new NextRequest(`${HOST}/api/favourites/add`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });

describe('Middleware CSRF protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSecret.mockResolvedValue(secret);
  });

  it('should give the search page a CSRF token', async () => {
    const res = await middleware(new NextRequest(`${HOST}/grants`));

    expect(res.status).toBe(200);
    expect(res.headers.get('x-csrf-token')).toBeTruthy();
  });

  it('should still load the search page if the secret cannot be fetched', async () => {
    mockGetSecret.mockRejectedValue(new Error('secrets manager down'));

    const res = await middleware(new NextRequest(`${HOST}/grants`));

    expect(res.status).toBe(200);
    expect(res.headers.get('x-csrf-token')).toBeNull();
  });

  it('should not add a token to other pages', async () => {
    const res = await middleware(new NextRequest(`${HOST}/grants/some-grant`));

    expect(mockGetSecret).not.toHaveBeenCalled();
    expect(res.headers.get('x-csrf-token')).toBeNull();
  });

  it('should let an add favourite request with a valid token through', async () => {
    const token = utoa(await createToken(secret, 8));

    const res = await middleware(
      postFavourite({ _csrf: token, grantId: 'grant123' }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Location')).toBeNull();
  });

  it('should reject an add favourite request with no token', async () => {
    const res = await middleware(postFavourite({ grantId: 'grant123' }));

    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toBe(`${HOST}/grants`);
  });

  it('should reject an add favourite request with a token from another secret', async () => {
    const token = utoa(await createToken(createSecret(32), 8));

    const res = await middleware(
      postFavourite({ _csrf: token, grantId: 'grant123' }),
    );

    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toBe(`${HOST}/grants`);
  });
});
