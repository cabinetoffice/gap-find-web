import { axios } from '../utils/axios';
import { getJwtFromCookies } from '../utils/jwt';
import {
  addFavourite,
  getFavouriteGrantIds,
  getFavouriteGrantIdsForRequest,
  getFavouriteUserFromRequest,
} from './favourite-service';

jest.mock('../utils/axios', () => ({
  axios: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('../utils/jwt', () => ({ getJwtFromCookies: jest.fn() }));
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    utils: { addErrorInfo: jest.fn((error) => error) },
  },
}));

const mockGet = axios.get as jest.Mock;
const mockPost = axios.post as jest.Mock;
const mockGetJwtFromCookies = getJwtFromCookies as jest.Mock;

const req = { cookies: {}, headers: {} } as never;

describe('favourite-service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BACKEND_HOST: 'http://backend',
      ONE_LOGIN_ENABLED: 'true',
    };
    mockGetJwtFromCookies.mockReturnValue({
      jwt: 'user-jwt',
      jwtPayload: { sub: 'user-sub', email: 'test@test.com' },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getFavouriteUserFromRequest', () => {
    it('should return the user from the cookie', () => {
      expect(getFavouriteUserFromRequest(req)).toStrictEqual({
        jwt: 'user-jwt',
        sub: 'user-sub',
        email: 'test@test.com',
      });
    });

    it('should return null when One Login is not enabled', () => {
      process.env.ONE_LOGIN_ENABLED = 'false';

      expect(getFavouriteUserFromRequest(req)).toBeNull();
      expect(mockGetJwtFromCookies).not.toHaveBeenCalled();
    });

    it('should return null when there is no request', () => {
      expect(getFavouriteUserFromRequest(undefined)).toBeNull();
    });

    it('should return null when there is no valid cookie', () => {
      mockGetJwtFromCookies.mockImplementation(() => {
        throw new Error('no cookie');
      });

      expect(getFavouriteUserFromRequest(req)).toBeNull();
    });

    it.each([
      ['sub', { email: 'test@test.com' }],
      ['email', { sub: 'user-sub' }],
    ])('should return null when the token has no %s', (_, jwtPayload) => {
      mockGetJwtFromCookies.mockReturnValue({ jwt: 'user-jwt', jwtPayload });

      expect(getFavouriteUserFromRequest(req)).toBeNull();
    });
  });

  describe('addFavourite', () => {
    it('should post the favourite to the backend', async () => {
      mockPost.mockResolvedValue({ data: { id: 1 } });

      const result = await addFavourite({
        sub: 'user-sub',
        emailAddress: 'test@test.com',
        contentfulGrantId: 'grant-1',
      });

      expect(mockPost).toHaveBeenCalledWith('http://backend/favourites', {
        sub: 'user-sub',
        emailAddress: 'test@test.com',
        contentfulGrantId: 'grant-1',
      });
      expect(result).toStrictEqual({ id: 1 });
    });
  });

  describe('getFavouriteGrantIds', () => {
    it('should return the grant IDs for the user', async () => {
      mockGet.mockResolvedValue({
        data: [{ contentfulGrantId: 'grant-1' }, { contentfulGrantId: 'g-2' }],
      });

      const result = await getFavouriteGrantIds('urn:user/sub');

      expect(mockGet).toHaveBeenCalledWith(
        'http://backend/favourites/users/urn%3Auser%2Fsub',
      );
      expect(result).toStrictEqual(['grant-1', 'g-2']);
    });
  });

  describe('getFavouriteGrantIdsForRequest', () => {
    it('should return the logged-in user’s favourite grant IDs', async () => {
      mockGet.mockResolvedValue({ data: [{ contentfulGrantId: 'grant-1' }] });

      const result = await getFavouriteGrantIdsForRequest(req);

      expect(mockGet).toHaveBeenCalledWith(
        'http://backend/favourites/users/user-sub',
      );
      expect(result).toStrictEqual(['grant-1']);
    });

    it('should return an empty list when nobody is logged in', async () => {
      process.env.ONE_LOGIN_ENABLED = 'false';

      const result = await getFavouriteGrantIdsForRequest(req);

      expect(mockGet).not.toHaveBeenCalled();
      expect(result).toStrictEqual([]);
    });

    it('should return an empty list when the backend fails', async () => {
      mockGet.mockRejectedValue(new Error('backend down'));

      const result = await getFavouriteGrantIdsForRequest(req);

      expect(result).toStrictEqual([]);
    });
  });
});
