import cookieExistsAndContainsValidJwt, {
  hasValidJwt,
} from '../../src/utils/cookieAndJwtChecker';
import jwt from 'jsonwebtoken';
import nookies from 'nookies';

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
  };
});

jest.mock('jsonwebtoken');

describe('cookieExistsAndContainsValidJwt', () => {
  it('should return true if a cookie exists and contains a valid JWT', () => {
    const cookies = [];
    cookies['currentEmailAddress'] = 'test@test.com';

    nookies.get.mockReturnValue(cookies);

    jwt.verify.mockReturnValue(true);

    expect(cookieExistsAndContainsValidJwt({}, 'currentEmailAddress')).toEqual(
      true,
    );
  });

  it('should return false if a cookie exists but the contained token is invalid', () => {
    const cookies = [];
    cookies['currentEmailAddress'] = 'test@test.com';

    nookies.get.mockReturnValue(cookies);
    jwt.verify.mockReturnValue(false);

    expect(cookieExistsAndContainsValidJwt({}, 'currentEmailAddress')).toEqual(
      false,
    );
  });

  it('should return false if the expected cookie does not exist', () => {
    const cookies = [];
    nookies.get.mockReturnValue(cookies);

    expect(cookieExistsAndContainsValidJwt({}, 'currentEmailAddress')).toEqual(
      false,
    );
  });

  it('should make a call to the callback function if a cookie exists', () => {
    const cookies = [];
    cookies['currentEmailAddress'] = 'test@test.com';

    nookies.get.mockReturnValue(cookies);

    jwt.verify.mockReturnValue(true);

    expect(cookieExistsAndContainsValidJwt({}, 'currentEmailAddress')).toEqual(
      true,
    );
    expect(jwt.verify).toHaveBeenLastCalledWith(
      cookies['currentEmailAddress'],
      process.env.JWT_SECRET_KEY,
      hasValidJwt,
    );
  });
});

describe('hasValidJwt', () => {
  it('should return true if error param does not exist', () => {
    expect(hasValidJwt(undefined)).toBeTruthy();
  });

  it('should return false if error param does not exist', () => {
    const err = {
      message: 'error',
    };
    expect(hasValidJwt(err)).toBeFalsy();
  });
});
