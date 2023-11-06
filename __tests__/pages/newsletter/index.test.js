import { render, screen } from '@testing-library/react';
import NewsletterLandingPage from '../../../pages/newsletter/index';
import { useRouter } from 'next/router';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {},
}));

const mockRouterBack = jest.fn();

describe('Should Render Newsletter Landing Page', () => {
  beforeAll(() => {
    useRouter.mockReturnValue({
      route: '/',
      prefetch: jest.fn(() => Promise.resolve()),
      back: mockRouterBack,
      push: jest.fn(),
      query: { searchTerm: 'testing' },
    });
  });

  it('Should render all appropriate content', () => {
    render(<NewsletterLandingPage returnParams={{ searchTerm: 'testing' }} />);

    expect(
      screen.getByRole('heading', { name: 'Get updates about new grants' }),
    ).toBeDefined();

    const continueLink = screen.getByRole('link', {
      name: 'Sign up for updates',
    });
    expect(continueLink).toBeDefined();
    expect(continueLink).toHaveAttribute('href', '/newsletter/signup');
    expect(continueLink).toHaveClass('govuk-button');

    const cancelLink = screen.getByRole('link', { name: 'Cancel' });
    expect(cancelLink).toBeDefined();
    expect(cancelLink).toHaveAttribute('href', '/?searchTerm=testing');
    expect(cancelLink).toHaveClass('govuk-link');
  });

  it('Should include skip to main content properties', () => {
    render(<NewsletterLandingPage returnParams={{ href: '/testing' }} />);
    const header = screen.getByRole('heading', {
      name: 'Get updates about new grants',
    });
    expect(header).toBeDefined();
    expect(header).toHaveClass('govuk-heading-l');
    expect(header).toHaveAttribute('id', 'main-content-focus');
    expect(header).toHaveAttribute('tabIndex', '-1');
  });
});
