import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import 'urlpattern-polyfill';
import { TextEncoder, TextDecoder } from 'util';

jest.mock('jose', () => ({
  decodeJwt: (jwt) => jwt,
}));

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
  serverRuntimeConfig: {},
}));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
