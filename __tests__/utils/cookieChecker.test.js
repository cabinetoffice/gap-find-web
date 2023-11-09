import checkifCookieDoesExist from '../../src/utils/cookieChecker';

import nookies from 'nookies';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

jest.mock('nookies', () => {
  return {
    get: jest.fn(),
  };
});
describe('Cookie Checker functionality for checking specific cookies exist (nookies)', () => {
  it('should work with expected data', async () => {
    let resolvedValue = [];
    resolvedValue['currentEmailAddress'] = 'test@test.com';
    nookies.get.mockReturnValue(resolvedValue);
    expect(checkifCookieDoesExist({}, 'currentEmailAddress')).toEqual(true);
  });
  it('should return false if no cookies are found', () => {
    let resolvedValue = {};
    nookies.get.mockReturnValue(resolvedValue);
    expect(checkifCookieDoesExist({}, 'currentEmailAddress')).toEqual(false);
  });

  it('should return false if a null value is passed', () => {
    let resolvedValue = {};
    nookies.get.mockReturnValue(resolvedValue);
    expect(checkifCookieDoesExist({}, null)).toEqual(false);
  });
});
