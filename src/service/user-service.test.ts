import { getJwtFromCookies } from '../utils/jwt';
import { getVerifiedJwtFromCookies } from './user-service';

jest.mock('../utils/jwt');

const mockedGetJwtFromCookies = jest.mocked(getJwtFromCookies);

const req = { cookies: { 'user-service-token': 'a.b.c' } } as never;
const token = {
  jwt: 'a.b.c',
  jwtPayload: { sub: 'user-sub', email: 'user@example.com' },
};

const mockUserServiceResponse = (body: unknown, ok = true) =>
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: () => Promise.resolve(body),
  } as Response);

describe('getVerifiedJwtFromCookies', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('returns the token when user-service says it is valid', async () => {
    mockedGetJwtFromCookies.mockReturnValue(token);
    const fetchSpy = mockUserServiceResponse(true);

    const result = await getVerifiedJwtFromCookies(req);

    expect(result).toBe(token);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${process.env.USER_SERVICE_HOST}/is-user-logged-in`,
      { headers: { Cookie: `${process.env.USER_TOKEN_NAME}=a.b.c` } },
    );
  });

  it('returns null for a forged token that user-service rejects', async () => {
    mockedGetJwtFromCookies.mockReturnValue({
      jwt: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ2aWN0aW0ifQ.x',
      jwtPayload: { sub: 'victim', email: 'victim@example.com' },
    });
    mockUserServiceResponse(false);

    await expect(getVerifiedJwtFromCookies(req)).resolves.toBeNull();
  });

  it('returns null without calling user-service when there is no token', async () => {
    mockedGetJwtFromCookies.mockImplementation(() => {
      throw new Error('cookie not found');
    });
    const fetchSpy = mockUserServiceResponse(true);

    await expect(getVerifiedJwtFromCookies(req)).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws when user-service fails, rather than trusting the token', async () => {
    mockedGetJwtFromCookies.mockReturnValue(token);
    mockUserServiceResponse(null, false);

    await expect(getVerifiedJwtFromCookies(req)).rejects.toThrow(
      'failed with response code: 500',
    );
  });
});
