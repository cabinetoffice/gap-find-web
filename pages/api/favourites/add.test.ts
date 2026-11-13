import { NextApiRequest, NextApiResponse } from 'next';
import {
  addFavourite,
  getFavouriteUserFromRequest,
} from '../../../src/service/favourite-service';
import { checkUserLoggedIn } from '../../../src/service/user-service';
import handler, { buildReturnUrl } from './add';

jest.mock('../../../src/service/favourite-service', () => ({
  addFavourite: jest.fn(),
  getFavouriteUserFromRequest: jest.fn(),
}));
jest.mock('../../../src/service/user-service', () => ({
  checkUserLoggedIn: jest.fn(),
}));
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    utils: { addErrorInfo: jest.fn((error) => error) },
  },
}));

const mockAddFavourite = addFavourite as jest.Mock;
const mockGetUser = getFavouriteUserFromRequest as jest.Mock;
const mockCheckUserLoggedIn = checkUserLoggedIn as jest.Mock;

const SEARCH_REFERER =
  'https://find.example/grants?searchTerm=farming&page=2&sortBy=closingDate';

const getRequest = (overrides: Partial<NextApiRequest> = {}) =>
  ({
    method: 'POST',
    body: { grantId: 'grant123', searchTerm: 'farming' },
    headers: { referer: SEARCH_REFERER },
    ...overrides,
  }) as NextApiRequest;

const getResponse = () => {
  const res = {
    status: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
    redirect: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as NextApiResponse & typeof res;
};

describe('add favourite handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, APPLICANT_HOST: 'https://apply.example' };
    mockGetUser.mockReturnValue({
      jwt: 'user-jwt',
      sub: 'user-sub',
      email: 'test@test.com',
    });
    mockCheckUserLoggedIn.mockResolvedValue(true);
    mockAddFavourite.mockResolvedValue({ id: 1 });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should add the favourite and return to the same search results', async () => {
    const res = getResponse();

    await handler(getRequest(), res);

    expect(mockCheckUserLoggedIn).toHaveBeenCalledWith('user-jwt');
    expect(mockAddFavourite).toHaveBeenCalledWith({
      sub: 'user-sub',
      emailAddress: 'test@test.com',
      contentfulGrantId: 'grant123',
    });
    expect(res.redirect).toHaveBeenCalledWith(
      303,
      '/grants?searchTerm=farming&page=2&sortBy=closingDate&favouriteAdded=grant123',
    );
  });

  it('should only accept POST', async () => {
    const res = getResponse();

    await handler(getRequest({ method: 'GET' }), res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  it('should send a user with no login cookie to sign in', async () => {
    mockGetUser.mockReturnValue(null);
    const res = getResponse();

    await handler(getRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith(303, 'https://apply.example');
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  it('should send a user whose session has ended to sign in', async () => {
    mockCheckUserLoggedIn.mockResolvedValue(false);
    const res = getResponse();

    await handler(getRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith(303, 'https://apply.example');
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  it('should send the user to sign in when the login check fails', async () => {
    mockCheckUserLoggedIn.mockRejectedValue(new Error('user service down'));
    const res = getResponse();

    await handler(getRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith(303, 'https://apply.example');
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  it.each([undefined, '', '   ', 'not a valid id!', 'a'.repeat(65)])(
    'should not add a favourite for grant ID %p',
    async (grantId) => {
      const res = getResponse();

      await handler(getRequest({ body: { grantId } }), res);

      expect(mockAddFavourite).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        303,
        '/grants?searchTerm=farming&page=2&sortBy=closingDate',
      );
    },
  );

  it('should return to the search results with an error when adding fails', async () => {
    mockAddFavourite.mockRejectedValue(new Error('backend down'));
    const res = getResponse();

    await handler(getRequest(), res);

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      '/grants?searchTerm=farming&page=2&sortBy=closingDate&favouriteError=grant123',
    );
  });
});

describe('buildReturnUrl', () => {
  it('should keep the search query from the search page', () => {
    expect(buildReturnUrl('https://find.example/grants?searchTerm=a')).toBe(
      '/grants?searchTerm=a',
    );
  });

  it('should replace any earlier favourite result', () => {
    expect(
      buildReturnUrl(
        'https://find.example/grants?searchTerm=a&favouriteAdded=old&favouriteError=old',
        { param: 'favouriteAdded', grantId: 'new' },
      ),
    ).toBe('/grants?searchTerm=a&favouriteAdded=new');
  });

  it.each([
    undefined,
    'not a url',
    'https://evil.example/somewhere?x=1',
    'https://find.example//evil.example/grants',
    'https://find.example/grants/some-grant',
  ])('should go to the plain search page for referer %p', (referer) => {
    expect(buildReturnUrl(referer)).toBe('/grants');
  });
});
