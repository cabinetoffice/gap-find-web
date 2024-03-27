import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { render } from '@testing-library/react';

export function createMockRouter(
  overrides: Partial<NextRouter> = {},
): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '',
    query: {},
    asPath: '/',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    push: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      ...overrides.events,
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
    ...overrides,
  } as NextRouter;
}

export const renderWithRouter = (
  jsx: React.JSX.Element,
  overrides: object = {},
) => {
  const router = createMockRouter(overrides);
  return {
    ...render(jsx, {
      wrapper: ({ children }) => (
        <RouterContext.Provider value={router}>
          {children}
        </RouterContext.Provider>
      ),
    }),
    router,
  };
};
