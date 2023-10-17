import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import 'urlpattern-polyfill';
import { TextEncoder, TextDecoder } from 'util';

jest.mock('jose', () => ({
  decodeJwt: (jwt) => jwt,
}));

jest.mock('next/config', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      publicRuntimeConfig: {
        host: 'http://localhost:3000',
        userServiceHost: 'http://localhost:8082',
        oneLoginEnabled: true,
      },
    })),
  };
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
