import { decryptSignedApiKey, generateSignedApiKey } from './api-key-service';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('generateSignedApiKey', () => {
  it('should generate a signed API key', () => {
    const props = { value: 'a-random-test-string' };

    jwt.sign.mockReturnValue('a-signed-token-string');

    const response = generateSignedApiKey(props);

    expect(jwt.sign).toHaveBeenCalled();
    expect(response).toEqual('a-signed-token-string');
  });
});

describe('subscription manager decrypt signed api key', () => {
  it('should ensure that the jwt verify has been called', async () => {
    decryptSignedApiKey('secret');
    expect(jwt.verify).toBeCalled();
  });

  it('should return an undefined value if the jwt cannot be decoded', async () => {
    const result = decryptSignedApiKey('secret');
    expect(jwt.verify).toBeCalled();
    expect(result).toBe(undefined);
  });
});
