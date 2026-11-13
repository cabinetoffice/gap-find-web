/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import {
  atou,
  createSecret,
  createToken,
  getTokenFromRequest,
  utoa,
  verifyToken,
} from './utils';

const URL = 'http://localhost:3000/api/favourites/add';

describe('csrf utils', () => {
  const secret = createSecret(32);

  it('should verify a token made with the same secret', async () => {
    const token = await createToken(secret, 8);

    expect(await verifyToken(atou(utoa(token)), secret)).toBe(true);
  });

  it('should reject a token made with a different secret', async () => {
    const token = await createToken(createSecret(32), 8);

    expect(await verifyToken(token, secret)).toBe(false);
  });

  it('should reject a token that has been changed', async () => {
    const token = await createToken(secret, 8);
    token[token.length - 1] ^= 1;

    expect(await verifyToken(token, secret)).toBe(false);
  });

  it('should reject a token that is too short', async () => {
    expect(await verifyToken(new Uint8Array(10), secret)).toBe(false);
  });

  it('should read the token from the header', async () => {
    const request = new NextRequest(URL, {
      method: 'POST',
      headers: { 'x-csrf-token': 'header-token' },
    });

    expect(await getTokenFromRequest(request, 'x-csrf-token')).toBe(
      'header-token',
    );
  });

  it('should read the token from a submitted form', async () => {
    const request = new NextRequest(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: 'form-token', grantId: 'g1' }),
    });

    expect(await getTokenFromRequest(request, 'x-csrf-token')).toBe(
      'form-token',
    );
  });

  it('should return an empty token when the form has none', async () => {
    const request = new NextRequest(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grantId: 'g1' }),
    });

    expect(await getTokenFromRequest(request, 'x-csrf-token')).toBe('');
  });
});
